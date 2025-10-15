import { create } from 'zustand';
import { dataService } from '../services/dataService';

/**
 * Consumption Store - Manages consumption prediction state
 *
 * This store handles:
 * - Loading consumption data
 * - Analyzing consumption patterns
 * - Providing predictions and recommendations
 */

export const useConsumptionStore = create((set, get) => ({
  // State
  flights: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dataService.loadConsumptionData();
      set({
        flights: data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Computed/Selector functions

  /**
   * Get unique flights (grouped by Flight_ID)
   */
  getUniqueFlights: () => {
    const flights = get().flights;
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
  },

  /**
   * Get items for a specific flight
   */
  getFlightItems: (flightId) => {
    const flights = get().flights;
    return flights.filter(item => item.Flight_ID === flightId);
  },

  /**
   * Get consumption pattern for a product across all flights
   */
  getProductPattern: (productId) => {
    const flights = get().flights;
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
  },

  /**
   * Get products with high waste (low consumption rate)
   */
  getHighWasteProducts: () => {
    const flights = get().flights;
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

      if (avgRate < 70) { // Less than 70% consumed = high waste
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
  },

  /**
   * Get products with stockout risk (high consumption, ran out early)
   */
  getStockoutRiskProducts: () => {
    const flights = get().flights;

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
          count: 0
        });
      }
      productMap.get(key).count++;
    });

    return Array.from(productMap.values()).sort((a, b) => b.count - a.count);
  },

  /**
   * Get waste statistics
   */
  getWasteStats: () => {
    const flights = get().flights;

    const totalWaste = flights.reduce((sum, f) => sum + f.Waste_Cost, 0);
    const totalReturned = flights.reduce((sum, f) => sum + f.Quantity_Returned, 0);
    const totalConsumed = flights.reduce((sum, f) => sum + f.Quantity_Consumed, 0);
    const totalLoaded = totalConsumed + totalReturned;

    return {
      total_waste_cost: Math.round(totalWaste * 100) / 100,
      total_returned_units: totalReturned,
      total_consumed_units: totalConsumed,
      overall_consumption_rate: Math.round((totalConsumed / totalLoaded) * 100),
      unique_flights: get().getUniqueFlights().length
    };
  },

  /**
   * Predict consumption for a product on a specific flight type
   */
  predictConsumption: (productId, flightType, standardQty) => {
    const flights = get().flights;

    // Find similar flights (same product + flight type)
    const similarFlights = flights.filter(
      f => f.Product_ID === productId && f.Flight_Type === flightType
    );

    if (similarFlights.length === 0) {
      // No data, return standard qty
      return {
        predicted_qty: standardQty,
        confidence: 'low',
        recommendation: 'No historical data available'
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
      recommendation = `Reduce by ${Math.abs(difference)} units`;
    } else if (difference > 10) {
      recommendation = `Increase by ${difference} units`;
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
}));
