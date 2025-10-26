import { create } from 'zustand';
import { ExpirationDataService } from '../services/ExpirationDataService';

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
      const data = await ExpirationDataService.loadData();
      set({
        products: data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Computed functions
  getCriticalItems: () => {
    const { products } = get();
    return products.filter(p => p.Days_Left !== null && p.Days_Left <= 0);
  },

  getWarningItems: () => {
    const { products } = get();
    return products.filter(p => p.Days_Left !== null && p.Days_Left > 0 && p.Days_Left <= 7);
  },

  getWasteStats: () => {
    const { products } = get();
    const criticalItems = products.filter(p => p.Days_Left !== null && p.Days_Left <= 0);
    const warningItems = products.filter(p => p.Days_Left !== null && p.Days_Left > 0 && p.Days_Left <= 7);

    return {
      total_products: products.length,
      critical_count: criticalItems.length,
      critical_units: criticalItems.reduce((sum, p) => sum + p.Quantity, 0),
      warning_count: warningItems.length,
      warning_units: warningItems.reduce((sum, p) => sum + p.Quantity, 0),
      estimated_critical_value: criticalItems.reduce((sum, p) => sum + (p.Quantity * 2.5), 0)
    };
  },

  deleteProduct: async (lotNumber) => {
    set({ deleting: true });
    try {
      // Llamar al backend
      await ExpirationDataService.deleteProduct(lotNumber);
      
      // Actualizar estado local inmediatamente (eliminar por LOT)
      const currentProducts = get().products;
      const updatedProducts = currentProducts.filter(p => 
        (p.LOT_Number || p.lotnumber) !== lotNumber
      );
      
      set({ 
        products: updatedProducts,
        deleting: false
      });

      console.log(`Product with LOT ${lotNumber} deleted successfully`);
      
    } catch (error) {
      set({ deleting: false });
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  addScannedProduct: (productData) => {
    set(state => ({
      products: [...state.products, { ...productData, id: Date.now() }]
    }));
  }
}));
