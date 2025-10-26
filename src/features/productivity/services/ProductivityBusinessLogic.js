/**
 * Productivity Business Logic
 * All calculations and analysis for productivity module
 * Pure business logic - can be used on frontend or backend
 */

import { minutesToHours, calculateWorkersNeeded, calculateUtilization } from '../utils/productivityCalculations';

export class ProductivityBusinessLogic {
  static REALITY_FACTOR = 0.61;

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

    // Aplicar factor de realidad para tiempos más precisos
    const adjustedMinutes = totalMinutes * this.REALITY_FACTOR;
    
    // Convertir a horas con 1 decimal
    const hours = Math.round((adjustedMinutes / 60) * 10) / 10;
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
    const workers = Number.isFinite(workersNeeded) ? Math.max(1, workersNeeded) : 1; // Mínimo 1 worker

    const utilization = workers > 0
      ? Math.round((hours / (workers * shift)) * 100)
      : 0;

    return {
      workers_needed: workers,
      shift_hours: shift,
      total_hours: hours,
      utilization: Math.min(100, utilization) // Cap at 100%
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
      const cat = drawer.Drawer_Category || 'Unknown';
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
      const type = drawer.Flight_Type || 'Unknown';
      if (!types[type]) {
        types[type] = [];
      }
      types[type].push(drawer);
    });

    return types;
  }

  /**
   * Get complexity statistics (TIEMPOS AJUSTADOS)
   * @param {Array} drawers - Array of drawers
   * @returns {Object} Complexity breakdown
   */
  static getComplexityStats(drawers) {
    // Aplicar factor de realidad a los tiempos estimados
    const adjustedDrawers = drawers.map(d => ({
      ...d,
      Estimated_Time: (d.Estimated_Time || 0) * this.REALITY_FACTOR
    }));

    // Simple = < 3 min, Medium = 3-5 min, Complex = > 5 min (más realista)
    const simple = adjustedDrawers.filter(d => d.Estimated_Time < 3);
    const medium = adjustedDrawers.filter(d => d.Estimated_Time >= 3 && d.Estimated_Time <= 5);
    const complex = adjustedDrawers.filter(d => d.Estimated_Time > 5);

    const avgTime = adjustedDrawers.length > 0
      ? Math.round((adjustedDrawers.reduce((sum, d) => sum + d.Estimated_Time, 0) / adjustedDrawers.length) * 10) / 10
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
      .sort((a, b) => (b.Estimated_Time || 0) - (a.Estimated_Time || 0))
      .slice(0, limit);
  }

  /**
   * Calculate productivity benchmarks
   * @param {Array} drawers - Array of drawers
   * @param {number} industryBenchmark - Industry standard drawers/hour (default: 10)
   * @returns {Object} Benchmark comparison
   */
  static getBenchmarks(drawers, industryBenchmark = 10) {
    const totalDrawers = drawers.length;
    const totalTime = this.getTotalTime(drawers);
    const avgTimePerDrawer = totalTime * 60 / totalDrawers; // in minutes

    const currentRate = avgTimePerDrawer > 0 ? 60 / avgTimePerDrawer : 0; // drawers per hour

    return {
      total_drawers: totalDrawers,
      avg_time_per_drawer: Math.round(avgTimePerDrawer * 10) / 10,
      current_rate: Math.round(currentRate * 10) / 10,
      industry_benchmark: industryBenchmark,
      performance_vs_benchmark: industryBenchmark > 0 ? Math.round((currentRate / industryBenchmark) * 100) : 0
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

    const totalMinutes = targetDrawers.reduce((sum, d) => sum + (d.Estimated_Time || 0), 0);
    const adjustedMinutes = totalMinutes * this.REALITY_FACTOR; // Aplicar factor realista
    const totalHours = adjustedMinutes / 60;
    const workersNeeded = Math.ceil(totalHours / shiftHours);

    return {
      total_drawers: targetDrawers.length,
      total_time_hours: Math.round(totalHours * 10) / 10,
      workers_needed: Math.max(1, workersNeeded),
      shift_duration: shiftHours,
      status: workersNeeded <= 2 ? 'OPTIMAL' : 'PEAK_LOAD'
    };
  }

  /**
   * Get peak times analysis
   * @param {Array} drawers - Array of drawers
   * @returns {Array} Peak time slots
   */
  static getPeakTimes(drawers) {
    const totalDrawers = drawers.length;

    return [
      {
        time: '06:00-08:00',
        drawers: Math.round(totalDrawers * 0.20),
        workers_needed: Math.max(1, Math.ceil((totalDrawers * 0.20) / 25)) // 25 drawers per worker más realista
      },
      {
        time: '10:00-12:00', 
        drawers: Math.round(totalDrawers * 0.30),
        workers_needed: Math.max(1, Math.ceil((totalDrawers * 0.30) / 25))
      },
      {
        time: '14:00-16:00',
        drawers: Math.round(totalDrawers * 0.35),
        workers_needed: Math.max(1, Math.ceil((totalDrawers * 0.35) / 25))
      },
      {
        time: '18:00-20:00',
        drawers: Math.round(totalDrawers * 0.15),
        workers_needed: Math.max(1, Math.ceil((totalDrawers * 0.15) / 25))
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
    const optimalStaff = Math.max(1, Math.ceil(totalHours / shiftHours));

    const currentCapacity = currentStaff * shiftHours;
    const utilization = currentCapacity > 0 ? Math.round((totalHours / currentCapacity) * 100) : 0;

    return {
      current_staff: currentStaff,
      optimal_staff: optimalStaff,
      difference: currentStaff - optimalStaff,
      utilization: Math.min(100, utilization),
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
