/**
 * Consumption Business Logic
 * All calculations and analysis for consumption module
 * Pure business logic - can be used on frontend or backend
 */

export class ConsumptionBusinessLogic {
  /**
   * Get unique flights from consumption data
   * @param {Array} flights - Array of flight items
   * @returns {Array} Unique flights with basic info
   */
  static getUniqueFlights(flights) {
    const flightMap = new Map();

    flights.forEach(item => {
      if (!flightMap.has(item.Flight_ID)) {
        flightMap.set(item.Flight_ID, {
          Flight_ID: item.Flight_ID,
          Origin: item.Origin,
          Date: item.Date,
          Flight_Type: item.Flight_Type,
          Service_Type: item.Service_Type,
          Passenger_Count: item.Passenger_Count
        });
      }
    });

    return Array.from(flightMap.values());
  }

  /**
   * Get items for a specific flight
   * @param {Array} flights - Array of flight items
   * @param {string} flightId - Flight ID to filter
   * @returns {Array} Items for the specified flight
   */
  static getFlightItems(flights, flightId) {
    return flights.filter(item => item.Flight_ID === flightId);
  }

  /**
   * Get consumption pattern for a product across all flights
   * @param {Array} flights - Array of flight items
   * @param {string} productId - Product ID
   * @returns {Object|null} Product consumption pattern
   */
  static getProductPattern(flights, productId) {
    const productFlights = flights.filter(item => item.Product_ID === productId);

    if (productFlights.length === 0) return null;

    const totalConsumed = productFlights.reduce((sum, f) => sum + f.Quantity_Consumed, 0);
    const totalStandard = productFlights.reduce((sum, f) => sum + f.Standard_Specification_Qty, 0);
    const avgConsumptionRate = Math.round((totalConsumed / totalStandard) * 100);

    return {
      product_id: productId,
      product_name: productFlights[0].Product_Name,
      flights_count: productFlights.length,
      avg_consumption_rate: avgConsumptionRate,
      total_waste: productFlights.reduce((sum, f) => sum + f.Waste_Cost, 0)
    };
  }

  /**
   * Get products with high waste (low consumption rate)
   * @param {Array} flights - Array of flight items
   * @param {number} threshold - Waste threshold (default: 70%)
   * @returns {Array} Products with high waste
   */
  static getHighWasteProducts(flights, threshold = 70) {
    const productMap = new Map();

    // Group by product
    flights.forEach(item => {
      if (!productMap.has(item.Product_ID)) {
        productMap.set(item.Product_ID, []);
      }
      productMap.get(item.Product_ID).push(item);
    });

    // Calculate avg consumption rate for each product
    const products = [];
    productMap.forEach((items, productId) => {
      const totalConsumed = items.reduce((sum, i) => sum + i.Quantity_Consumed, 0);
      const totalStandard = items.reduce((sum, i) => sum + i.Standard_Specification_Qty, 0);
      const avgRate = Math.round((totalConsumed / totalStandard) * 100);
      const totalWaste = items.reduce((sum, i) => sum + i.Waste_Cost, 0);

      if (avgRate < threshold) {
        products.push({
          product_id: productId,
          product_name: items[0].Product_Name,
          avg_consumption_rate: avgRate,
          total_waste: totalWaste,
          flights_count: items.length
        });
      }
    });

    return products.sort((a, b) => b.total_waste - a.total_waste);
  }

