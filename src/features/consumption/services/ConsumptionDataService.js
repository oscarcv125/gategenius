/**
 * Consumption Data Service
 * Handles all data loading and parsing for consumption module
 */

import { parseCSV, validateCSVData } from '../../../shared/utils/csvParser';
import { calculateConsumptionRate, calculateWasteCost } from '../utils/consumptionCalculations';

export class ConsumptionDataService {
  static CSV_PATH = '/data/consumption.csv';

  static REQUIRED_FIELDS = [
    'Flight_ID',
    'Product_ID',
    'Product_Name',
    'Standard_Specification_Qty',
    'Quantity_Returned',
    'Unit_Cost'
  ];

  /**
   * Load consumption data from CSV
   * @returns {Promise<Array>} Transformed consumption data
   */
  static async loadData() {
    try {
      console.log('📦 Loading consumption data...');

      const rawData = await parseCSV(this.CSV_PATH);

      // Validate required fields
      const validation = validateCSVData(rawData, this.REQUIRED_FIELDS);
      if (!validation.isValid) {
        throw new Error(`Invalid CSV data: ${validation.errors.join(', ')}`);
      }

      const transformedData = this.transformData(rawData);

      console.log('✅ Consumption data loaded:', transformedData.length, 'flight items');
      return transformedData;
    } catch (error) {
      console.error('❌ Failed to load consumption data:', error);
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
      Flight_ID: item.Flight_ID,
      Origin: item.Origin,
      Date: item.Date,
      Flight_Type: item.Flight_Type,
      Service_Type: item.Service_Type,
      Passenger_Count: parseInt(item.Passenger_Count) || 0,
      Product_ID: item.Product_ID,
      Product_Name: item.Product_Name,
      Standard_Specification_Qty: parseInt(item.Standard_Specification_Qty) || 0,
      Quantity_Returned: parseInt(item.Quantity_Returned) || 0,
      Quantity_Consumed: parseInt(item.Quantity_Consumed) || 0,
      Unit_Cost: parseFloat(item.Unit_Cost) || 0,
      Crew_Feedback: item.Crew_Feedback || '',
      // Computed fields
      Consumption_Rate: calculateConsumptionRate(item),
      Waste_Cost: calculateWasteCost(item)
    }));
  }
}
