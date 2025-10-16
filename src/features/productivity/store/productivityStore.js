/**
 * Productivity Store (Zustand)
 * State management for productivity module
 */

import { create } from 'zustand';
import { ProductivityDataService } from '../services/ProductivityDataService';
import { ProductivityBusinessLogic } from '../services/ProductivityBusinessLogic';

export const useProductivityStore = create((set, get) => ({
  // State
  drawers: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await ProductivityDataService.loadData();
      set({
        drawers: data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Computed/Selector functions - Use Business Logic
  getTotalTime: () => {
    const { drawers } = get();
    return ProductivityBusinessLogic.getTotalTime(drawers);
  },

  calculateWorkersNeeded: (shiftHours) => {
    const { drawers } = get();
    return ProductivityBusinessLogic.calculateWorkforce(drawers, shiftHours);
  },

  getByCategory: () => {
    const { drawers } = get();
    return ProductivityBusinessLogic.groupByCategory(drawers);
  },

  getByFlightType: () => {
    const { drawers } = get();
    return ProductivityBusinessLogic.groupByFlightType(drawers);
  },

  getComplexityStats: () => {
    const { drawers } = get();
    return ProductivityBusinessLogic.getComplexityStats(drawers);
  },

  getMostComplexDrawers: (limit) => {
    const { drawers } = get();
    return ProductivityBusinessLogic.getMostComplexDrawers(drawers, limit);
  },

  getBenchmarks: (industryBenchmark) => {
    const { drawers } = get();
    return ProductivityBusinessLogic.getBenchmarks(drawers, industryBenchmark);
  },

  planWorkforce: (drawerIds, shiftHours) => {
    const { drawers } = get();
    return ProductivityBusinessLogic.planWorkforce(drawers, drawerIds, shiftHours);
  },

  getPeakTimes: () => {
    const { drawers } = get();
    return ProductivityBusinessLogic.getPeakTimes(drawers);
  },

  analyzeEfficiency: (currentStaff, shiftHours) => {
    const { drawers } = get();
    return ProductivityBusinessLogic.analyzeEfficiency(drawers, currentStaff, shiftHours);
  }
}));
