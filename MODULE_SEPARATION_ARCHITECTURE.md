# Module Separation Architecture - Clean Backend Migration

## Current Architecture Analysis

### Problem: Monolithic Structure

```
Current Structure (Coupled):
src/
├── services/
│   └── dataService.js          ❌ Handles ALL modules (expiration, consumption, productivity)
├── store/
│   ├── expiryStore.js          ⚠️ Depends on monolithic dataService
│   ├── consumptionStore.js     ⚠️ Depends on monolithic dataService
│   └── productivityStore.js    ⚠️ Depends on monolithic dataService
├── modules/
│   ├── expiry/                 ✅ UI only
│   ├── consumption/            ✅ UI only
│   ├── productivity/           ✅ UI only
│   └── integration/            ⚠️ Depends on multiple stores
└── algorithms/
    └── smartAssignment.js      ⚠️ Depends on multiple data sources
```

**Issues:**
1. **dataService.js is monolithic** - handles expiration, consumption, AND productivity
2. **Cross-module dependencies** - Smart Assignment imports from multiple stores
3. **No clear boundaries** - Business logic scattered across stores, services, and algorithms
4. **Hard to migrate** - Can't move one module to backend independently

---

## Proposed Architecture: Self-Contained Modules

### New Structure (Decoupled)

```
src/
├── features/                   # ✨ NEW: Each feature is self-contained
│   │
│   ├── expiration/             # 📦 EXPIRATION INTELLIGENCE MODULE
│   │   ├── index.js            # Public API exports
│   │   ├── services/
│   │   │   ├── ExpirationDataService.js    # CSV loading, parsing
│   │   │   └── ExpirationBusinessLogic.js  # Calculations, analysis
│   │   ├── store/
│   │   │   └── expiryStore.js              # Zustand state
│   │   ├── hooks/
│   │   │   └── useExpiration.js            # React hooks
│   │   ├── components/
│   │   │   ├── ExpiryDashboard.jsx
│   │   │   ├── ProductTable.jsx            # Module-specific table
│   │   │   └── CameraScanner.jsx           # Module-specific scanner
│   │   ├── utils/
│   │   │   ├── expirationCalculations.js
│   │   │   └── expirationValidators.js
│   │   ├── types/
│   │   │   └── expiration.types.js         # TypeScript-ready types
│   │   └── reports/
│   │       ├── promptBuilder.js
│   │       ├── mockGenerator.js
│   │       └── dataFormatter.js
│   │
│   ├── consumption/            # 📦 CONSUMPTION PREDICTION MODULE
│   │   ├── index.js
│   │   ├── services/
│   │   │   ├── ConsumptionDataService.js
│   │   │   └── ConsumptionBusinessLogic.js
│   │   ├── store/
│   │   │   └── consumptionStore.js
│   │   ├── hooks/
│   │   │   └── useConsumption.js
│   │   ├── components/
│   │   │   ├── ConsumptionDashboard.jsx
│   │   │   ├── FlightSelector.jsx
│   │   │   └── ConsumptionChart.jsx
│   │   ├── utils/
│   │   │   ├── consumptionCalculations.js
│   │   │   └── consumptionValidators.js
│   │   ├── types/
│   │   │   └── consumption.types.js
│   │   └── reports/
│   │       ├── promptBuilder.js
│   │       ├── mockGenerator.js
│   │       └── dataFormatter.js
│   │
│   ├── productivity/           # 📦 WORKFORCE PLANNING MODULE
│   │   ├── index.js
│   │   ├── services/
│   │   │   ├── ProductivityDataService.js
│   │   │   └── ProductivityBusinessLogic.js
│   │   ├── store/
│   │   │   └── productivityStore.js
│   │   ├── hooks/
│   │   │   └── useProductivity.js
│   │   ├── components/
│   │   │   ├── ProductivityDashboard.jsx
│   │   │   └── PeakTimeChart.jsx
│   │   ├── utils/
│   │   │   ├── productivityCalculations.js
│   │   │   └── productivityValidators.js
│   │   ├── types/
│   │   │   └── productivity.types.js
│   │   └── reports/
│   │       ├── promptBuilder.js
│   │       ├── mockGenerator.js
│   │       └── dataFormatter.js
│   │
│   └── smartAssignment/        # 📦 SMART ASSIGNMENT MODULE
│       ├── index.js
│       ├── services/
│       │   └── SmartAssignmentService.js   # Orchestrates other modules
│       ├── algorithms/
│       │   └── optimizationAlgorithm.js
│       ├── components/
│       │   ├── SmartAssignmentDashboard.jsx
│       │   └── ImpactSummary.jsx
│       ├── hooks/
│       │   └── useSmartAssignment.js
│       ├── utils/
│       │   └── assignmentCalculations.js
│       ├── types/
│       │   └── smartAssignment.types.js
│       └── reports/
│           ├── promptBuilder.js
│           ├── mockGenerator.js
│           └── dataFormatter.js
│
├── shared/                     # Shared utilities (used by all modules)
│   ├── api/
│   │   ├── geminiApi.js        # Shared API client
│   │   └── cloudVisionApi.js
│   ├── components/
│   │   ├── ReportDownloader.jsx
│   │   └── layout/
│   ├── hooks/
│   │   └── useCSVLoader.js     # Shared CSV loading hook
│   └── utils/
│       ├── csvParser.js
│       └── dateHelpers.js
│
└── app/                        # Application shell
    ├── App.jsx
    ├── Router.jsx
    └── main.jsx
```

