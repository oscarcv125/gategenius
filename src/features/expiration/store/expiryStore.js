/**
 * Expiration Store (Zustand)
 * State management for expiration module
 */

import { create } from 'zustand';
import { ExpiryDataService } from '../services/ExpirationDataService';
import { ExpirationBusinessLogic } from '../services/ExpirationBusinessLogic';
import { calculateDaysUntilExpiry } from '../utils/expirationCalculations';

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
      const data = await ExpiryDataService.loadData();
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

  /**
   * Add a scanned product to the inventory
   * @param {Object} scannedData - Product data from scanner
   */
  addScannedProduct: (scannedData) => {
    set((state) => {
      // Check if product already exists (by LOT_Number + Product_ID)
      const exists = state.products.some(
        p => p.LOT_Number === scannedData.LOT_Number &&
             p.Product_ID === scannedData.Product_ID
      );

      if (exists) {
        console.log('⚠️ Product already exists in database');
        return state; // No change
      }

      // Add new product with calculated fields
      const newProduct = {
        Product_ID: scannedData.Product_ID || 'SCANNED',
        Product_Name: scannedData.Product_Name || 'Scanned Product',
        Weight_or_Volume: scannedData.Weight_or_Volume || '',
        LOT_Number: scannedData.LOT_Number || 'Unknown',
        Expiry_Date: scannedData.Expiry_Date || 'Unknown',
        Quantity: parseInt(scannedData.Quantity) || 1,
        Expiry_Date_Parsed: new Date(scannedData.Expiry_Date),
        Days_Until_Expiry: calculateDaysUntilExpiry(scannedData.Expiry_Date),
        _scanned: true, // Flag to identify scanned products
        _scan_timestamp: new Date().toISOString()
      };

      console.log('✅ Added scanned product to inventory:', newProduct);

      return {
        products: [...state.products, newProduct]
      };
    });
  },

  // Computed/Selector functions - Use Business Logic
  getCriticalItems: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getCriticalItems(products);
  },

  getWarningItems: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getWarningItems(products);
  },

  getExpiredItems: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getExpiredItems(products);
  },

  getSortedByExpiry: () => {
    const { products } = get();
    return [...products].sort((a, b) => a.Days_Until_Expiry - b.Days_Until_Expiry);
  },

  getByLotNumber: (lotNumber) => {
    const { products } = get();
    return ExpirationBusinessLogic.getProductByLOT(products, lotNumber);
  },

  getWasteStats: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getWasteStats(products);
  },

  getRotationRecommendations: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getRotationRecommendations(products);
  },

  searchProducts: (searchTerm) => {
    const { products } = get();
    return ExpirationBusinessLogic.searchProducts(products, searchTerm);
  },

  groupByCategory: () => {
    const { products } = get();
    return ExpirationBusinessLogic.groupByExpiryCategory(products);
  }
}));
