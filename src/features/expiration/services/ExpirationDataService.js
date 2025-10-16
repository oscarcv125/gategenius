/**
 * Expiration Data Service
 * Handles all data loading and parsing for expiration module
 */

import { parseCSV, validateCSVData } from '../../../shared/utils/csvParser';
import { calculateDaysUntilExpiry } from '../utils/expirationCalculations';

export class ExpirationDataService {
  static CSV_PATH = '/data/expiration.csv';

  static REQUIRED_FIELDS = [
    'Product_ID',
    'Product_Name',
    'LOT_Number',
    'Expiry_Date',
    'Quantity'
  ];

  /**
   * Load expiration data from CSV
   * @returns {Promise<Array>} Transformed expiration data
   */
  static async loadData() {
    try {
      console.log('📦 Loading expiration data...');

      const rawData = await parseCSV(this.CSV_PATH);

      // Validate required fields
      const validation = validateCSVData(rawData, this.REQUIRED_FIELDS);
      if (!validation.isValid) {
        throw new Error(`Invalid CSV data: ${validation.errors.join(', ')}`);
      }

      const transformedData = this.transformData(rawData);

      console.log('✅ Expiration data loaded:', transformedData.length, 'products');
      return transformedData;
    } catch (error) {
      console.error('❌ Failed to load expiration data:', error);
      throw error;
    }
  }

  /**
   * Transform raw CSV data into structured format
   * @param {Array} rawData - Raw CSV data
   * @returns {Array} Transformed data
   */
  static transformData(rawData) {
    return rawData.map(item => ({
      Product_ID: item.Product_ID,
      Product_Name: item.Product_Name,
      Weight_or_Volume: item.Weight_or_Volume,
      LOT_Number: item.LOT_Number,
      Expiry_Date: item.Expiry_Date,
      Quantity: parseInt(item.Quantity) || 0,
      // Computed fields
      Expiry_Date_Parsed: new Date(item.Expiry_Date),
      Days_Until_Expiry: calculateDaysUntilExpiry(item.Expiry_Date)
    }));
  }

  /**
   * Validate product data structure
   * @param {Object} product - Product object
   * @returns {Object} Validation result
   */
  static validateProduct(product) {
    const errors = [];

    if (!product.Product_ID) errors.push('Product_ID is required');
    if (!product.Product_Name) errors.push('Product_Name is required');
    if (!product.LOT_Number) errors.push('LOT_Number is required');
    if (!product.Expiry_Date) errors.push('Expiry_Date is required');
    if (typeof product.Quantity !== 'number' || product.Quantity < 0) {
      errors.push('Quantity must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
