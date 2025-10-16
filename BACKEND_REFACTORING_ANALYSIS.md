# Backend Refactoring Analysis - Modular Report Generation

## Current Architecture Issues

### Problem 1: Monolithic Functions
- `buildReportPrompt()` has a massive switch statement with all 4 report types
- `generateMockReport()` has another massive switch with duplicated logic
- Hard to maintain, test, and extend
- Not suitable for backend migration

### Problem 2: Tight Coupling
- Report generation logic is tightly coupled to Gemini API
- No separation between:
  - Data validation/formatting
  - Prompt engineering
  - Mock data generation
  - API communication

### Problem 3: No Reusability
- Can't reuse prompt builders across frontend/backend
- Can't test individual report types in isolation
- Can't easily add new report types

---

## Proposed Modular Architecture

### Folder Structure

```
src/
├── services/
│   └── reports/
│       ├── index.js                    # Main orchestrator
│       ├── reportService.js            # Service layer (API calls)
│       ├── modules/
│       │   ├── expiration/
│       │   │   ├── index.js
│       │   │   ├── promptBuilder.js    # Gemini prompts
│       │   │   ├── mockGenerator.js    # Mock reports
│       │   │   ├── dataFormatter.js    # Data validation/formatting
│       │   │   └── config.js           # Report configuration
│       │   ├── consumption/
│       │   │   ├── index.js
│       │   │   ├── promptBuilder.js
│       │   │   ├── mockGenerator.js
│       │   │   ├── dataFormatter.js
│       │   │   └── config.js
│       │   ├── productivity/
│       │   │   ├── index.js
│       │   │   ├── promptBuilder.js
│       │   │   ├── mockGenerator.js
│       │   │   ├── dataFormatter.js
│       │   │   └── config.js
│       │   └── smartAssignment/
│       │       ├── index.js
│       │       ├── promptBuilder.js
│       │       ├── mockGenerator.js
│       │       ├── dataFormatter.js
│       │       └── config.js
│       ├── shared/
│       │   ├── promptTemplates.js      # Shared prompt utilities
│       │   ├── validators.js           # Data validators
│       │   └── formatters.js           # Common formatters
│       └── types/
│           └── reportTypes.js          # TypeScript-ready type definitions
```

---

## Implementation Design

### 1. Module Structure (Example: Expiration)

#### `modules/expiration/config.js`
```javascript
export const expirationConfig = {
  reportType: 'expiration',
  displayName: 'Expiration Intelligence',
  sections: [
    'executive_summary',
    'key_findings',
    'risk_analysis',
    'recommendations',
    'conclusion'
  ],
  requiredFields: [
    'stats.total_products',
    'stats.critical_count',
    'stats.critical_units',
    'criticalItems',
    'warningItems'
  ],
  gemini: {
    temperature: 0.4,
    maxTokens: 2048,
    model: 'gemini-2.5-flash'
  }
};
```

#### `modules/expiration/dataFormatter.js`
```javascript
export class ExpirationDataFormatter {
  /**
   * Validate required data fields
   */
  static validate(data) {
    const errors = [];

    if (!data.stats) {
      errors.push('Missing stats object');
    }
    if (!Array.isArray(data.criticalItems)) {
      errors.push('criticalItems must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format data for prompt
   */
  static formatForPrompt(data) {
    return {
      totalProducts: data.stats.total_products,
      criticalCount: data.stats.critical_count,
      criticalUnits: data.stats.critical_units,
      warningCount: data.stats.warning_count,
      warningUnits: data.stats.warning_units,
      valueAtRisk: data.stats.estimated_critical_value.toFixed(2),
      topCriticalItems: data.criticalItems.slice(0, 5).map(item => ({
        name: item.Product_Name,
        quantity: item.Quantity,
        lot: item.LOT_Number,
        expiryDate: item.Expiry_Date
      }))
    };
  }

  /**
   * Format data for mock report
   */
  static formatForMock(data) {
    return {
      ...this.formatForPrompt(data),
      timestamp: new Date().toLocaleString(),
      criticalItems: data.criticalItems.slice(0, 3),
      warningItems: data.warningItems.slice(0, 5)
    };
  }
}
```

