/**
 * Expiration Business Logic
 * All calculations and analysis for expiration module
 * Pure business logic - can be used on frontend or backend
 */

import { estimateProductValue } from '../utils/expirationCalculations';

export class ExpirationBusinessLogic {
  /**
   * Get critical items (expiring today)
   * @param {Array} products - Array of products
   * @returns {Array} Products expiring today
   */
  static getCriticalItems(products) {
    return products
      .filter(p => p.Days_Until_Expiry === 0)
      .sort((a, b) => b.Quantity - a.Quantity); // Sort by quantity descending
  }

  /**
   * Get warning items (expiring this week)
   * @param {Array} products - Array of products
   * @returns {Array} Products expiring in 1-7 days
   */
  static getWarningItems(products) {
    return products
      .filter(p => p.Days_Until_Expiry > 0 && p.Days_Until_Expiry <= 7)
      .sort((a, b) => a.Days_Until_Expiry - b.Days_Until_Expiry); // Sort by days ascending
  }

  /**
   * Get expired items
   * @param {Array} products - Array of products
   * @returns {Array} Expired products
   */
  static getExpiredItems(products) {
    return products
      .filter(p => p.Days_Until_Expiry < 0)
      .sort((a, b) => a.Days_Until_Expiry - b.Days_Until_Expiry); // Sort by most expired first
  }

  /**
   * Calculate waste statistics
   * @param {Array} products - Array of products
   * @returns {Object} Waste statistics
   */
  static getWasteStats(products) {
    const critical = this.getCriticalItems(products);
    const warning = this.getWarningItems(products);
    const expired = this.getExpiredItems(products);

    const criticalUnits = critical.reduce((sum, p) => sum + p.Quantity, 0);
    const warningUnits = warning.reduce((sum, p) => sum + p.Quantity, 0);
    const expiredUnits = expired.reduce((sum, p) => sum + p.Quantity, 0);

    return {
      total_products: products.length,
      critical_count: critical.length,
      critical_units: criticalUnits,
      warning_count: warning.length,
      warning_units: warningUnits,
      expired_count: expired.length,
      expired_units: expiredUnits,
      estimated_critical_value: this.calculateTotalValue(critical),
      estimated_warning_value: this.calculateTotalValue(warning),
      estimated_expired_value: this.calculateTotalValue(expired)
    };
  }

  /**
   * Calculate total value of products
   * @param {Array} products - Array of products
   * @param {number} avgUnitCost - Average unit cost (default: 1.5)
   * @returns {number} Total estimated value
   */
  static calculateTotalValue(products, avgUnitCost = 1.5) {
    return products.reduce((sum, p) =>
      sum + estimateProductValue(p.Quantity, avgUnitCost), 0
    );
  }

  /**
   * Get rotation recommendations for near-expiry products
   * @param {Array} products - Array of products
   * @returns {Array} Rotation recommendations
   */
  static getRotationRecommendations(products) {
    const critical = this.getCriticalItems(products);
    const warning = this.getWarningItems(products);

    const recommendations = [];

    // Critical items - assign to flights immediately
    critical.forEach(product => {
      recommendations.push({
        product_id: product.Product_ID,
        product_name: product.Product_Name,
        lot_number: product.LOT_Number,
        quantity: product.Quantity,
        days_until_expiry: product.Days_Until_Expiry,
        priority: 'CRITICAL',
        action: 'ASSIGN_TO_FLIGHT_NOW',
        recommendation: `🚨 CRITICAL: Use LOT ${product.LOT_Number} on next available flight (${product.Quantity} units expire TODAY)`
      });
    });

    // Warning items - plan for this week
    warning.forEach(product => {
      recommendations.push({
        product_id: product.Product_ID,
        product_name: product.Product_Name,
        lot_number: product.LOT_Number,
        quantity: product.Quantity,
        days_until_expiry: product.Days_Until_Expiry,
        priority: 'WARNING',
        action: 'ASSIGN_TO_FLIGHT_SOON',
        recommendation: `⚠️ Use LOT ${product.LOT_Number} within ${product.Days_Until_Expiry} days (${product.Quantity} units)`
      });
    });

    return recommendations;
  }

  /**
   * Get products expiring in a specific number of days
   * @param {Array} products - Array of products
   * @param {number} days - Days until expiry
   * @returns {Array} Filtered products
   */
  static getProductsExpiringInDays(products, days) {
    return products.filter(p => p.Days_Until_Expiry === days);
  }

  /**
   * Get products by LOT number
   * @param {Array} products - Array of products
   * @param {string} lotNumber - LOT number to search
   * @returns {Object|null} Product or null if not found
   */
  static getProductByLOT(products, lotNumber) {
    return products.find(p => p.LOT_Number === lotNumber) || null;
  }

  /**
   * Search products by name (case-insensitive)
   * @param {Array} products - Array of products
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching products
   */
  static searchProducts(products, searchTerm) {
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.Product_Name.toLowerCase().includes(term) ||
      p.Product_ID.toLowerCase().includes(term) ||
      p.LOT_Number.toLowerCase().includes(term)
    );
  }

  /**
   * Group products by expiry category
   * @param {Array} products - Array of products
   * @returns {Object} Products grouped by category
   */
  static groupByExpiryCategory(products) {
    return {
      expired: this.getExpiredItems(products),
      critical: this.getCriticalItems(products),
      warning: this.getWarningItems(products),
      safe: products.filter(p => p.Days_Until_Expiry > 7)
    };
  }
}