---

## Detailed Module Structure

### Example: Expiration Intelligence Module

#### 1. `features/expiration/index.js` - Public API
```javascript
/**
 * Expiration Intelligence Module
 *
 * Public API - Only export what other modules need to access
 */

// Services
export { ExpirationDataService } from './services/ExpirationDataService';
export { ExpirationBusinessLogic } from './services/ExpirationBusinessLogic';

// Store
export { useExpiryStore } from './store/expiryStore';

// Hooks
export { useExpiration } from './hooks/useExpiration';

// Components (only if needed outside module)
export { ExpiryDashboard } from './components/ExpiryDashboard';

// Types
export * from './types/expiration.types';
```

#### 2. `features/expiration/services/ExpirationDataService.js`
```javascript
/**
 * Expiration Data Service
 * Handles all data loading and parsing for expiration module
 */

import { parseCSV } from '@/shared/utils/csvParser';
import { calculateDaysUntilExpiry } from '../utils/expirationCalculations';

export class ExpirationDataService {
  /**
   * Load expiration data from CSV
   */
  static async loadData() {
    try {
      const rawData = await parseCSV('/data/expiration.csv');
      return this.transformData(rawData);
    } catch (error) {
      console.error('Failed to load expiration data:', error);
      throw error;
    }
  }

  /**
   * Transform raw CSV data into structured format
   */
  static transformData(rawData) {
    return rawData.map(item => ({
      productId: item.Product_ID,
      productName: item.Product_Name,
      weight: item.Weight_or_Volume,
      lotNumber: item.LOT_Number,
      expiryDate: item.Expiry_Date,
      quantity: parseInt(item.Quantity) || 0,
      // Computed fields
      expiryDateParsed: new Date(item.Expiry_Date),
      daysUntilExpiry: calculateDaysUntilExpiry(item.Expiry_Date)
    }));
  }

  /**
   * Validate data structure
   */
  static validate(data) {
    // Validation logic
    return {
      isValid: true,
      errors: []
    };
  }
}
```

