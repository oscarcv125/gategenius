# GateGenius - HackMTY 2025

## AI-Powered Airline Catering Intelligence Platform

### Team Members
- **Abel**: Data services, API integration, Zustand stores, algorithms
- **Hermann**: Module 1 (Expiration Intelligence Dashboard)
- **Diego**: Module 2 (Consumption Prediction Dashboard)
- **Oscar**: Module 3 (Workforce Planning) + Integration + Layout

---

## Quick Start

### Installation
```bash
cd gategenius
npm install
```

### Development
```bash
npm run dev
```

Open http://localhost:5173 in your browser

### Build
```bash
npm run build
```

---

## Project Structure

```
gategenius/
├── public/
│   └── data/                      # CSV datasets (automatically copied)
│       ├── expiration.csv
│       ├── consumption.csv
│       └── productivity.csv
│
├── src/
│   ├── api/                       # 🔥 ABEL's territory
│   │   └── geminiApi.js          # Gemini AI API wrapper (vision + text)
│   │
│   ├── services/                  # 🔥 ABEL's territory
│   │   └── dataService.js        # CSV parsing + data processing
│   │
│   ├── store/                     # 🔥 ABEL's territory
│   │   ├── expiryStore.js        # Zustand store for expiry data
│   │   ├── consumptionStore.js   # Zustand store for consumption data
│   │   └── productivityStore.js  # Zustand store for productivity data
│   │
│   ├── algorithms/                # 🔥 ABEL's territory
│   │   └── smartAssignment.js    # THE KILLER FEATURE algorithm
│   │
│   ├── modules/
│   │   ├── expiry/                # 📅 HERMANN's territory
│   │   │   └── ExpiryDashboard.jsx
│   │   │
│   │   ├── consumption/           # 📊 DIEGO's territory
│   │   │   └── ConsumptionDashboard.jsx
│   │   │
│   │   ├── productivity/          # 👥 OSCAR's territory
│   │   │   └── ProductivityDashboard.jsx
│   │   │
│   │   └── integration/           # ⚡ OSCAR's territory
│   │       └── SmartAssignmentDashboard.jsx
│   │
│   ├── components/
│   │   ├── layout/                # 🎨 OSCAR's territory
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   └── shared/                # Everyone can contribute
│   │       └── (reusable components)
│   │
│   ├── utils/                     # Everyone
│   │   └── (helper functions)
│   │
│   ├── App.jsx                    # Main app router
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind imports
│
├── .env.example                   # Environment variables template
└── package.json

```

---

## Modules Overview

### Module 1: Expiration Intelligence (Hermann)
**File:** `src/modules/expiry/ExpiryDashboard.jsx`

**Features to implement:**
- [x] Display critical expiry alerts (expiring today)
- [x] Display warning alerts (expiring this week)
- [x] Show stats cards
- [ ] Camera scanning UI (connect to `geminiApi.scanExpiryLabel()`)
- [ ] Auto-rotation recommendations
- [ ] LOT number search

**Zustand Store Functions:**
```javascript
import { useExpiryStore } from '../../store/expiryStore';

const {
  products,              // All products with expiry data
  loading,               // Loading state
  loadData,              // Load data from CSV
  getCriticalItems,      // Products expiring today
  getWarningItems,       // Products expiring this week
  getSortedByExpiry,     // All products sorted by expiry
  getByLotNumber,        // Filter by LOT number
  getWasteStats          // Statistics summary
} = useExpiryStore();
```

---

### Module 2: Consumption Intelligence (Diego)
**File:** `src/modules/consumption/ConsumptionDashboard.jsx`

**Features to implement:**
- [x] Display waste statistics
- [x] Show high waste products (low consumption rate)
- [x] Show stockout risk products (ran out early)
- [ ] Flight selector dropdown
- [ ] Per-flight consumption predictions
- [ ] Charts showing consumption trends (use Recharts)
- [ ] Product-specific recommendations

**Zustand Store Functions:**
```javascript
import { useConsumptionStore } from '../../store/consumptionStore';

const {
  flights,                    // All flight consumption data
  loading,
  loadData,
  getUniqueFlights,          // List of unique flights
  getFlightItems,            // Get items for specific flight
  getProductPattern,         // Consumption pattern for a product
  getHighWasteProducts,      // Products with <70% consumption
  getStockoutRiskProducts,   // Products that ran out
  getWasteStats,             // Overall statistics
  predictConsumption         // Predict consumption for product/flight
} = useConsumptionStore();
```

