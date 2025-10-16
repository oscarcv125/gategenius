# GateGenius - Technical Documentation

> Comprehensive technical guide for developers working on the GateGenius platform

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Setup & Installation](#setup--installation)
5. [Development Guide](#development-guide)
6. [State Management](#state-management)
7. [Modules Deep Dive](#modules-deep-dive)
8. [UI Components](#ui-components)
9. [Dark Mode Implementation](#dark-mode-implementation)
10. [Data Flow](#data-flow)
11. [API Integration](#api-integration)
12. [Build & Deployment](#build--deployment)
13. [Testing](#testing)
14. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend (Vite)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Expiry   │  │Consumption│  │Workforce │     │
│  │ Module   │  │  Module   │  │  Module  │     │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘     │
│       │              │              │           │
│       └──────────────┴──────────────┘           │
│                      │                          │
│              ┌───────▼────────┐                 │
│              │ Smart Assignment│                │
│              │    (AI Core)    │                │
│              └───────┬────────┘                 │
│                      │                          │
│  ┌───────────────────┴────────────────────┐    │
│  │        Zustand State Stores            │    │
│  └───────────────────┬────────────────────┘    │
│                      │                          │
│  ┌───────────────────▼────────────────────┐    │
│  │        Data Services Layer             │    │
│  │  (CSV Parsing, Calculations, Logic)    │    │
│  └────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Design Patterns

- **Component-Based Architecture**: Modular React components
- **State Management**: Zustand stores for each module
- **Service Layer**: Separated business logic from UI
- **Custom Hooks**: Reusable logic (useDarkMode, useStore)
- **Responsive Design**: Mobile-first with Tailwind CSS

---

## Project Structure

```
HackMTY2025/
├── public/
│   └── Logo.png                    # Application logo
├── src/
│   ├── algorithms/
│   │   └── smartAssignment.js      # AI matching algorithm
│   ├── api/
│   │   ├── cloudVisionApi.js       # Gemini Vision API
│   │   └── productScanner.js       # Barcode scanning logic
│   ├── assets/
│   │   └── [images]                # Static assets
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx          # Top navigation bar
│   │   │   ├── Navigation.jsx      # Module tabs
│   │   │   └── MainLayout.jsx      # Main wrapper
│   │   └── shared/
│   │       ├── CameraScanner.jsx   # Product scanning UI
│   │       ├── ConsumptionChart.jsx
│   │       ├── FlightSelector.jsx
│   │       ├── ImpactSummary.jsx
│   │       ├── PeakTimeChart.jsx
│   │       ├── ProductTable.jsx
│   │       └── ReportDownloader.jsx
│   ├── hooks/
│   │   └── useDarkMode.js          # Dark mode management
│   ├── modules/
│   │   ├── consumption/
│   │   │   ├── ConsumptionDashboard.jsx
│   │   │   └── services/
│   │   │       └── ConsumptionDataService.js
│   │   ├── expiry/
│   │   │   ├── ExpiryDashboard.jsx
│   │   │   └── services/
│   │   │       └── ExpirationDataService.js
│   │   ├── integration/
│   │   │   └── SmartAssignmentDashboard.jsx
│   │   └── productivity/
│   │       ├── ProductivityDashboard.jsx
│   │       └── services/
│   │           └── ProductivityDataService.js
│   ├── services/
│   │   └── dataService.js          # Core data operations
│   ├── store/
│   │   ├── consumptionStore.js
│   │   ├── expiryStore.js
│   │   └── productivityStore.js
│   ├── utils/
│   │   ├── dateHelpers.js
│   │   ├── productMatcher.js
│   │   └── reportGenerators/
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # App entry point
│   └── index.css                   # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── README.md
└── TECHNICAL_DOCS.md
```

---

## Technology Stack

### Core Dependencies

```json
{
  "react": "^19.1.1",           // UI framework
  "react-dom": "^19.1.1",       // DOM rendering
  "vite": "^7.1.12",            // Build tool
  "tailwindcss": "^3.4.18",     // CSS framework
  "zustand": "^5.0.8",          // State management
  "lucide-react": "^0.548.0",   // Icon library
  "recharts": "^3.3.0",         // Charts
  "papaparse": "^5.5.3",        // CSV parsing
  "jspdf": "^3.0.3",            // PDF generation
  "jspdf-autotable": "^5.0.2",  // PDF tables
  "xlsx": "^0.18.5"             // Excel export
}
```

### Dev Dependencies

```json
{
  "@vitejs/plugin-react": "^5.0.4",
  "autoprefixer": "^10.4.21",
  "postcss": "^8.5.6",
  "eslint": "^9.36.0"
}
```

---

## Setup & Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/oscarcv125/HackMTY2025.git
cd HackMTY2025

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file (if needed for API keys):

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

---

## Development Guide

### npm Scripts

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style

- **Formatting**: 2-space indentation
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **File Organization**: Group related files in feature folders

### Component Guidelines

```jsx
/**
 * Component Description
 * @param {Object} props - Component props
 * @param {string} props.title - Prop description
 */
export default function MyComponent({ title }) {
  // Hooks first
  const [state, setState] = useState(null);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
}
```

---

## State Management

### Zustand Stores

GateGenius uses Zustand for state management. Each module has its own store:

#### Expiry Store

```javascript
// src/store/expiryStore.js
import { create } from 'zustand';

export const useExpiryStore = create((set, get) => ({
  // State
  products: [],
  loading: false,

  // Actions
  loadData: async () => {
    set({ loading: true });
    const data = await fetchProducts();
    set({ products: data, loading: false });
  },

  getCriticalItems: () => {
    return get().products.filter(p => p.Days_Until_Expiry === 0);
  },

  getWarningItems: () => {
    return get().products.filter(p =>
      p.Days_Until_Expiry > 0 && p.Days_Until_Expiry <= 7
    );
  }
}));
```

#### Usage in Components

```jsx
import { useExpiryStore } from '../../store/expiryStore';

function ExpiryDashboard() {
  const { products, loading, loadData } = useExpiryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return <div>{/* Render products */}</div>;
}
```

---

## Modules Deep Dive

### Module 1: Expiration Intelligence

**Purpose**: Track product expiration and prevent waste

**Key Features**:
- Real-time expiration tracking
- Critical/warning alerts
- AI-powered scanning
- Value-at-risk calculations

**Data Flow**:
```
CSV Files → ExpirationDataService → useExpiryStore → ExpiryDashboard
```

**Key Functions**:
```javascript
// Get products expiring today
getCriticalItems()

// Get products expiring within 7 days
getWarningItems()

// Calculate financial waste risk
getWasteStats()

// Add scanned product
addScannedProduct(productData)
```

### Module 2: Consumption Prediction

**Purpose**: Optimize product quantities per flight

**Key Features**:
- Historical consumption analysis
- AI-driven predictions
- Waste reduction insights
- Stockout prevention

**Data Flow**:
```
CSV Files → ConsumptionDataService → useConsumptionStore → ConsumptionDashboard
```

**Key Functions**:
```javascript
// Predict optimal quantity for flight
predictConsumption(productId, flightType, standardQty)

// Find high-waste products
getHighWasteProducts()

// Identify stockout risks
getStockoutRiskProducts()
```

### Module 3: Workforce Planning

**Purpose**: Calculate optimal staffing needs

**Key Features**:
- Worker-hour calculations
- Peak time analysis
- Complexity breakdown
- Utilization metrics

**Data Flow**:
```
CSV Files → ProductivityDataService → useProductivityStore → ProductivityDashboard
```

**Key Functions**:
```javascript
// Calculate workers needed for shift
calculateWorkersNeeded(shiftHours)

// Identify peak workload times
getPeakTimes()

// Get task complexity distribution
getComplexityStats()
```

### Smart Assignment (Integration)

**Purpose**: AI-powered product-to-flight matching

**Algorithm**:
```javascript
// Priority Score Calculation
score = (
  expirationUrgency * 0.4 +     // Days until expiry
  consumptionProbability * 0.3 + // Historical usage rate
  productValue * 0.2 +           // Financial value
  flightCompatibility * 0.1      // Route/type match
)
```

**Matching Process**:
1. Get near-expiry products (≤7 days)
2. Get upcoming flights
3. Calculate compatibility scores
4. Rank and recommend top matches
5. Calculate impact (waste prevented, savings)

---

## UI Components

### Layout Components

#### Header
- Logo and branding
- Status indicators (facility, date, live status)
- Dark mode toggle

#### Navigation
- Module tabs (Expiry, Consumption, Productivity, Smart Assignment)
- Active state highlighting
- Responsive overflow handling

#### MainLayout
- Centered content (max-w-7xl)
- Consistent padding
- Footer with version info

### Shared Components

#### ProductTable
- Sortable columns
- Search/filter
- Pagination
- Row actions (delete)
- Responsive design

#### FlightSelector
- Grid of flight cards
- Selected state highlighting
- Flight details (type, passengers, route)
- Responsive grid

#### CameraScanner
- File upload interface
- AI scanning visualization
- Match confidence display
- Barcode detection

#### Charts
- ConsumptionChart: Bar chart for waste products
- PeakTimeChart: Line chart for workload peaks
- Recharts-based visualizations

---

## Dark Mode Implementation

### Architecture

```
useDarkMode Hook
    ↓
localStorage (persistence)
    ↓
document.documentElement.classList ('dark' class)
    ↓
Tailwind CSS dark: variants
    ↓
All Components
```

### Hook Implementation

```javascript
// src/hooks/useDarkMode.js
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';

    // 2. Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply/remove 'dark' class
    document.documentElement.classList.toggle('dark', isDarkMode);

    // Persist preference
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return { isDarkMode, toggleDarkMode };
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',  // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748',  // Custom dark gray
          850: '#1a202c',  // Custom darker gray
        },
      },
    },
  },
}
```

### Component Usage

```jsx
// Example: Dark mode styling
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <h1 className="text-red-600 dark:text-red-400">Alert</h1>
  <button className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700">
    Click Me
  </button>
</div>
```

### Color Patterns

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `bg-gray-50` | `dark:bg-gray-900` |
| Cards | `bg-white` | `dark:bg-gray-800` |
| Text Primary | `text-gray-900` | `dark:text-gray-100` |
| Text Secondary | `text-gray-600` | `dark:text-gray-400` |
| Borders | `border-gray-200` | `dark:border-gray-700` |
| Alerts (Red) | `bg-red-50` | `dark:bg-red-900/20` |
| Alerts (Yellow) | `bg-yellow-50` | `dark:bg-yellow-900/20` |

---

## Data Flow

### CSV Data Processing

```
1. CSV File
   ↓
2. PapaParse (parsing)
   ↓
3. DataService (validation, calculations)
   ↓
4. Zustand Store (state management)
   ↓
5. React Components (UI rendering)
```

### Example: Product Data Flow

```javascript
// 1. CSV Parsing
import Papa from 'papaparse';

const parseCSV = (file) => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data)
    });
  });
};

// 2. Data Processing
const processProducts = (rawData) => {
  return rawData.map(item => ({
    ...item,
    Days_Until_Expiry: calculateDaysUntilExpiry(item.Expiry_Date),
    Status: getExpiryStatus(item.Expiry_Date),
    Value_At_Risk: item.Quantity * item.Unit_Price
  }));
};

// 3. Store Update
set({ products: processedData });

// 4. Component Rendering
const { products } = useExpiryStore();
```

---

## API Integration

### Gemini Vision API

**Purpose**: AI-powered product scanning and barcode recognition

**Implementation**:

```javascript
// src/api/cloudVisionApi.js
export async function scanProductImage(imageData) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Extract barcode and product details" },
          { inline_data: { mime_type: "image/jpeg", data: imageData } }
        ]
      }]
    })
  });

  return response.json();
}
```

**Usage**:

```javascript
// In CameraScanner component
const handleScan = async (imageFile) => {
  const result = await scanProductImage(imageFile);
  const productData = parseGeminiResponse(result);
  addScannedProduct(productData);
};
```

---

## Build & Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Output: dist/ directory
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── Logo.png
```

### Build Optimization

- **Code Splitting**: Automatic chunking by Vite
- **Tree Shaking**: Removes unused code
- **Minification**: CSS and JS compressed
- **Asset Optimization**: Images optimized

### Deployment Options

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## Testing

### Unit Testing (Recommended)

```bash
npm install --save-dev vitest @testing-library/react
```

```javascript
// Example test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExpiryDashboard from './ExpiryDashboard';

describe('ExpiryDashboard', () => {
  it('renders stat cards', () => {
    render(<ExpiryDashboard />);
    expect(screen.getByText('Total Products')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] All dashboards load correctly
- [ ] Dark mode toggle works
- [ ] Data tables are sortable
- [ ] CSV import functions properly
- [ ] Charts render correctly
- [ ] Responsive on mobile/tablet
- [ ] Export features work (PDF, Excel)
- [ ] Smart Assignment algorithm produces valid results

---

## Performance Optimization

### Current Optimizations

1. **Lazy Loading**: Components loaded on-demand
2. **Memoization**: `useMemo` for expensive calculations
3. **Virtual Scrolling**: Large tables paginated
4. **Code Splitting**: Separate chunks per route

### Performance Tips

```javascript
// Memoize expensive calculations
const sortedProducts = useMemo(() => {
  return products.sort((a, b) => a.Days_Until_Expiry - b.Days_Until_Expiry);
}, [products]);

// Debounce search input
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// Lazy load charts
const ConsumptionChart = lazy(() => import('./ConsumptionChart'));
```

### Bundle Analysis

```bash
npm run build -- --mode analyze
```

---

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Vite will auto-select another port
# Or specify port manually:
npm run dev -- --port 3000
```

#### Dark Mode Not Working
- Check `tailwind.config.js` has `darkMode: 'class'`
- Verify `useDarkMode` hook is imported in Header
- Inspect `<html>` tag for `dark` class in browser DevTools

---

## Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Message Format

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

## Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Recharts Examples](https://recharts.org/)

---

## Support

For technical questions or issues:
- Check existing GitHub issues
- Review this technical documentation
- Contact team members

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained By**: HackMTY 2025 Team
