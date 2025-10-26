/**
 * Productivity Business Logic
 * All calculations and analysis for productivity module
 * Pure business logic - can be used on frontend or backend
 */

import { minutesToHours, calculateWorkersNeeded, calculateUtilization } from '../utils/productivityCalculations';

export class ProductivityBusinessLogic {
  /**
   * Get total estimated time for all drawers (in hours)
   * @param {Array} drawers - Array of drawers
   * @returns {number} Total time in hours
   */
  static getTotalTime(drawers) {
  const totalMinutes = drawers.reduce((sum, d) => {
    const m = Number(d.Estimated_Time);
    return sum + (Number.isFinite(m) ? m : 0);
    }, 0);
    // a horas con 1 decimal
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    return Number.isFinite(hours) ? hours : 0;
  }

  /**
   * Calculate workers needed for a given shift duration
   * @param {Array} drawers - Array of drawers
   * @param {number} shiftHours - Shift duration (default: 8 hours)
   * @returns {Object} Workforce calculation
   */
  static calculateWorkforce(drawers, shiftHours = 8) {
    const totalHours = this.getTotalTime(drawers);
    const hours = Number.isFinite(totalHours) ? totalHours : 0;
    const shift = Number.isFinite(shiftHours) && shiftHours > 0 ? shiftHours : 8;

    const workersNeeded = Math.ceil(hours / shift);
    const workers = Number.isFinite(workersNeeded) ? Math.max(0, workersNeeded) : 0;

    const utilization = workers > 0
      ? Math.round((hours / (workers * shift)) * 100)
      : 0;

    return {
      workers_needed: workers,
      shift_hours: shift,
      total_hours: hours,
      utilization
    };
  }

  /**
   * Get drawers grouped by category
   * @param {Array} drawers - Array of drawers
   * @returns {Object} Drawers grouped by category
   */
  static groupByCategory(drawers) {
    const categories = {};

    drawers.forEach(drawer => {
      const cat = drawer.Drawer_Category;
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(drawer);
    });

    return categories;
  }

  /**
   * Get drawers grouped by flight type
   * @param {Array} drawers - Array of drawers
   * @returns {Object} Drawers grouped by flight type
   */
  static groupByFlightType(drawers) {
    const types = {};

    drawers.forEach(drawer => {
      const type = drawer.Flight_Type;
      if (!types[type]) {
        types[type] = [];
      }
      types[type].push(drawer);
    });

    return types;
  }

  /**
   * Get complexity statistics
   * @param {Array} drawers - Array of drawers
   * @returns {Object} Complexity breakdown
   */
  static getComplexityStats(drawers) {
    // Simple = < 5 minutes, Medium = 5-8 minutes, Complex = > 8 minutes
    const simple = drawers.filter(d => d.Estimated_Time < 5);
    const medium = drawers.filter(d => d.Estimated_Time >= 5 && d.Estimated_Time <= 8);
    const complex = drawers.filter(d => d.Estimated_Time > 8);

    const avgTime = drawers.length > 0
      ? Math.round((drawers.reduce((sum, d) => sum + d.Estimated_Time, 0) / drawers.length) * 10) / 10
      : 0;

    return {
      simple: simple.length,
      medium: medium.length,
      complex: complex.length,
      avg_time: avgTime
    };
  }

  /**
   * Get most complex drawers (top N by time)
   * @param {Array} drawers - Array of drawers
   * @param {number} limit - Number of drawers to return (default: 10)
   * @returns {Array} Most complex drawers
   */
  static getMostComplexDrawers(drawers, limit = 10) {
    return [...drawers]
      .sort((a, b) => b.Estimated_Time - a.Estimated_Time)
      .slice(0, limit);
  }

