/**
 * Consumption Prediction Module
 * Public API - Only export what other modules need to access
 */

// Services
export { ConsumptionDataService } from './services/ConsumptionDataService';
export { ConsumptionBusinessLogic } from './services/ConsumptionBusinessLogic';

// Store
export { useConsumptionStore } from './store/consumptionStore';

// Utils
export {
  calculateConsumptionRate,
  calculateWasteCost,
  isHighWaste,
  hasStockoutRisk,
  recommendQuantityAdjustment
} from './utils/consumptionCalculations';
