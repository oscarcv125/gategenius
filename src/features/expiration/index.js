/**
 * Expiration Intelligence Module
 * Public API - Only export what other modules need to access
 */

// Services
export { ExpirationDataService } from './services/ExpirationDataService';
export { ExpirationBusinessLogic } from './services/ExpirationBusinessLogic';

// Store
export { useExpiryStore } from './store/expiryStore';

// Utils
export {
  calculateDaysUntilExpiry,
  formatDaysUntilExpiry,
  getExpiryCategory,
  estimateProductValue
} from './utils/expirationCalculations';

// Note: Components are not exported as they're module-internal
// Other modules should not import UI components directly
