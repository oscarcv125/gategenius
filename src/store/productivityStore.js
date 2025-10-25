import { create } from 'zustand';
import { dataService } from '../services/dataService';

/**
 * Productivity Store - Manages workforce planning state
 * Owner: Abel (state) + Oscar (UI integration)
 *
 * This store handles:
 * - Loading drawer/productivity data
 * - Calculating workforce needs
 * - Providing capacity planning insights
 */

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
      const data = await dataService.loadProductivityData();
      set({
        drawers: data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Computed/Selector functions

  /**
   * Get total estimated time for all drawers (in hours)
   */
  getTotalTime: () => {
    const drawers = get().drawers;
    const totalMinutes = drawers.reduce((sum, d) => sum + d.Estimated_Time, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  },

  /**
   * Calculate workers needed for a given shift duration
   */
  calculateWorkersNeeded: (shiftHours = 8) => {
    const totalHours = get().getTotalTime();
    const workersNeeded = Math.ceil(totalHours / shiftHours);

    return {
      workers_needed: workersNeeded,
      shift_hours: shiftHours,
      total_hours: totalHours,
      utilization: Math.round((totalHours / (workersNeeded * shiftHours)) * 100)
    };
  },

  /**
   * Get drawers grouped by category
   */
  getByCategory: () => {
    const drawers = get().drawers;
    const categories = {};

    drawers.forEach(drawer => {
      const cat = drawer.Drawer_Category;
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(drawer);
    });

    return categories;
  },

  /**
   * Get drawers grouped by flight type
   */
  getByFlightType: () => {
    const drawers = get().drawers;
    const types = {};

    drawers.forEach(drawer => {
      const type = drawer.Flight_Type;
      if (!types[type]) {
        types[type] = [];
      }
      types[type].push(drawer);
    });

    return types;
  },

  /**
   * Get complexity stats
   */
  getComplexityStats: () => {
    const drawers = get().drawers;

    // Simple = < 5 minutes, Medium = 5-8 minutes, Complex = > 8 minutes
    const simple = drawers.filter(d => d.Estimated_Time < 5);
    const medium = drawers.filter(d => d.Estimated_Time >= 5 && d.Estimated_Time <= 8);
    const complex = drawers.filter(d => d.Estimated_Time > 8);

    return {
      simple: simple.length,
      medium: medium.length,
      complex: complex.length,
      avg_time: Math.round(
        (drawers.reduce((sum, d) => sum + d.Estimated_Time, 0) / drawers.length) * 10
      ) / 10
    };
  },

  /**
   * Get most complex drawers (top 10 by time)
   */
  getMostComplexDrawers: () => {
    const drawers = get().drawers;
    return [...drawers]
      .sort((a, b) => b.Estimated_Time - a.Estimated_Time)
      .slice(0, 10);
  },

  /**
   * Calculate productivity benchmarks
   */
  getBenchmarks: () => {
    const drawers = get().drawers;

    const totalDrawers = drawers.length;
    const totalTime = get().getTotalTime();
    const avgTimePerDrawer = totalTime * 60 / totalDrawers; // in minutes

    // Industry benchmark: 6.5 drawers/hour
    const industryBenchmark = 60 / 6.5; // minutes per drawer
    const currentRate = 60 / avgTimePerDrawer; // drawers per hour

    return {
      total_drawers: totalDrawers,
      avg_time_per_drawer: Math.round(avgTimePerDrawer * 10) / 10,
      current_rate: Math.round(currentRate * 10) / 10, // drawers per hour
      industry_benchmark: 6.5,
      performance_vs_benchmark: Math.round((currentRate / 6.5) * 100)
    };
  },

  /**
   * Plan workforce for specific drawer set
   */
  planWorkforce: (drawerIds = null) => {
    let targetDrawers = get().drawers;

    if (drawerIds) {
      targetDrawers = drawers.filter(d => drawerIds.includes(d.Drawer_ID));
    }

    const totalMinutes = targetDrawers.reduce((sum, d) => sum + d.Estimated_Time, 0);
    const totalHours = totalMinutes / 60;

    // 8-hour shift
    const shiftHours = 8;
    const workersNeeded = Math.ceil(totalHours / shiftHours);

    return {
      total_drawers: targetDrawers.length,
      total_time_hours: Math.round(totalHours * 10) / 10,
      workers_needed: workersNeeded,
      shift_duration: shiftHours,
      status: workersNeeded <= 10 ? 'OPTIMAL' : 'PEAK_LOAD'
    };
  },

  /**
   * Simulate peak time analysis (mock - Oscar will enhance)
   */
  getPeakTimes: () => {
    // Mock peak times - Oscar will integrate with real flight schedule
    return [
      { time: '09:00-11:00', drawers: 78, workers_needed: 5 },
      { time: '14:00-16:00', drawers: 92, workers_needed: 6 },
      { time: '18:00-20:00', drawers: 77, workers_needed: 5 }
    ];
  }
}));
