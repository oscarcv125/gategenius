/**
 * Smart Flight Assignment Algorithm
 * Owner: Abel (algorithm) + Oscar (UI integration)
 *
 * THE KILLER FEATURE!
 *
 * This algorithm combines all 3 modules to create intelligent flight assignments:
 * 1. Expiry Module: Products expiring soon
 * 2. Consumption Module: Predicted consumption patterns
 * 3. Productivity Module: Assembly time impact
 *
 * Result: Assign near-expiry products to flights with high consumption predictions
 */

/**
 * Generate smart recommendations for a specific flight
 * @param {Object} flight - Flight details
 * @param {Array} expiryProducts - Products from expiry store
 * @param {Array} consumptionData - Historical consumption data
 * @param {Function} predictConsumption - Consumption prediction function
 * @returns {Object} Smart recommendations with reasons
 */
export function generateSmartFlightAssignment(
  flight,
  expiryProducts,
  consumptionData,
  predictConsumption
) {
  const recommendations = [];

  // Get products for this flight from historical data
  const flightProducts = getFlightProductList(flight, consumptionData);

  flightProducts.forEach(product => {
    const recommendation = analyzeProduct(
      product,
      flight,
      expiryProducts,
      consumptionData,
      predictConsumption
    );

    if (recommendation) {
      recommendations.push(recommendation);
    }
  });

  // Sort by impact (savings + waste prevention)
  recommendations.sort((a, b) => b.total_impact - a.total_impact);

  // Calculate total flight summary
  const summary = calculateFlightSummary(recommendations, flight);

  return {
    flight_id: flight.Flight_ID,
    origin: flight.Origin,
    flight_type: flight.Flight_Type,
    passenger_count: flight.Passenger_Count,
    recommendations: recommendations,
    summary: summary
  };
}

/**
 * Analyze a single product for smart assignment
 */
function analyzeProduct(product, flight, expiryProducts, consumptionData, predictConsumption) {
  const productId = product.Product_ID;

  // Step 1: Get consumption prediction
  const prediction = predictConsumption(
    productId,
    flight.Flight_Type,
    product.Standard_Specification_Qty
  );

  // Step 2: Find near-expiry lots for this product
  const nearExpiryLots = expiryProducts.filter(
    p => p.Product_ID === productId && p.Days_Until_Expiry <= 7
  );

  // Step 3: Calculate impact factors
  const factors = [];
  let useNearExpiry = false;
  let selectedLot = null;

  // Consumption factor
  factors.push({
    type: 'Consumption',
    description: `History shows ${prediction.avg_consumption_rate}% consumption rate`,
    impact: prediction.avg_consumption_rate
  });

  // Expiry factor
  if (nearExpiryLots.length > 0) {
    // Find the lot expiring soonest
    const soonestLot = nearExpiryLots.reduce((soonest, current) =>
      current.Days_Until_Expiry < soonest.Days_Until_Expiry ? current : soonest
    );

    if (soonestLot.Days_Until_Expiry <= 2) {
      // Critical - use this lot!
      useNearExpiry = true;
      selectedLot = soonestLot;
      factors.push({
        type: 'Expiry',
        description: `${soonestLot.LOT_Number} expires in ${soonestLot.Days_Until_Expiry} days`,
        impact: 100,
        alert: 'CRITICAL'
      });
    } else {
      // Warning - consider using
      useNearExpiry = prediction.avg_consumption_rate >= 70; // Only if good consumption
      selectedLot = soonestLot;
      factors.push({
        type: 'Expiry',
        description: `${soonestLot.LOT_Number} expires in ${soonestLot.Days_Until_Expiry} days`,
        impact: 50,
        alert: 'WARNING'
      });
    }
  } else {
    factors.push({
      type: 'Expiry',
      description: 'No near-expiry lots - use standard stock',
      impact: 0
    });
  }

  // Productivity factor
  const qtyDifference = prediction.predicted_qty - product.Standard_Specification_Qty;
  const timeImpact = Math.abs(qtyDifference) * 0.1; // 0.1 min per item

  factors.push({
    type: 'Productivity',
    description: qtyDifference === 0
      ? 'No change to assembly time'
      : `${qtyDifference > 0 ? 'Add' : 'Save'} ${Math.abs(timeImpact).toFixed(1)} min assembly time`,
    impact: qtyDifference
  });

  // Calculate total impact ($)
  const wastePrevented = useNearExpiry && selectedLot
    ? Math.min(prediction.predicted_qty, selectedLot.Quantity) * (product.Unit_Cost || 0.5)
    : 0;

  const consumptionSavings = qtyDifference < 0
    ? Math.abs(qtyDifference) * (product.Unit_Cost || 0.5)
    : 0;

  const totalImpact = wastePrevented + consumptionSavings;

  // Generate recommendation
  return {
    product_id: productId,
    product_name: product.Product_Name,
    standard_qty: product.Standard_Specification_Qty,
    recommended_qty: prediction.predicted_qty,
    quantity_change: qtyDifference,
    use_near_expiry: useNearExpiry,
    selected_lot: useNearExpiry ? selectedLot?.LOT_Number : null,
    days_until_expiry: selectedLot?.Days_Until_Expiry || null,
    factors: factors,
    financial_impact: {
      waste_prevented: wastePrevented,
      consumption_savings: consumptionSavings,
      total: totalImpact
    },
    total_impact: totalImpact, // For sorting
    confidence: prediction.confidence
  };
}

