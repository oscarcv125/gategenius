import { create } from 'zustand';
import { dataService } from '../services/dataService';

/**
 * Expiry Store - Manages expiration tracking state
 * Owner: Abel (state) + Hermann (UI integration)
 *
 * This store handles:
 * - Loading expiration data
 * - Tracking critical/warning items
 * - Providing sorted/filtered views
 */

export const useExpiryStore = create((set, get) => ({
  // State
  products: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dataService.loadExpirationData();
      set({
        products: data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  removeProduct: (productToRemove) => {
    set((state) => ({
      products: state.products.filter(
        p => !(p.LOT_Number === productToRemove.LOT_Number && p.Product_ID === productToRemove.Product_ID)
      )
    }));
  },

  // Computed/Selector functions

  /**
   * Get products expiring today (critical alerts)
   */
  getCriticalItems: () => {
    const products = get().products;
    return products.filter(p => p.Days_Until_Expiry === 0);
  },

  /**
   * Get products expiring this week (warnings)
   */
  getWarningItems: () => {
    const products = get().products;
    return products.filter(p => p.Days_Until_Expiry > 0 && p.Days_Until_Expiry <= 7);
  },

  /**
   * Get all items sorted by expiry date (soonest first)
   */
  getSortedByExpiry: () => {
    const products = get().products;
    return [...products].sort((a, b) => a.Days_Until_Expiry - b.Days_Until_Expiry);
  },

  /**
   * Get items by LOT number
   */
  getByLotNumber: (lotNumber) => {
    const products = get().products;
    return products.filter(p => p.LOT_Number === lotNumber);
  },

  /**
   * Get total value at risk (expiring today)
   */
  getCriticalValue: () => {
    const critical = get().getCriticalItems();
    // Assuming average cost of $0.50 per unit (can be enhanced with actual costs)
    return critical.reduce((sum, item) => sum + (item.Quantity * 0.5), 0);
  },

  /**
   * Get waste statistics
   */
  getWasteStats: () => {
    const products = get().products;
    const critical = get().getCriticalItems();
    const warning = get().getWarningItems();

    return {
      total_products: products.length,
      critical_count: critical.length,
      warning_count: warning.length,
      critical_units: critical.reduce((sum, p) => sum + p.Quantity, 0),
      warning_units: warning.reduce((sum, p) => sum + p.Quantity, 0),
      estimated_critical_value: get().getCriticalValue()
    };
  }
}));