#### 3. `features/expiration/services/ExpirationBusinessLogic.js`
```javascript
/**
 * Expiration Business Logic
 * All calculations and analysis for expiration module
 */

export class ExpirationBusinessLogic {
  /**
   * Get critical items (expiring today)
   */
  static getCriticalItems(products) {
    return products.filter(p => p.daysUntilExpiry === 0);
  }

  /**
   * Get warning items (expiring this week)
   */
  static getWarningItems(products) {
    return products.filter(p =>
      p.daysUntilExpiry > 0 &&
      p.daysUntilExpiry <= 7
    );
  }

  /**
   * Calculate waste statistics
   */
  static getWasteStats(products) {
    const critical = this.getCriticalItems(products);
    const warning = this.getWarningItems(products);

    return {
      totalProducts: products.length,
      criticalCount: critical.length,
      criticalUnits: critical.reduce((sum, p) => sum + p.quantity, 0),
      warningCount: warning.length,
      warningUnits: warning.reduce((sum, p) => sum + p.quantity, 0),
      estimatedCriticalValue: this.calculateValue(critical)
    };
  }

  /**
   * Calculate total value of products
   */
  static calculateValue(products, avgUnitCost = 1.5) {
    return products.reduce((sum, p) =>
      sum + (p.quantity * avgUnitCost), 0
    );
  }

  /**
   * Get rotation recommendations
   */
  static getRotationRecommendations(products) {
    const critical = this.getCriticalItems(products);

    return critical.map(product => ({
      productId: product.productId,
      productName: product.productName,
      lotNumber: product.lotNumber,
      quantity: product.quantity,
      action: 'ASSIGN_TO_FLIGHT',
      priority: 'CRITICAL',
      recommendation: `Use LOT ${product.lotNumber} immediately on next available flight`
    }));
  }
}
```

#### 4. `features/expiration/store/expiryStore.js`
```javascript
/**
 * Expiration Store (Zustand)
 * State management for expiration module
 */

import { create } from 'zustand';
import { ExpirationDataService } from '../services/ExpirationDataService';
import { ExpirationBusinessLogic } from '../services/ExpirationBusinessLogic';

export const useExpiryStore = create((set, get) => ({
  // State
  products: [],
  loading: false,
  error: null,

  // Actions
  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await ExpirationDataService.loadData();
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addScannedProduct: (product) => {
    set((state) => ({
      products: [...state.products, product]
    }));
  },

  removeProduct: (lotNumber) => {
    set((state) => ({
      products: state.products.filter(p => p.lotNumber !== lotNumber)
    }));
  },

  // Getters (use business logic)
  getCriticalItems: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getCriticalItems(products);
  },

  getWarningItems: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getWarningItems(products);
  },

  getWasteStats: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getWasteStats(products);
  },

  getRotationRecommendations: () => {
    const { products } = get();
    return ExpirationBusinessLogic.getRotationRecommendations(products);
  }
}));
```

#### 5. `features/expiration/hooks/useExpiration.js`
```javascript
/**
 * Expiration Hook
 * Convenient hook for components
 */

import { useEffect } from 'react';
import { useExpiryStore } from '../store/expiryStore';

export const useExpiration = () => {
  const store = useExpiryStore();

  // Auto-load data on mount
  useEffect(() => {
    if (store.products.length === 0 && !store.loading) {
      store.loadData();
    }
  }, []);

  return {
    // State
    products: store.products,
    loading: store.loading,
    error: store.error,

    // Computed
    criticalItems: store.getCriticalItems(),
    warningItems: store.getWarningItems(),
    stats: store.getWasteStats(),
    recommendations: store.getRotationRecommendations(),

    // Actions
    reload: store.loadData,
    addProduct: store.addScannedProduct,
    removeProduct: store.removeProduct
  };
};
```

#### 6. `features/expiration/utils/expirationCalculations.js`
```javascript
/**
 * Expiration Calculations
 * Pure utility functions for expiration module
 */

export const calculateDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const formatDaysUntilExpiry = (days) => {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  return `${days} days`;
};

export const getExpiryCategory = (days) => {
  if (days < 0) return 'EXPIRED';
  if (days === 0) return 'CRITICAL';
  if (days <= 7) return 'WARNING';
  if (days <= 30) return 'MODERATE';
  return 'SAFE';
};
```

---

## Smart Assignment Module (Integration Point)

### `features/smartAssignment/services/SmartAssignmentService.js`

