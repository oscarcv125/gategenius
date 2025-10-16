/**
 * Consumption Calculations
 * Pure utility functions for consumption-related calculations
 */

/**
 * Calculate consumption rate for a flight item
 * @param {Object} item - Flight item with Standard_Specification_Qty and Quantity_Returned
 * @returns {number} Consumption rate as percentage (0-100)
 */
export const calculateConsumptionRate = (item) => {
  const standard = parseInt(item.Standard_Specification_Qty) || 0;
  const returned = parseInt(item.Quantity_Returned) || 0;

  if (standard === 0) return 0;

  const consumed = standard - returned;
  const rate = (consumed / standard) * 100;

  return Math.round(rate);
};

/**
 * Calculate waste cost for an item
 * @param {Object} item - Flight item with Quantity_Returned and Unit_Cost
 * @returns {number} Waste cost
 */
export const calculateWasteCost = (item) => {
  const returned = parseInt(item.Quantity_Returned) || 0;
  const unitCost = parseFloat(item.Unit_Cost) || 0;

  return returned * unitCost;
};

/**
 * Determine if a product has high waste (low consumption)
 * @param {number} consumptionRate - Consumption rate percentage
 * @param {number} threshold - Threshold for high waste (default: 70%)
 * @returns {boolean} True if waste is high
 */
export const isHighWaste = (consumptionRate, threshold = 70) => {
  return consumptionRate < threshold;
};

/**
 * Determine if a product has stockout risk (ran out early)
 * @param {string} feedback - Crew feedback
 * @returns {boolean} True if product ran out early
 */
export const hasStockoutRisk = (feedback) => {
  if (!feedback) return false;
  const lowerFeedback = feedback.toLowerCase();
  return lowerFeedback.includes('ran out') || lowerFeedback.includes('not enough');
};

/**
 * Calculate recommended quantity adjustment
 * @param {number} standardQty - Standard quantity
 * @param {number} consumptionRate - Historical consumption rate
 * @returns {Object} Recommendation with quantity and reason
 */
export const recommendQuantityAdjustment = (standardQty, consumptionRate) => {
  if (consumptionRate >= 95) {
    // Very high consumption - increase stock
    return {
      recommendedQty: Math.ceil(standardQty * 1.1),
      difference: Math.ceil(standardQty * 0.1),
      reason: 'High consumption rate - increase by 10% to prevent stockouts'
    };
  } else if (consumptionRate < 60) {
    // Low consumption - reduce waste
    const reductionFactor = 1 - ((100 - consumptionRate) / 200); // Gradual reduction
    return {
      recommendedQty: Math.ceil(standardQty * reductionFactor),
      difference: Math.ceil(standardQty * reductionFactor) - standardQty,
      reason: `Low consumption rate (${consumptionRate}%) - reduce to minimize waste`
    };
  } else {
    // Moderate consumption - maintain
    return {
      recommendedQty: standardQty,
      difference: 0,
      reason: 'Consumption rate is optimal - maintain current quantity'
    };
  }
};