  /**
   * Get products with stockout risk
   * @param {Array} flights - Array of flight items
   * @returns {Array} Products that frequently run out
   */
  static getStockoutRiskProducts(flights) {
    // Find products with "ran out" feedback
    const riskProducts = flights.filter(item =>
      item.Crew_Feedback &&
      (item.Crew_Feedback.toLowerCase().includes('ran out') ||
       item.Crew_Feedback.toLowerCase().includes('insufficient'))
    );

    // Group and count occurrences
    const productMap = new Map();
    riskProducts.forEach(item => {
      const key = item.Product_ID;
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_id: item.Product_ID,
          product_name: item.Product_Name,
          count: 0,
          avg_consumption_rate: 0
        });
      }
      productMap.get(key).count++;
    });

    // Calculate avg consumption rate for stockout products
    productMap.forEach((value, productId) => {
      const productFlights = flights.filter(f => f.Product_ID === productId);
      const totalConsumed = productFlights.reduce((sum, f) => sum + f.Quantity_Consumed, 0);
      const totalStandard = productFlights.reduce((sum, f) => sum + f.Standard_Specification_Qty, 0);
      value.avg_consumption_rate = Math.round((totalConsumed / totalStandard) * 100);
      value.ran_out_early_count = value.count;
    });

    return Array.from(productMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Get waste statistics
   * @param {Array} flights - Array of flight items
   * @returns {Object} Waste statistics
   */
  getWasteStats(flights) {
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const total_waste_cost = flights.reduce((sum, f) => {
    const line = toNum(f.Quantity_Returned) * toNum(f.Unit_Cost);
    return sum + line;
  }, 0);

  const total_returned_units = flights.reduce((sum, f) => sum + toNum(f.Quantity_Returned), 0);

  const consumed = flights.reduce((s, f) => s + toNum(f.Quantity_Consumed), 0);
  const std = flights.reduce((s, f) => s + toNum(f.Standard_Specification_Qty), 0);
  const overall_consumption_rate = std ? Math.round((consumed / std) * 100) : 0;

  const unique_flights = new Set(flights.map(f => f.Flight_ID)).size;

  return {
    total_waste_cost,
    total_returned_units,
    overall_consumption_rate,
    unique_flights
  };
}


  /**
   * Predict consumption for a product on a specific flight type
   * @param {Array} flights - Array of flight items
   * @param {string} productId - Product ID
   * @param {string} flightType - Flight type
   * @param {number} standardQty - Standard quantity
   * @returns {Object} Consumption prediction
   */
  static predictConsumption(flights, productId, flightType, standardQty) {
    // Find similar flights (same product + flight type)
    const similarFlights = flights.filter(
      f => f.Product_ID === productId && f.Flight_Type === flightType
    );

    if (similarFlights.length === 0) {
      // No data, return standard qty
      return {
        predicted_qty: standardQty,
        difference: 0,
        avg_consumption_rate: 100,
        confidence: 'low',
        recommendation: 'No historical data available - maintain standard quantity',
        based_on_flights: 0
      };
    }

    // Calculate average consumption rate
    const totalConsumed = similarFlights.reduce((sum, f) => sum + f.Quantity_Consumed, 0);
    const totalStandard = similarFlights.reduce((sum, f) => sum + f.Standard_Specification_Qty, 0);
    const avgRate = totalConsumed / totalStandard;

    const predictedQty = Math.round(standardQty * avgRate);
    const difference = predictedQty - standardQty;

    let recommendation = 'Maintain current quantity';
    if (difference < -10) {
      recommendation = `Reduce by ${Math.abs(difference)} units to minimize waste`;
    } else if (difference > 10) {
      recommendation = `Increase by ${difference} units to prevent stockouts`;
    }

    return {
      predicted_qty: predictedQty,
      difference: difference,
      avg_consumption_rate: Math.round(avgRate * 100),
      confidence: similarFlights.length >= 3 ? 'high' : 'medium',
      recommendation: recommendation,
      based_on_flights: similarFlights.length
    };
  }

  /**
   * Get products by waste category
   * @param {Array} flights - Array of flight items
   * @returns {Object} Products grouped by waste level
   */
  static groupByWasteCategory(flights) {
    const highWaste = this.getHighWasteProducts(flights, 70);
    const moderateWaste = this.getHighWasteProducts(flights, 85).filter(p => p.avg_consumption_rate >= 70);
    const stockoutRisk = this.getStockoutRiskProducts(flights);

    return {
      highWaste,
      moderateWaste,
      stockoutRisk
    };
  }

  /**
   * Calculate potential savings if waste is reduced
   * @param {Array} flights - Array of flight items
   * @param {number} reductionPercentage - Target waste reduction (default: 50%)
   * @returns {Object} Savings projection
   */
  static calculatePotentialSavings(flights, reductionPercentage = 50) {
    const stats = this.getWasteStats(flights);
    const weeklySavings = (stats.total_waste_cost * reductionPercentage) / 100;
    const monthlySavings = weeklySavings * 4;
    const annualSavings = weeklySavings * 52;

    return {
      current_weekly_waste: stats.total_waste_cost,
      target_reduction_percentage: reductionPercentage,
      weekly_savings: Math.round(weeklySavings * 100) / 100,
      monthly_savings: Math.round(monthlySavings * 100) / 100,
      annual_savings: Math.round(annualSavings * 100) / 100
    };
  }
}