  /**
   * Calculate productivity benchmarks
   * @param {Array} drawers - Array of drawers
   * @param {number} industryBenchmark - Industry standard drawers/hour (default: 6.5)
   * @returns {Object} Benchmark comparison
   */
  static getBenchmarks(drawers, industryBenchmark = 6.5) {
    const totalDrawers = drawers.length;
    const totalTime = this.getTotalTime(drawers);
    const avgTimePerDrawer = totalTime * 60 / totalDrawers; // in minutes

    const currentRate = 60 / avgTimePerDrawer; // drawers per hour

    return {
      total_drawers: totalDrawers,
      avg_time_per_drawer: Math.round(avgTimePerDrawer * 10) / 10,
      current_rate: Math.round(currentRate * 10) / 10,
      industry_benchmark: industryBenchmark,
      performance_vs_benchmark: Math.round((currentRate / industryBenchmark) * 100)
    };
  }

  /**
   * Plan workforce for specific drawer set
   * @param {Array} drawers - Array of drawers
   * @param {Array} drawerIds - Optional: specific drawer IDs to plan for
   * @param {number} shiftHours - Shift duration (default: 8 hours)
   * @returns {Object} Workforce plan
   */
  static planWorkforce(drawers, drawerIds = null, shiftHours = 8) {
    let targetDrawers = drawers;

    if (drawerIds && Array.isArray(drawerIds)) {
      targetDrawers = drawers.filter(d => drawerIds.includes(d.Drawer_ID));
    }

    const totalMinutes = targetDrawers.reduce((sum, d) => sum + d.Estimated_Time, 0);
    const totalHours = minutesToHours(totalMinutes);
    const workersNeeded = calculateWorkersNeeded(totalHours, shiftHours);

    return {
      total_drawers: targetDrawers.length,
      total_time_hours: totalHours,
      workers_needed: workersNeeded,
      shift_duration: shiftHours,
      status: workersNeeded <= 10 ? 'OPTIMAL' : 'PEAK_LOAD'
    };
  }

  /**
   * Get peak times analysis
   * @param {Array} drawers - Array of drawers
   * @returns {Array} Peak time slots
   */
  static getPeakTimes(drawers) {
    // Mock peak times - would integrate with real flight schedule
    // This is a simplified version showing distribution
    const totalDrawers = drawers.length;

    return [
      {
        time: '09:00-11:00',
        drawers: Math.round(totalDrawers * 0.30),
        workers_needed: Math.ceil((totalDrawers * 0.30) / 16) // Assuming 16 drawers per worker per 2 hours
      },
      {
        time: '14:00-16:00',
        drawers: Math.round(totalDrawers * 0.35),
        workers_needed: Math.ceil((totalDrawers * 0.35) / 16)
      },
      {
        time: '18:00-20:00',
        drawers: Math.round(totalDrawers * 0.30),
        workers_needed: Math.ceil((totalDrawers * 0.30) / 16)
      }
    ];
  }

  /**
   * Analyze staffing efficiency
   * @param {Array} drawers - Array of drawers
   * @param {number} currentStaff - Current number of workers
   * @param {number} shiftHours - Shift duration
   * @returns {Object} Efficiency analysis
   */
  static analyzeEfficiency(drawers, currentStaff, shiftHours = 8) {
    const totalHours = this.getTotalTime(drawers);
    const optimalStaff = calculateWorkersNeeded(totalHours, shiftHours);

    const currentCapacity = currentStaff * shiftHours;
    const utilization = Math.round((totalHours / currentCapacity) * 100);

    return {
      current_staff: currentStaff,
      optimal_staff: optimalStaff,
      difference: currentStaff - optimalStaff,
      utilization: utilization,
      status: currentStaff === optimalStaff ? 'OPTIMAL' :
              currentStaff > optimalStaff ? 'OVERSTAFFED' : 'UNDERSTAFFED',
      recommendation: this.getStaffingRecommendation(currentStaff, optimalStaff)
    };
  }

  /**
   * Get staffing recommendation
   * @private
   */
  static getStaffingRecommendation(currentStaff, optimalStaff) {
    const diff = currentStaff - optimalStaff;

    if (diff === 0) {
      return 'Current staffing is optimal';
    } else if (diff > 0) {
      return `Consider reducing staff by ${diff} worker${diff > 1 ? 's' : ''} to improve utilization`;
    } else {
      return `Add ${Math.abs(diff)} worker${Math.abs(diff) > 1 ? 's' : ''} to meet capacity requirements`;
    }
  }
}