```javascript
/**
 * Smart Assignment Service
 * Orchestrates data from multiple modules
 */

import { ExpirationBusinessLogic } from '@/features/expiration';
import { ConsumptionBusinessLogic } from '@/features/consumption';
import { ProductivityBusinessLogic } from '@/features/productivity';

export class SmartAssignmentService {
  /**
   * Generate optimized flight assignment
   *
   * This service coordinates multiple modules but doesn't depend on their stores
   */
  static generateAssignment(flight, expirationData, consumptionData, productivityData) {
    // 1. Get near-expiry products from expiration module
    const nearExpiryProducts = ExpirationBusinessLogic.getCriticalItems(expirationData);

    // 2. Get consumption predictions from consumption module
    const flightPredictions = ConsumptionBusinessLogic.predictForFlight(
      flight,
      consumptionData
    );

    // 3. Calculate productivity impact
    const productivityImpact = ProductivityBusinessLogic.estimateImpact(
      flight,
      productivityData
    );

    // 4. Generate optimized recommendations
    return this.optimize(nearExpiryProducts, flightPredictions, productivityImpact);
  }

  static optimize(nearExpiry, predictions, productivity) {
    // Optimization algorithm logic
    // Returns: { recommendations, summary, financialImpact }
  }
}
```

---

## Backend Migration Path

### Phase 1: Frontend Refactoring (Current)

**Structure:**
```
frontend/src/features/
├── expiration/
├── consumption/
├── productivity/
└── smartAssignment/
```

**Usage:**
```javascript
// In component
import { useExpiration } from '@/features/expiration';

const MyComponent = () => {
  const { criticalItems, stats, reload } = useExpiration();
  // ...
};
```

---

### Phase 2: Backend Implementation (Future)

#### Backend Structure (Node.js/Express Example)

```
backend/
├── src/
│   ├── features/
│   │   ├── expiration/
│   │   │   ├── services/
│   │   │   │   ├── ExpirationDataService.js    # ✨ Same as frontend!
│   │   │   │   └── ExpirationBusinessLogic.js  # ✨ Same as frontend!
│   │   │   ├── routes/
│   │   │   │   └── expirationRoutes.js
│   │   │   └── controllers/
│   │   │       └── expirationController.js
│   │   ├── consumption/
│   │   ├── productivity/
│   │   └── smartAssignment/
│   └── shared/
│       └── utils/
│           └── csvParser.js                     # ✨ Same as frontend!
```

#### Backend API Endpoints

**Expiration API:**
```javascript
// backend/src/features/expiration/routes/expirationRoutes.js
import express from 'express';
import { ExpirationBusinessLogic } from '../services/ExpirationBusinessLogic.js';

const router = express.Router();

// GET /api/expiration/data
router.get('/data', async (req, res) => {
  try {
    const data = await ExpirationDataService.loadData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/expiration/critical
router.get('/critical', async (req, res) => {
  const data = await ExpirationDataService.loadData();
  const critical = ExpirationBusinessLogic.getCriticalItems(data);
  res.json(critical);
});

// GET /api/expiration/stats
router.get('/stats', async (req, res) => {
  const data = await ExpirationDataService.loadData();
  const stats = ExpirationBusinessLogic.getWasteStats(data);
  res.json(stats);
});

export default router;
```

**Smart Assignment API (Integration):**
```javascript
// backend/src/features/smartAssignment/routes/assignmentRoutes.js
import { SmartAssignmentService } from '../services/SmartAssignmentService.js';
import { ExpirationDataService } from '@/features/expiration';
import { ConsumptionDataService } from '@/features/consumption';
import { ProductivityDataService } from '@/features/productivity';

router.post('/generate', async (req, res) => {
  const { flightId } = req.body;

  // Load data from all modules
  const [expirationData, consumptionData, productivityData] = await Promise.all([
    ExpirationDataService.loadData(),
    ConsumptionDataService.loadData(),
    ProductivityDataService.loadData()
  ]);

  // Find flight
  const flight = consumptionData.find(f => f.Flight_ID === flightId);

  // Generate assignment using same business logic as frontend!
  const assignment = SmartAssignmentService.generateAssignment(
    flight,
    expirationData,
    consumptionData,
    productivityData
  );

  res.json(assignment);
});
```

#### Frontend API Client (After Backend)

```javascript
// frontend/src/features/expiration/services/ExpirationApiClient.js
export class ExpirationApiClient {
  static async loadData() {
    const response = await fetch('/api/expiration/data');
    return response.json();
  }

  static async getCritical() {
    const response = await fetch('/api/expiration/critical');
    return response.json();
  }

  static async getStats() {
    const response = await fetch('/api/expiration/stats');
    return response.json();
  }
}
```