/**
 * Get list of products typically loaded on similar flights
 */
function getFlightProductList(flight, consumptionData) {
  // Find similar flights
  const similarFlights = consumptionData.filter(
    item => item.Flight_Type === flight.Flight_Type
  );

  // Group by product, get unique products with their standard quantities
  const productMap = new Map();

  similarFlights.forEach(item => {
    if (!productMap.has(item.Product_ID)) {
      productMap.set(item.Product_ID, {
        Product_ID: item.Product_ID,
        Product_Name: item.Product_Name,
        Standard_Specification_Qty: item.Standard_Specification_Qty,
        Unit_Cost: item.Unit_Cost
      });
    }
  });

  return Array.from(productMap.values());
}

/**
 * Calculate summary for the entire flight
 */
function calculateFlightSummary(recommendations, flight) {
  const totalSavings = recommendations.reduce(
    (sum, r) => sum + r.financial_impact.total,
    0
  );

  const nearExpiryItemsUsed = recommendations
    .filter(r => r.use_near_expiry)
    .reduce((sum, r) => sum + r.recommended_qty, 0);

  const totalTimeChange = recommendations.reduce(
    (sum, r) => sum + (r.quantity_change * 0.1),
    0
  );

  const criticalItems = recommendations.filter(
    r => r.days_until_expiry !== null && r.days_until_expiry <= 2
  );

  return {
    total_products: recommendations.length,
    total_savings: Math.round(totalSavings * 100) / 100,
    near_expiry_items_used: nearExpiryItemsUsed,
    assembly_time_change: Math.round(totalTimeChange * 10) / 10,
    critical_items_count: criticalItems.length,
    status: criticalItems.length > 0 ? 'CRITICAL_WASTE_PREVENTION' : 'OPTIMIZED'
  };
}

/**
 * Find best flight for a specific expiring product
 * @param {Object} expiringProduct - Product expiring soon
 * @param {Array} upcomingFlights - List of upcoming flights
 * @param {Array} consumptionData - Historical consumption data
 * @returns {Object} Best matching flight
 */
export function findBestFlightForProduct(expiringProduct, upcomingFlights, consumptionData) {
  // Find historical consumption rates for this product across different flight types
  const productHistory = consumptionData.filter(
    item => item.Product_ID === expiringProduct.Product_ID
  );

  // Group by flight type and calculate avg consumption
  const consumptionByType = {};

  productHistory.forEach(item => {
    const type = item.Flight_Type;
    if (!consumptionByType[type]) {
      consumptionByType[type] = { consumed: 0, standard: 0, count: 0 };
    }
    consumptionByType[type].consumed += item.Quantity_Consumed;
    consumptionByType[type].standard += item.Standard_Specification_Qty;
    consumptionByType[type].count++;
  });

  // Calculate rates
  Object.keys(consumptionByType).forEach(type => {
    const data = consumptionByType[type];
    data.rate = data.consumed / data.standard;
  });

  // Find upcoming flight with highest consumption rate for this product
  let bestFlight = null;
  let highestRate = 0;

  upcomingFlights.forEach(flight => {
    const rate = consumptionByType[flight.Flight_Type]?.rate || 0;
    if (rate > highestRate) {
      highestRate = rate;
      bestFlight = flight;
    }
  });

  return {
    product: expiringProduct,
    best_flight: bestFlight,
    consumption_rate: Math.round(highestRate * 100),
    quantity_to_assign: Math.min(
      expiringProduct.Quantity,
      Math.round(bestFlight ? 200 : 0) // Estimate
    ),
    reason: `This flight type has ${Math.round(highestRate * 100)}% consumption rate for this product`
  };
}
