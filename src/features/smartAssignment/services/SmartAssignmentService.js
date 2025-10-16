/**
 * Smart Assignment Service
 * Orchestrates data from multiple modules to create intelligent flight assignments
 *
 * THE KILLER FEATURE!
 * Combines expiry tracking, consumption prediction, and productivity optimization
 */

import { ExpirationBusinessLogic } from '../../expiration';
import { ConsumptionBusinessLogic } from '../../consumption';
import { ProductivityBusinessLogic } from '../../productivity';

export class SmartAssignmentService {
  /**
   * Generate smart flight assignment by orchestrating all modules
   * @param {Object} flight - Flight details
   * @param {Array} expiryProducts - Products from expiration module
   * @param {Array} consumptionData - Flight items from consumption module
   * @param {Array} productivityData - Drawers from productivity module (optional)
   * @returns {Object} Smart assignment with recommendations
   */
  static generateAssignment(flight, expiryProducts, consumptionData, productivityData = []) {
    const recommendations = [];

    // Get products for this flight from consumption data
    const flightProducts = ConsumptionBusinessLogic.getFlightItems(consumptionData, flight.Flight_ID);

    flightProducts.forEach(product => {
      const recommendation = this.analyzeProduct(
        product,
        flight,
        expiryProducts,
        consumptionData
      );

      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // Sort by total impact (savings + waste prevention)
    recommendations.sort((a, b) => b.financial_impact.total - a.financial_impact.total);

    // Calculate flight summary
    const summary = this.calculateFlightSummary(recommendations, flight, productivityData);

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
   * @private
   */
  static analyzeProduct(product, flight, expiryProducts, consumptionData) {
    const productId = product.Product_ID;

    // Step 1: Get consumption prediction using business logic
    const prediction = ConsumptionBusinessLogic.predictConsumption(
      consumptionData,
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
    let daysUntilExpiry = null;

    // Consumption factor
    factors.push({
      type: 'Consumption',
      description: `Historical data shows ${prediction.avg_consumption_rate}% consumption rate`,
      impact: prediction.avg_consumption_rate
    });

    // Expiry factor
    if (nearExpiryLots.length > 0) {
      // Find the lot expiring soonest
      const soonestLot = nearExpiryLots.reduce((soonest, current) =>
        current.Days_Until_Expiry < soonest.Days_Until_Expiry ? current : soonest
      );

      if (soonestLot.Days_Until_Expiry <= 2) {
        // CRITICAL: Use near-expiry lot
        useNearExpiry = true;
        selectedLot = soonestLot.LOT_Number;
        daysUntilExpiry = soonestLot.Days_Until_Expiry;

        factors.push({
          type: 'Expiry',
          description: `LOT ${selectedLot} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} - CRITICAL`,
          alert: 'CRITICAL',
          impact: 100
        });
      } else if (soonestLot.Days_Until_Expiry <= 7) {
        // WARNING: Consider using near-expiry lot
        if (prediction.avg_consumption_rate >= 70) {
          // High consumption - safe to use near-expiry
          useNearExpiry = true;
          selectedLot = soonestLot.LOT_Number;
          daysUntilExpiry = soonestLot.Days_Until_Expiry;

          factors.push({
            type: 'Expiry',
            description: `LOT ${selectedLot} expires in ${daysUntilExpiry} days - good match for high consumption flight`,
            alert: 'WARNING',
            impact: 75
          });
        }
      }
    }

    // Step 4: Calculate financial impact
    const financialImpact = this.calculateFinancialImpact(
      product,
      prediction,
      useNearExpiry,
      daysUntilExpiry
    );

    // Step 5: Determine recommended quantity
    let recommendedQty = prediction.predicted_qty;
    let quantityChange = prediction.difference;

    if (useNearExpiry) {
      // If using near-expiry, adjust quantity based on lot availability
      const lot = nearExpiryLots.find(l => l.LOT_Number === selectedLot);
      if (lot && lot.Quantity < recommendedQty) {
        recommendedQty = lot.Quantity;
        quantityChange = recommendedQty - product.Standard_Specification_Qty;

        factors.push({
          type: 'Inventory',
          description: `Limited to ${lot.Quantity} units available in LOT ${selectedLot}`,
          impact: 50
        });
      }
    }

    return {
      product_id: productId,
      product_name: product.Product_Name,
      standard_qty: product.Standard_Specification_Qty,
      recommended_qty: recommendedQty,
      quantity_change: quantityChange,
      use_near_expiry: useNearExpiry,
      selected_lot: selectedLot,
      days_until_expiry: daysUntilExpiry,
      factors: factors,
      financial_impact: financialImpact,
      total_impact: financialImpact.total
    };
  }

  /**
   * Calculate financial impact of assignment
   * @private
   */
  static calculateFinancialImpact(product, prediction, useNearExpiry, daysUntilExpiry) {
    const unitCost = product.Unit_Cost || 1.5;

    let wastePrevented = 0;
    let consumptionSavings = 0;

    // Waste prevented by using near-expiry
    if (useNearExpiry) {
      wastePrevented = (daysUntilExpiry <= 2) ? unitCost * prediction.predicted_qty : 0;
    }

    // Consumption savings from better quantity prediction
    if (prediction.difference < 0) {
      // Reducing quantity
      consumptionSavings = Math.abs(prediction.difference) * unitCost * 0.3; // 30% of cost (waste factor)
    }

    const total = wastePrevented + consumptionSavings;

    return {
      waste_prevented: Math.round(wastePrevented * 100) / 100,
      consumption_savings: Math.round(consumptionSavings * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Calculate flight summary
   * @private
   */
  static calculateFlightSummary(recommendations, flight, productivityData) {
    const totalSavings = recommendations.reduce(
      (sum, r) => sum + r.financial_impact.total, 0
    );

    const nearExpiryUsed = recommendations.filter(r => r.use_near_expiry).length;

    const criticalItems = recommendations.filter(r =>
      r.factors.some(f => f.alert === 'CRITICAL')
    ).length;

    // Calculate assembly time impact (simplified)
    let assemblyTimeChange = 0;
    if (productivityData.length > 0) {
      // If we have productivity data, estimate impact
      const avgDrawerTime = ProductivityBusinessLogic.getTotalTime(productivityData) * 60 / productivityData.length;
      assemblyTimeChange = Math.round((recommendations.length * 0.1) - 2); // Simplified estimate
    }

    // Determine status
    let status = 'OPTIMIZED';
    if (criticalItems > 0) {
      status = 'CRITICAL_WASTE_PREVENTION';
    } else if (nearExpiryUsed > 0) {
      status = 'WASTE_PREVENTION';
    }

    return {
      total_products: recommendations.length,
      total_savings: Math.round(totalSavings * 100) / 100,
      near_expiry_items_used: nearExpiryUsed,
      critical_items: criticalItems,
      assembly_time_change: assemblyTimeChange,
      status: status
    };
  }
}