**Example: Predict consumption**
```javascript
const prediction = predictConsumption('DRK024', 'long-haul', 223);
// Returns: { predicted_qty, difference, avg_consumption_rate, confidence, recommendation }
```

---

### Module 3: Workforce Planning (Oscar)
**File:** `src/modules/productivity/ProductivityDashboard.jsx`

**Features to implement:**
- [x] Display workforce statistics
- [x] Show complexity breakdown
- [x] Peak times analysis
- [x] Benchmark comparison
- [ ] Interactive peak time chart (use Recharts)
- [ ] Worker assignment planner
- [ ] Shift schedule optimizer

**Zustand Store Functions:**
```javascript
import { useProductivityStore } from '../../store/productivityStore';

const {
  drawers,                  // All drawer data
  loading,
  loadData,
  getTotalTime,            // Total time in hours
  calculateWorkersNeeded,  // Calculate workers for shift
  getByCategory,           // Group by category
  getByFlightType,         // Group by flight type
  getComplexityStats,      // Simple/medium/complex breakdown
  getMostComplexDrawers,   // Top 10 complex drawers
  getBenchmarks,           // Performance vs industry
  planWorkforce            // Plan workforce for specific drawers
} = useProductivityStore();
```

---

### Module 4: Smart Assignment (Oscar + Abel)
**File:** `src/modules/integration/SmartAssignmentDashboard.jsx`

**THE KILLER FEATURE!**

This module combines all 3 systems:
- [x] Flight selector
- [x] Smart recommendations display
- [x] Integration of expiry + consumption + productivity
- [ ] Export to PDF/print loading list
- [ ] Animation/transitions for demo impact

**Algorithm:**
```javascript
import { generateSmartFlightAssignment } from '../../algorithms/smartAssignment';

const assignment = generateSmartFlightAssignment(
  flight,                        // Flight object
  expiryStore.products,          // Expiry products
  consumptionStore.flights,      // Consumption history
  consumptionStore.predictConsumption  // Prediction function
);

// Returns:
// {
//   flight_id, origin, flight_type,
//   recommendations: [ ... ],    // Per-product recommendations
//   summary: {
//     total_savings,
//     near_expiry_items_used,
//     assembly_time_change,
//     critical_items_count
//   }
// }
```

---

## Abel's Responsibilities

### 1. Gemini API Integration
**File:** `src/api/geminiApi.js`

**TODO:**
- [ ] Get Gemini API key
- [ ] Add to `.env` file as `VITE_GEMINI_API_KEY=your_key_here`
- [ ] Replace mock implementation with real API calls
- [ ] Test vision API with sample product label image
- [ ] Test text API for consumption predictions

**Functions:**
```javascript
import { geminiApi } from './api/geminiApi';

// Vision API - scan expiry labels
const result = await geminiApi.scanExpiryLabel(imageFile);
// Returns: { success, data: { Product_ID, LOT_Number, Expiry_Date, Product_Name } }

// Text API - predict consumption
const prediction = await geminiApi.predictConsumption(flightData, historicalData);
// Returns: { success, predictions: [...] }
```

### 2. Algorithm Enhancement
**File:** `src/algorithms/smartAssignment.js`

The core algorithm is done, but you can enhance:
- [ ] Better confidence scoring
- [ ] Multi-flight optimization
- [ ] Cost calculation improvements
- [ ] Peak time integration

### 3. Data Service
**File:** `src/services/dataService.js`

All done! But you can add:
- [ ] Data caching
- [ ] Real-time updates
- [ ] Data validation

---

## Environment Variables

Create a `.env` file in the root:

```bash
cp .env.example .env
```

Then edit `.env`:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

---

## Working in Parallel (No Conflicts!)

### Hermann - Expiry Module
```bash
# Only edit these files:
src/modules/expiry/ExpiryDashboard.jsx
src/components/shared/CameraScanner.jsx (if you create it)
```

### Diego - Consumption Module
```bash
# Only edit these files:
src/modules/consumption/ConsumptionDashboard.jsx
src/components/shared/FlightSelector.jsx (if you create it)
src/components/shared/ConsumptionChart.jsx (if you create it)
```

