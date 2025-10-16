/**
 * Consumption Store (Zustand)
 * State management for consumption module
 */

import { create } from 'zustand';
import { ConsumptionDataService } from '../services/ConsumptionDataService';
import { ConsumptionBusinessLogic } from '../services/ConsumptionBusinessLogic';

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
      const data = await ConsumptionDataService.loadData();
      set({
        flights: data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Computed/Selector functions - Use Business Logic
  getUniqueFlights: () => {
    const { flights } = get();
    return ConsumptionBusinessLogic.getUniqueFlights(flights);
  },

  getFlightItems: (flightId) => {
    const { flights } = get();
    return ConsumptionBusinessLogic.getFlightItems(flights, flightId);
  },

  getProductPattern: (productId) => {
    const { flights } = get();
    return ConsumptionBusinessLogic.getProductPattern(flights, productId);
  },

  getHighWasteProducts: (threshold) => {
    const { flights } = get();
    return ConsumptionBusinessLogic.getHighWasteProducts(flights, threshold);
  },

  getStockoutRiskProducts: () => {
    const { flights } = get();
    return ConsumptionBusinessLogic.getStockoutRiskProducts(flights);
  },

  getWasteStats: () => {
    const { flights } = get();
    return ConsumptionBusinessLogic.getWasteStats(flights);
  },

  predictConsumption: (productId, flightType, standardQty) => {
    const { flights } = get();
    return ConsumptionBusinessLogic.predictConsumption(flights, productId, flightType, standardQty);
  },

  groupByWasteCategory: () => {
    const { flights } = get();
    return ConsumptionBusinessLogic.groupByWasteCategory(flights);
  },

  calculatePotentialSavings: (reductionPercentage) => {
    const { flights } = get();
    return ConsumptionBusinessLogic.calculatePotentialSavings(flights, reductionPercentage);
  }
}));