```javascript
// Update store to use API
import { ExpirationApiClient } from '../services/ExpirationApiClient';

export const useExpiryStore = create((set, get) => ({
  loadData: async () => {
    set({ loading: true });
    try {
      // Call backend instead of loading CSV
      const data = await ExpirationApiClient.loadData();
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  // ... rest stays the same
}));
```

---

## Key Benefits

### 1. Module Independence
Each module can be:
- ✅ Developed independently
- ✅ Tested independently
- ✅ Deployed independently (microservices)
- ✅ Migrated to backend one at a time

### 2. Code Reuse
```javascript
// Same business logic on frontend AND backend!
import { ExpirationBusinessLogic } from './features/expiration';

const critical = ExpirationBusinessLogic.getCriticalItems(data);
```

### 3. Clear Boundaries
```
Expiration Module:
  - Only knows about expiration data
  - Exposes public API via index.js
  - Other modules import through public API

Smart Assignment Module:
  - Orchestrates multiple modules
  - Uses public APIs only
  - No direct access to internal services
```

### 4. Easy Testing
```javascript
// Test business logic in isolation
import { ExpirationBusinessLogic } from '@/features/expiration';

test('getCriticalItems returns items expiring today', () => {
  const mockData = [
    { daysUntilExpiry: 0, productName: 'Milk' },
    { daysUntilExpiry: 5, productName: 'Bread' }
  ];

  const result = ExpirationBusinessLogic.getCriticalItems(mockData);
  expect(result).toHaveLength(1);
  expect(result[0].productName).toBe('Milk');
});
```

### 5. TypeScript Ready
```typescript
// features/expiration/types/expiration.types.ts
export interface ExpirationProduct {
  productId: string;
  productName: string;
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  daysUntilExpiry: number;
}

export interface WasteStats {
  totalProducts: number;
  criticalCount: number;
  criticalUnits: number;
  // ...
}
```

---

## Migration Steps

### Step 1: Create Module Structure
```bash
mkdir -p src/features/{expiration,consumption,productivity,smartAssignment}/{services,components,utils,hooks,types,reports}
```

### Step 2: Extract Expiration Module (First)
1. Move `src/services/dataService.js` expiration methods → `ExpirationDataService.js`
2. Create `ExpirationBusinessLogic.js` from store calculations
3. Update `expiryStore.js` to use new services
4. Move components to `features/expiration/components/`
5. Create public API in `index.js`

### Step 3: Repeat for Other Modules
- Consumption
- Productivity
- Smart Assignment

### Step 4: Update Imports
```javascript
// Before
import { useExpiryStore } from '@/store/expiryStore';

// After
import { useExpiration } from '@/features/expiration';
```

### Step 5: Test Each Module
- Unit tests for business logic
- Integration tests for services
- E2E tests for full flow

---

## Example: Complete Module Usage

```javascript
// features/expiration/index.js
export { ExpirationDataService } from './services/ExpirationDataService';
export { ExpirationBusinessLogic } from './services/ExpirationBusinessLogic';
export { useExpiryStore } from './store/expiryStore';
export { useExpiration } from './hooks/useExpiration';
export { ExpiryDashboard } from './components/ExpiryDashboard';
```

```javascript
// In App.jsx
import { ExpiryDashboard } from '@/features/expiration';

function App() {
  return <ExpiryDashboard />;
}
```

```javascript
// In Smart Assignment
import { ExpirationBusinessLogic } from '@/features/expiration';
import { ConsumptionBusinessLogic } from '@/features/consumption';

const critical = ExpirationBusinessLogic.getCriticalItems(expirationData);
const predictions = ConsumptionBusinessLogic.predictForFlight(flight, consumptionData);
```

---

## Conclusion

This architecture provides:
✅ **Complete module separation** - Each section is self-contained
✅ **Easy backend migration** - Copy services folder to backend
✅ **Code reuse** - Same business logic frontend & backend
✅ **Clear boundaries** - Public APIs between modules
✅ **Independent development** - Work on modules in parallel
✅ **Testability** - Unit test business logic easily
✅ **Scalability** - Add new modules without touching existing ones

**Next Step:** Start with Expiration module refactoring, then replicate for other 3 modules.