#### `modules/expiration/promptBuilder.js`
```javascript
import { expirationConfig } from './config.js';
import { buildBasePrompt } from '../../shared/promptTemplates.js';

export class ExpirationPromptBuilder {
  /**
   * Build Gemini API prompt
   */
  static build(formattedData, flightId = null) {
    const basePrompt = buildBasePrompt(
      expirationConfig.displayName,
      flightId
    );

    const dataSection = this.buildDataSection(formattedData);
    const instructionsSection = this.buildInstructions();

    return `${basePrompt}\n\n${dataSection}\n\n${instructionsSection}`;
  }

  static buildDataSection(data) {
    return `EXPIRATION INTELLIGENCE REPORT

Data Summary:
- Total Products: ${data.totalProducts}
- Critical Items (Expiring Today): ${data.criticalCount} products, ${data.criticalUnits} units
- Warning Items (This Week): ${data.warningCount} products, ${data.warningUnits} units
- Value at Risk: $${data.valueAtRisk}

Critical Items Sample:
${data.topCriticalItems.map(item =>
  `- ${item.name}: ${item.quantity} units, LOT ${item.lot}, expires ${item.expiryDate}`
).join('\n')}`;
  }

  static buildInstructions() {
    return `Generate a professional report with these sections:

# EXECUTIVE SUMMARY
[2-3 sentences summarizing the urgency and financial impact]

# KEY FINDINGS
- [3-5 bullet points highlighting critical issues and patterns]

# RISK ANALYSIS
- Immediate Risks (Today)
- Short-term Risks (This Week)
- Financial Impact

# RECOMMENDATIONS
1. [Prioritized action items with specific LOT numbers and quantities]
2. [Process improvements to prevent future waste]

# CONCLUSION
[1-2 sentences on next steps]

Keep it professional, data-driven, and action-oriented. Use clear formatting.`;
  }
}
```

#### `modules/expiration/mockGenerator.js`
```javascript
export class ExpirationMockGenerator {
  /**
   * Generate mock report content
   */
  static generate(formattedData) {
    const {
      criticalUnits,
      criticalCount,
      valueAtRisk,
      warningUnits,
      warningCount,
      criticalItems,
      timestamp
    } = formattedData;

    return `# EXPIRATION INTELLIGENCE REPORT
Generated: ${timestamp}

## EXECUTIVE SUMMARY

Critical situation requiring immediate action. ${criticalUnits} units across ${criticalCount} products expire TODAY, representing $${valueAtRisk} in potential waste. An additional ${warningUnits} units will expire within the week.

## KEY FINDINGS

• **Immediate Risk**: ${criticalCount} products expire today with total value at risk of $${valueAtRisk}
• **Short-term Risk**: ${warningCount} additional products expire within 7 days
• **Pattern**: High concentration of near-expiry items suggests inventory rotation issues
• **Financial Impact**: Current trajectory could result in significant monthly waste

## RISK ANALYSIS

**Immediate Risks (Expiring Today)**
${criticalItems.map(item =>
  `- ${item.Product_Name} (LOT ${item.LOT_Number}): ${item.Quantity} units expiring ${item.Expiry_Date}`
).join('\n')}

**Short-term Risks (This Week)**
- ${warningUnits} units at risk across ${warningCount} products
- Estimated value: $${(parseFloat(valueAtRisk) * 1.5).toFixed(2)}

## RECOMMENDATIONS

1. **Immediate Action**: Assign critical expiry items to next 3-5 flights using Smart Assignment module
2. **Rotation Protocol**: Implement FEFO (First Expired, First Out) loading procedure
3. **Inventory Review**: Audit ordering quantities to prevent over-stocking
4. **Monitoring**: Daily expiry scans using camera scanning feature

## CONCLUSION

Immediate intervention can prevent $${valueAtRisk} in waste today. Implement Smart Assignment recommendations and review procurement processes to prevent recurrence.`;
  }
}
```

