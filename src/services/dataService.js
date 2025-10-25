import Papa from 'papaparse';

/**
 * Data Service - Handles parsing and loading all CSV data
 * Owner: Abel
 *
 * This service provides functions to load and parse the three main datasets:
 * - Expiration data
 * - Consumption data
 * - Productivity data
 */

class DataService {
  /**
   * Load and parse a CSV file from the public/data directory
   * @param {string} filename - Name of the CSV file (e.g., 'expiration.csv')
   * @returns {Promise<Array>} Parsed data as array of objects
   */
  async loadCSV(filename) {
    try {
      const response = await fetch(`/data/${filename}`);
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            console.log(`✅ Loaded ${filename}:`, results.data.length, 'records');
            resolve(results.data);
          },
          error: (error) => {
            console.error(`❌ Error parsing ${filename}:`, error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load expiration dataset
   * Returns: Product_ID, Product_Name, Weight_or_Volume, LOT_Number, Expiry_Date, Quantity
   */
  async loadExpirationData() {
    const data = await this.loadCSV('expiration.csv');

    // Parse dates and calculate days until expiry
    return data.map(item => ({
      ...item,
      Quantity: parseInt(item.Quantity) || 0,
      Expiry_Date_Parsed: new Date(item.Expiry_Date),
      Days_Until_Expiry: this.calculateDaysUntilExpiry(item.Expiry_Date)
    }));
  }

  /**
   * Load consumption prediction dataset
   * Returns: Flight_ID, Origin, Date, Flight_Type, Service_Type, Passenger_Count,
   *          Product_ID, Product_Name, Standard_Specification_Qty, Quantity_Returned,
   *          Quantity_Consumed, Unit_Cost, Crew_Feedback
   */
  async loadConsumptionData() {
    const data = await this.loadCSV('consumption.csv');

    // Parse numeric fields
    return data.map(item => ({
      ...item,
      Passenger_Count: parseInt(item.Passenger_Count) || 0,
      Standard_Specification_Qty: parseInt(item.Standard_Specification_Qty) || 0,
      Quantity_Returned: parseInt(item.Quantity_Returned) || 0,
      Quantity_Consumed: parseInt(item.Quantity_Consumed) || 0,
      Unit_Cost: parseFloat(item.Unit_Cost) || 0,
      Consumption_Rate: this.calculateConsumptionRate(item),
      Waste_Cost: this.calculateWasteCost(item)
    }));
  }

  /**
   * Load productivity estimation dataset
   * Returns: Drawer_ID, Flight_Type, Drawer_Category, Total_Items,
   *          Unique_Item_Types, Item_List
   */
  async loadProductivityData() {
    const data = await this.loadCSV('productivity.csv');

    // Parse numeric fields and item lists
    return data.map(item => ({
      ...item,
      Total_Items: parseInt(item.Total_Items) || 0,
      Unique_Item_Types: parseInt(item.Unique_Item_Types) || 0,
      Item_List: item.Item_List ? item.Item_List.split(',').map(i => i.trim()) : [],
      Estimated_Time: this.estimateDrawerTime(item)
    }));
  }

  /**
   * Calculate days until expiry from expiry date string
   */
  calculateDaysUntilExpiry(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Calculate consumption rate as percentage
   */
  calculateConsumptionRate(item) {
    const consumed = parseInt(item.Quantity_Consumed) || 0;
    const standard = parseInt(item.Standard_Specification_Qty) || 1;

    return Math.round((consumed / standard) * 100);
  }

  /**
   * Calculate waste cost
   */
  calculateWasteCost(item) {
    const returned = parseInt(item.Quantity_Returned) || 0;
    const unitCost = parseFloat(item.Unit_Cost) || 0;

    return returned * unitCost;
  }

  /**
   * Estimate drawer assembly time in minutes
   * Complex formula based on items and types
   */
  estimateDrawerTime(drawer) {
    const totalItems = parseInt(drawer.Total_Items) || 0;
    const uniqueTypes = parseInt(drawer.Unique_Item_Types) || 0;

    // Base time: 0.2 min per item
    const baseTime = totalItems * 0.2;

    // Complexity factor: more unique types = more time
    const complexityFactor = uniqueTypes * 0.3;

    // Category multiplier
    let categoryMultiplier = 1.0;
    if (drawer.Drawer_Category === 'Beverage') categoryMultiplier = 1.1;
    if (drawer.Drawer_Category === 'Meal') categoryMultiplier = 1.3;

    // Flight type multiplier
    let flightMultiplier = 1.0;
    if (drawer.Flight_Type === 'Business') flightMultiplier = 1.2; // More precision needed

    const estimatedTime = (baseTime + complexityFactor) * categoryMultiplier * flightMultiplier;

    return Math.round(estimatedTime * 10) / 10; // Round to 1 decimal
  }
}

// Export singleton instance
export const dataService = new DataService();