### Oscar - Productivity + Integration
```bash
# Edit these files:
src/modules/productivity/ProductivityDashboard.jsx
src/modules/integration/SmartAssignmentDashboard.jsx
src/components/layout/* (Header, Nav, etc.)
```

### Abel - Data Layer
```bash
# Edit these files:
src/api/geminiApi.js
src/services/dataService.js
src/algorithms/smartAssignment.js
src/store/* (all stores)
```

**Git workflow:**
```bash
# Create your branch
git checkout -b feature/your-name-module

# Make changes, test locally
npm run dev

# Commit frequently
git add .
git commit -m "feat: add camera scanning UI"

# Push your branch
git push origin feature/your-name-module

# Create PR when ready
```

---

## Available Tools

### Zustand (State Management)
```javascript
import { useExpiryStore } from './store/expiryStore';

function MyComponent() {
  const { products, loadData } = useExpiryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return <div>{products.length} products</div>;
}
```

### Lucide Icons
```javascript
import { Calendar, TrendingUp, Users, Zap } from 'lucide-react';

<Calendar className="w-6 h-6 text-blue-500" />
```

### Recharts (for charts - Hermann & Diego)
```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<BarChart width={500} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#3b82f6" />
</BarChart>
```

### Tailwind CSS
```javascript
// Use utility classes
<div className="bg-blue-50 p-4 rounded-lg shadow-md">
  <h3 className="text-lg font-bold text-gray-900">Title</h3>
</div>

// Pre-defined classes (see src/index.css)
<div className="card">...</div>
<button className="btn-primary">Click me</button>
<div className="alert-danger">Critical alert!</div>
```

---

## Demo Strategy (Thursday Presentation)

### Act 1: The Problem (1 min)
Show the Expiration Dashboard with critical alerts

### Act 2: The Solutions (3 min)
1. **Hermann**: Demo camera scanning
2. **Diego**: Show consumption predictions and waste reduction
3. **Oscar**: Display workforce planning

### Act 3: THE KILLER FEATURE (2 min)
**Oscar**: Smart Assignment Dashboard
- Select a flight
- Show AI recommendations combining all 3 modules
- Animate the numbers changing
- Show total savings: $22.50 per flight → $164M globally

### Act 4: The Impact (1 min)
Show before/after metrics

---

## Development Tips

### Hot Module Replacement (HMR)
Changes to your module will update instantly in the browser - no need to refresh!

### Check Console
```bash
npm run dev
```
Then open browser console (F12) to see:
- ✅ Data loading logs
- 🔍 Store state updates
- ❌ Any errors

### Debug Zustand State
Install React DevTools extension, then:
```javascript
// Add to any component
console.log('Store state:', useExpiryStore.getState());
```

### CSS Issues?
Tailwind classes not working? Make sure:
1. `index.css` has `@tailwind` directives
2. Component files are in `src/**/*.jsx`
3. Restart dev server: Ctrl+C, then `npm run dev`

---

## Common Issues

### "Cannot find module"
```bash
npm install  # Reinstall dependencies
```

### "Port 5173 already in use"
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9
# Or use different port
npm run dev -- --port 3000
```

### CSV not loading
Check browser Network tab - files should be at:
- http://localhost:5173/data/expiration.csv
- http://localhost:5173/data/consumption.csv
- http://localhost:5173/data/productivity.csv

### Gemini API errors
- Check API key in `.env`
- Check API quota: https://makersuite.google.com/
- Use mock responses for now (already implemented)

---

## Next Steps (Day 2 & 3)

### Day 2 (Tomorrow):
- [ ] Abel: Real Gemini API integration
- [ ] Hermann: Camera scanning UI
- [ ] Diego: Flight selector + predictions
- [ ] Oscar: Charts and visualizations

### Day 3 (Demo Day):
- [ ] Polish UI/UX
- [ ] Add animations
- [ ] Practice demo
- [ ] Prepare backup (screenshots/video)

---

## Contact

Questions? Ask in the team chat!

- Abel: Data/API questions
- Hermann: Expiry module questions
- Diego: Consumption module questions
- Oscar: Integration/layout questions

---

## Let's WIN this! 🏆🚀

Remember: We're not just building a dashboard - we're saving $164 MILLION annually for Gategroup! 💰