#### `modules/expiration/index.js`
```javascript
import { expirationConfig } from './config.js';
import { ExpirationDataFormatter } from './dataFormatter.js';
import { ExpirationPromptBuilder } from './promptBuilder.js';
import { ExpirationMockGenerator } from './mockGenerator.js';

export const expirationModule = {
  config: expirationConfig,

  // Validate incoming data
  validate(data) {
    return ExpirationDataFormatter.validate(data);
  },

  // Build Gemini prompt
  buildPrompt(data, flightId) {
    const formattedData = ExpirationDataFormatter.formatForPrompt(data);
    return ExpirationPromptBuilder.build(formattedData, flightId);
  },

  // Generate mock report
  generateMock(data, flightId) {
    const formattedData = ExpirationDataFormatter.formatForMock(data);
    return ExpirationMockGenerator.generate(formattedData);
  }
};
```

---

### 2. Shared Utilities

#### `shared/promptTemplates.js`
```javascript
/**
 * Build base prompt used by all reports
 */
export const buildBasePrompt = (reportName, flightId = null) => {
  const timestamp = new Date().toLocaleString();
  const flightContext = flightId ? `for Flight ${flightId}` : '';

  return `You are an AI analyst for GateGenius, an airline catering intelligence platform. Generate a professional executive report ${flightContext}.

Current Date/Time: ${timestamp}

Report Type: ${reportName}`;
};

/**
 * Common report sections
 */
export const SECTION_TEMPLATES = {
  executiveSummary: (instructions) => `# EXECUTIVE SUMMARY
${instructions}`,

  keyFindings: (instructions) => `# KEY FINDINGS
${instructions}`,

  recommendations: (instructions) => `# RECOMMENDATIONS
${instructions}`,

  conclusion: (instructions) => `# CONCLUSION
${instructions}`
};
```

#### `shared/validators.js`
```javascript
/**
 * Common validation functions
 */
export const validators = {
  isPositiveNumber: (value, fieldName) => {
    if (typeof value !== 'number' || value < 0) {
      return { valid: false, error: `${fieldName} must be a positive number` };
    }
    return { valid: true };
  },

  isArray: (value, fieldName) => {
    if (!Array.isArray(value)) {
      return { valid: false, error: `${fieldName} must be an array` };
    }
    return { valid: true };
  },

  hasRequiredFields: (obj, fields) => {
    const missing = fields.filter(field => {
      const keys = field.split('.');
      let current = obj;
      for (const key of keys) {
        if (!current || !(key in current)) return true;
        current = current[key];
      }
      return false;
    });

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missing.join(', ')}`
      };
    }
    return { valid: true };
  }
};
```

---

### 3. Main Report Service

#### `services/reports/reportService.js`
```javascript
import { geminiApi } from '../../api/geminiApi.js';
import { expirationModule } from './modules/expiration/index.js';
import { consumptionModule } from './modules/consumption/index.js';
import { productivityModule } from './modules/productivity/index.js';
import { smartAssignmentModule } from './modules/smartAssignment/index.js';

/**
 * Module registry
 */
const modules = {
  expiration: expirationModule,
  consumption: consumptionModule,
  productivity: productivityModule,
  smart_assignment: smartAssignmentModule
};

export class ReportService {
  /**
   * Generate report using Gemini API
   */
  static async generate(reportType, data, flightId = null) {
    const module = modules[reportType];

    if (!module) {
      throw new Error(`Unknown report type: ${reportType}`);
    }

    // Step 1: Validate data
    const validation = module.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
    }

