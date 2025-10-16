/**
 * Productivity Data Service
 * Handles all data loading and parsing for productivity module
 */

import { parseCSV, validateCSVData } from '../../../shared/utils/csvParser';
import { estimateDrawerTime } from '../utils/productivityCalculations';

export class ProductivityDataService {
  static CSV_PATH = '/data/productivity.csv';

  static REQUIRED_FIELDS = [
    'Drawer_ID',
    'Flight_Type',
    'Drawer_Category',
    'Total_Items',
    'Unique_Item_Types'
  ];

  /**
   * Load productivity data from CSV
   * @returns {Promise<Array>} Transformed productivity data
   */
  static async loadData() {
    try {
      console.log('📦 Loading productivity data...');

      const rawData = await parseCSV(this.CSV_PATH);

      // Validate required fields
      const validation = validateCSVData(rawData, this.REQUIRED_FIELDS);
      if (!validation.isValid) {
        throw new Error(`Invalid CSV data: ${validation.errors.join(', ')}`);
      }

      const transformedData = this.transformData(rawData);

      console.log('✅ Productivity data loaded:', transformedData.length, 'drawers');
      return transformedData;
    } catch (error) {
      console.error('❌ Failed to load productivity data:', error);
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
      Drawer_ID: item.Drawer_ID,
      Flight_Type: item.Flight_Type,
      Drawer_Category: item.Drawer_Category,
      Total_Items: parseInt(item.Total_Items) || 0,
      Unique_Item_Types: parseInt(item.Unique_Item_Types) || 0,
      Item_List: item.Item_List ? item.Item_List.split(',').map(i => i.trim()) : [],
      // Computed field
      Estimated_Time: estimateDrawerTime(item)
    }));
  }
}