    // Step 2: Try Gemini API
    try {
      if (geminiApi.apiKey) {
        const prompt = module.buildPrompt(data, flightId);
        const response = await geminiApi.generateReport(
          reportType,
          data,
          flightId
        );

        if (response.success) {
          return {
            success: true,
            content: response.content,
            source: 'gemini',
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn('Gemini API failed, falling back to mock:', error);
    }

    // Step 3: Fallback to mock
    const mockContent = module.generateMock(data, flightId);
    return {
      success: true,
      content: mockContent,
      source: 'mock',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get module configuration
   */
  static getModuleConfig(reportType) {
    return modules[reportType]?.config;
  }

  /**
   * List available report types
   */
  static getAvailableTypes() {
    return Object.keys(modules);
  }
}
```

#### `services/reports/index.js`
```javascript
/**
 * Main entry point for report generation
 */
export { ReportService } from './reportService.js';
export { expirationModule } from './modules/expiration/index.js';
export { consumptionModule } from './modules/consumption/index.js';
export { productivityModule } from './modules/productivity/index.js';
export { smartAssignmentModule } from './modules/smartAssignment/index.js';
```

---

## Migration Path

### Phase 1: Frontend Refactoring (Now)
```javascript
// Old way (in geminiApi.js)
const report = await geminiApi.generateReport('expiration', data);

// New way (using modular service)
import { ReportService } from './services/reports';
const report = await ReportService.generate('expiration', data);
```

### Phase 2: Backend Implementation (Future)

#### Backend Structure
```
backend/
├── src/
│   ├── services/
│   │   └── reports/          # Copy entire reports folder from frontend
│   │       ├── modules/      # Same module structure
│   │       └── reportService.js
│   ├── api/
│   │   └── geminiClient.js   # Backend Gemini API client
│   └── controllers/
│       └── reportController.js
```

#### Backend API Endpoint
```javascript
// backend/src/controllers/reportController.js
import { ReportService } from '../services/reports';

export async function generateReport(req, res) {
  const { reportType, data, flightId } = req.body;

  try {
    const report = await ReportService.generate(reportType, data, flightId);
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

#### Frontend API Call
```javascript
// frontend/src/api/reportApi.js
export async function generateReport(reportType, data, flightId) {
  const response = await fetch('/api/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportType, data, flightId })
  });

  return response.json();
}
```

---

## Benefits of This Architecture

### 1. Modularity
- Each report type is self-contained
- Easy to add/remove/modify individual reports
- No impact on other modules when making changes

### 2. Testability
```javascript
// Test individual components
import { ExpirationDataFormatter } from './modules/expiration/dataFormatter';

test('validates expiration data correctly', () => {
  const result = ExpirationDataFormatter.validate(mockData);
  expect(result.isValid).toBe(true);
});
```

### 3. Reusability
- Same code works in frontend and backend
- Prompt builders can be used independently
- Validators shared across modules

### 4. Maintainability
- Clear separation of concerns
- Easy to find and fix bugs
- Self-documenting structure

### 5. Scalability
- Add new report types without touching existing code
- Easy to swap Gemini for other AI providers
- Simple to add caching, rate limiting, etc.

---

## Implementation Steps

### Step 1: Create Module Structure
```bash
mkdir -p src/services/reports/{modules/{expiration,consumption,productivity,smartAssignment},shared,types}
```

### Step 2: Extract Expiration Module (First)
- Move expiration prompt logic to `promptBuilder.js`
- Move mock generation to `mockGenerator.js`
- Create data formatter
- Create module index

### Step 3: Repeat for Other Modules
- Consumption
- Productivity
- Smart Assignment

### Step 4: Create Report Service
- Implement `ReportService` class
- Register all modules
- Handle validation and fallbacks

### Step 5: Update Existing Code
- Update `geminiApi.js` to use `ReportService`
- Keep backward compatibility during migration

### Step 6: Testing
- Unit test each module
- Integration test report service
- E2E test PDF generation

---

## Example Usage After Refactoring

```javascript
// Generate report
import { ReportService } from '@/services/reports';

const report = await ReportService.generate('expiration', {
  stats: { /* ... */ },
  criticalItems: [ /* ... */ ],
  warningItems: [ /* ... */ ]
});

// Get module config
const config = ReportService.getModuleConfig('expiration');
console.log(config.sections); // ['executive_summary', 'key_findings', ...]

// List available types
const types = ReportService.getAvailableTypes();
// ['expiration', 'consumption', 'productivity', 'smart_assignment']
```

---

## Conclusion

This modular architecture:
✅ Separates concerns clearly
✅ Makes code reusable between frontend/backend
✅ Simplifies testing and maintenance
✅ Enables easy backend migration
✅ Follows SOLID principles
✅ Scales well with new features

**Recommendation:** Implement this refactoring before adding backend to avoid duplicating monolithic code on both ends.
