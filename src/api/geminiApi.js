/**
 * Gemini API Wrapper
 *
 * This module handles all Gemini AI API calls:
 * - Vision API for scanning expiry dates from labels
 * - Text API for consumption predictions
 *
 * TODO: Replace mock responses with real Gemini API calls
 * - Add API key from .env
 * - Implement vision scanning
 * - Implement consumption prediction
 */

class GeminiAPI {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    this.visionEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    this.textEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  /**
   * Scan expiry date from product label image
   * @param {File|Blob} imageFile - Image file containing product label
   * @param {Array} productsDatabase - Array of products for context/validation
   * @returns {Promise<Object>} Extracted expiry information
   */
  async scanExpiryLabel(imageFile, productsDatabase = []) {
    if (!this.apiKey) {
      console.warn('⚠️ No Gemini API key configured, using mock response');
      await this.delay(1500);
      return {
        success: true,
        data: {
          Product_ID: 'MLK003',
          LOT_Number: 'LOT-A96',
          Expiry_Date: '2025-10-24',
          Product_Name: 'Powdered Milk',
          Confidence: 0.95
        }
      };
    }

    return this.scanExpiryLabelReal(imageFile, productsDatabase);
  }

  /**
   * Real implementation with Gemini Vision API
   */
  async scanExpiryLabelReal(imageFile, productsDatabase = []) {
    try {
      console.log('📸 Scanning with Gemini Vision API...');

      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Prepare database context (sample of 20 products for reference)
      const productSamples = productsDatabase.slice(0, 20).map(p => ({
        id: p.Product_ID,
        name: p.Product_Name,
        lot: p.LOT_Number
      }));

      const databaseContext = productSamples.length > 0
        ? `\n\nKnown products in our database (for reference):\n${JSON.stringify(productSamples, null, 2)}`
        : '';

      // Prepare Gemini Vision API request
      const payload = {
        contents: [{
          parts: [
            {
              text: `You are analyzing a product label image for an airline catering inventory system. Extract the following information and return ONLY a valid JSON object with no additional text:

{
  "Product_ID": "the product ID or code (e.g., MLK003, COF006, DRK024)",
  "LOT_Number": "the LOT number (e.g., LOT-A96, LOT-E19, LOT-B23)",
  "Expiry_Date": "the expiry date in YYYY-MM-DD format",
  "Product_Name": "the product name (e.g., Still Water 0.5L, Chocolate Bar, Coffee)"
}

IMPORTANT:
- Look for any text that could be a product code, LOT number, or expiry date
- Expiry dates may be labeled as "EXP", "Best Before", "Use By", "BB", or similar
- If you see multiple dates, choose the expiration/best-before date
- Product names should match common airline catering items${databaseContext}

If you cannot find a field with certainty, use "Unknown" as the value. Return ONLY the JSON object, nothing else.`
            },
            {
              inline_data: {
                mime_type: imageFile.type || 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }]
      };

      const response = await fetch(`${this.visionEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const result = await response.json();

      // Parse response
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from response (might have markdown formatting)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const extracted = JSON.parse(jsonText);

      console.log('✅ Gemini scan successful:', extracted);

      return {
        success: true,
        data: {
          Product_ID: extracted.Product_ID || 'Unknown',
          LOT_Number: extracted.LOT_Number || 'Unknown',
          Expiry_Date: extracted.Expiry_Date || 'Unknown',
          Product_Name: extracted.Product_Name || 'Unknown',
          Confidence: 0.85
        }
      };
    } catch (error) {
      console.error('❌ Gemini Vision API error:', error);
      return {
        success: false,
        error: `Scan failed: ${error.message}`
      };
    }
  }

  /**
   * Predict consumption pattern using AI
   * @param {Object} flightData - Flight details
   * @param {Array} historicalData - Historical consumption data
   * @returns {Promise<Object>} AI-powered consumption prediction
   */
  async predictConsumption(flightData, historicalData) {
    // MOCK IMPLEMENTATION - To be replaced with real API call
    console.log('🤖 [MOCK] Predicting consumption...', flightData);

    await this.delay(1000);

    // Mock prediction
    return {
      success: true,
      predictions: [
        {
          Product_ID: 'DRK024',
          Product_Name: 'Still Water',
          Standard_Qty: 223,
          Predicted_Qty: 245,
          Confidence: 0.88,
          Reason: 'Long-haul flights show 85% consumption rate. Historical data indicates "ran out early" 3 times.'
        },
        {
          Product_ID: 'CHO050',
          Product_Name: 'Chocolate Bar',
          Standard_Qty: 163,
          Predicted_Qty: 148,
          Confidence: 0.82,
          Reason: 'Average consumption rate: 67%. Consider using LOT-B26 expiring in 2 days.'
        }
      ]
    };
  }

  /**
   * Real implementation template
   */
  async predictConsumptionReal(flightData, historicalData) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = `You are an AI assistant for airline catering optimization.

Flight Details:
- Flight ID: ${flightData.Flight_ID}
- Origin: ${flightData.Origin}
- Flight Type: ${flightData.Flight_Type}
- Passenger Count: ${flightData.Passenger_Count}

Historical Data Summary:
${JSON.stringify(historicalData.slice(0, 10), null, 2)}

Based on this data, predict the consumption for each product and provide:
1. Recommended quantity to load
2. Confidence level
3. Reasoning

Return as JSON array of predictions.`;

      const payload = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      const response = await fetch(`${this.textEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;

      return {
        success: true,
        predictions: JSON.parse(text)
      };
    } catch (error) {
      console.error('❌ Gemini Text API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate AI-tailored report using Gemini
   * @param {String} reportType - Type of report (expiration, consumption, productivity, smart_assignment)
   * @param {Object} data - Report data
   * @param {String} flightId - Optional flight ID for context
   * @returns {Promise<Object>} AI-generated report content
   */
  async generateReport(reportType, data, flightId = null) {
    console.log(`🤖 Generating ${reportType} report with Gemini AI...`);

    if (!this.apiKey) {
      console.warn('⚠️ No Gemini API key configured, using mock report');
      await this.delay(2000);
      return this.generateMockReport(reportType, data, flightId);
    }

    try {
      const prompt = this.buildReportPrompt(reportType, data, flightId);

      const payload = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4, // Lower temperature for more factual, consistent reports
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(`${this.textEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      console.log('✅ Gemini report generated successfully');

      return {
        success: true,
        content: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Gemini Report API error:', error);
      console.log('📝 Falling back to mock report...');
      return this.generateMockReport(reportType, data, flightId);
    }
  }

  /**
   * Build report generation prompt based on report type
   */
  buildReportPrompt(reportType, data, flightId) {
    const timestamp = new Date().toLocaleString();
    const flightContext = flightId ? `for Flight ${flightId}` : '';

    const basePrompt = `You are an AI analyst for GateGenius, an airline catering intelligence platform. Generate a professional executive report ${flightContext}.

Current Date/Time: ${timestamp}

`;

    switch (reportType) {
      case 'expiration':
        return basePrompt + `EXPIRATION INTELLIGENCE REPORT

Data Summary:
- Total Products: ${data.stats.total_products}
- Critical Items (Expiring Today): ${data.stats.critical_count} products, ${data.stats.critical_units} units
- Warning Items (This Week): ${data.stats.warning_count} products, ${data.stats.warning_units} units
- Value at Risk: $${data.stats.estimated_critical_value.toFixed(2)}

Critical Items Sample:
${data.criticalItems.slice(0, 5).map(item => `- ${item.Product_Name}: ${item.Quantity} units, LOT ${item.LOT_Number}, expires ${item.Expiry_Date}`).join('\n')}

Generate a professional report with these sections:

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

      case 'consumption':
        return basePrompt + `CONSUMPTION PREDICTION REPORT ${flightContext}

Data Summary:
- Total Waste Cost: $${data.stats.total_waste_cost.toFixed(2)}
- Returned Units: ${data.stats.total_returned_units}
- Average Consumption Rate: ${data.stats.overall_consumption_rate}%
- Flights Analyzed: ${data.stats.unique_flights}

High Waste Products:
${data.highWasteProducts.slice(0, 5).map(p => `- ${p.product_name}: ${p.avg_consumption_rate}% consumption, $${p.total_waste.toFixed(2)} waste`).join('\n')}

Stockout Risk Products:
${data.stockoutRiskProducts.slice(0, 5).map(p => `- ${p.product_name}: Ran out early ${p.count} times`).join('\n')}

Generate a professional report with these sections:

# EXECUTIVE SUMMARY
[2-3 sentences on waste patterns and optimization opportunities]

# KEY INSIGHTS
- [AI-powered analysis of consumption patterns]
- [Identification of trends and anomalies]

# WASTE REDUCTION OPPORTUNITIES
1. [Specific products to reduce with percentage recommendations]
2. [Products to increase to prevent stockouts]

# FINANCIAL IMPACT
- Current monthly waste cost
- Potential savings with optimizations

# RECOMMENDATIONS
[Actionable steps to optimize loading quantities]

Keep it data-driven with specific numbers and percentages.`;

      case 'productivity':
        return basePrompt + `WORKFORCE PRODUCTIVITY REPORT

Data Summary:
- Total Drawers to Assemble: ${data.drawers.length}
- Total Time Required: ${data.totalTime} hours
- Workers Needed (8-hour shift): ${data.workforceNeeds.workers_needed}
- Utilization Rate: ${data.workforceNeeds.utilization}%

Complexity Breakdown:
- Simple Drawers (<5 min): ${data.complexity.simple}
- Medium Drawers (5-8 min): ${data.complexity.medium}
- Complex Drawers (>8 min): ${data.complexity.complex}
- Average Time: ${data.complexity.avg_time} minutes

Peak Times:
${data.peakTimes.map(p => `- ${p.time}: ${p.drawers} drawers, ${p.workers_needed} workers needed`).join('\n')}

Generate a professional report with these sections:

# EXECUTIVE SUMMARY
[Overview of workforce requirements and efficiency]

# WORKLOAD ANALYSIS
- Total capacity requirements
- Peak period identification
- Efficiency assessment

# STAFFING RECOMMENDATIONS
1. [Optimal worker allocation by time period]
2. [Suggestions for handling peak loads]

# OPTIMIZATION OPPORTUNITIES
[Ways to improve utilization and reduce bottlenecks]

# CONCLUSION
[Summary of staffing plan and expected outcomes]

Focus on practical workforce planning and efficiency.`;

      case 'smart_assignment':
        return basePrompt + `SMART FLIGHT ASSIGNMENT REPORT for Flight ${flightId}

Assignment Summary:
- Total Savings: $${data.summary.total_savings}
- Near-Expiry Items Used: ${data.summary.near_expiry_items_used}
- Assembly Time Impact: ${data.summary.assembly_time_change >= 0 ? '+' : ''}${data.summary.assembly_time_change} minutes
- Status: ${data.summary.status}

Top Recommendations:
${data.recommendations.slice(0, 5).map(rec => `- ${rec.product_name}: ${rec.standard_qty} → ${rec.recommended_qty} units (${rec.quantity_change > 0 ? '+' : ''}${rec.quantity_change}), saves $${rec.financial_impact.total.toFixed(2)}`).join('\n')}

Generate a professional report with these sections:

# EXECUTIVE SUMMARY
[Impact of AI-optimized flight assignment]

# OPTIMIZATION STRATEGY
- Expiry date optimization
- Consumption-based adjustments
- Productivity considerations

# FINANCIAL IMPACT
- Total cost savings
- Waste prevention value
- ROI analysis

# KEY ASSIGNMENTS
[Top 5-7 product recommendations with reasoning]

# IMPLEMENTATION NOTES
[Specific instructions for warehouse team]

# CONCLUSION
[Expected outcomes and monitoring plan]

Emphasize the integrated AI approach and measurable business value.`;

      default:
        return basePrompt + `GENERAL REPORT\n\nData: ${JSON.stringify(data, null, 2)}\n\nGenerate a professional analysis report.`;
    }
  }

  /**
   * Generate mock report when API key is not available
   */
  generateMockReport(reportType, data, flightId) {
    const timestamp = new Date().toLocaleString();
    const flightContext = flightId ? ` for Flight ${flightId}` : '';

    let content = '';

    switch (reportType) {
      case 'expiration':
        content = `# EXPIRATION INTELLIGENCE REPORT
Generated: ${timestamp}

## EXECUTIVE SUMMARY

Critical situation requiring immediate action. ${data.stats.critical_units} units across ${data.stats.critical_count} products expire TODAY, representing $${data.stats.estimated_critical_value.toFixed(2)} in potential waste. An additional ${data.stats.warning_units} units will expire within the week.

## KEY FINDINGS

• **Immediate Risk**: ${data.stats.critical_count} products expire today with total value at risk of $${data.stats.estimated_critical_value.toFixed(2)}
• **Short-term Risk**: ${data.stats.warning_count} additional products expire within 7 days
• **Pattern**: High concentration of near-expiry items suggests inventory rotation issues
• **Financial Impact**: Current trajectory could result in significant monthly waste

## RISK ANALYSIS

**Immediate Risks (Expiring Today)**
${data.criticalItems.slice(0, 3).map(item => `- ${item.Product_Name} (LOT ${item.LOT_Number}): ${item.Quantity} units expiring ${item.Expiry_Date}`).join('\n')}

**Short-term Risks (This Week)**
- ${data.stats.warning_units} units at risk across ${data.stats.warning_count} products
- Estimated value: $${(data.stats.estimated_critical_value * 1.5).toFixed(2)}

## RECOMMENDATIONS

1. **Immediate Action**: Assign critical expiry items to next 3-5 flights using Smart Assignment module
2. **Rotation Protocol**: Implement FEFO (First Expired, First Out) loading procedure
3. **Inventory Review**: Audit ordering quantities to prevent over-stocking
4. **Monitoring**: Daily expiry scans using camera scanning feature

## CONCLUSION

Immediate intervention can prevent $${data.stats.estimated_critical_value.toFixed(2)} in waste today. Implement Smart Assignment recommendations and review procurement processes to prevent recurrence.`;
        break;

      case 'consumption':
        content = `# CONSUMPTION PREDICTION REPORT${flightContext}
Generated: ${timestamp}

## EXECUTIVE SUMMARY

Analysis of ${data.stats.unique_flights} flights reveals $${data.stats.total_waste_cost.toFixed(2)} in weekly waste with ${data.stats.total_returned_units} units returned unconsumed. Overall consumption rate of ${data.stats.overall_consumption_rate}% indicates significant optimization potential.

## KEY INSIGHTS

• **Waste Concentration**: ${data.highWasteProducts.length} products account for majority of waste
• **Consumption Pattern**: Average ${data.stats.overall_consumption_rate}% consumption suggests over-loading
• **Stockout Risk**: ${data.stockoutRiskProducts.length} products frequently run out, impacting passenger satisfaction
• **Monthly Impact**: Projected $${(data.stats.total_waste_cost * 4).toFixed(2)} in preventable monthly waste

## WASTE REDUCTION OPPORTUNITIES

${data.highWasteProducts.slice(0, 3).map((p, idx) => `${idx + 1}. **${p.product_name}**: Reduce loading by ${Math.round((100 - p.avg_consumption_rate) / 2)}% (currently ${p.avg_consumption_rate}% consumed). Potential monthly savings: $${(p.total_waste * 2).toFixed(2)}`).join('\n\n')}

**Stockout Prevention**
${data.stockoutRiskProducts.slice(0, 2).map(p => `- Increase ${p.product_name} by 10-15% (ran out ${p.count} times)`).join('\n')}

## FINANCIAL IMPACT

- **Current Weekly Waste**: $${data.stats.total_waste_cost.toFixed(2)}
- **Projected Monthly Waste**: $${(data.stats.total_waste_cost * 4).toFixed(2)}
- **Potential Annual Savings**: $${(data.stats.total_waste_cost * 52 * 0.6).toFixed(2)} (with 60% waste reduction)

## RECOMMENDATIONS

1. Implement AI-predicted loading quantities for top waste products
2. Increase loading for stockout-prone items by 10-15%
3. Monitor consumption patterns weekly and adjust
4. Use Smart Assignment to pair near-expiry products with high-consumption flights

Strategic implementation of these recommendations could reduce waste by 60% while improving passenger satisfaction.`;
        break;

      case 'productivity':
        content = `# WORKFORCE PRODUCTIVITY REPORT
Generated: ${timestamp}

## EXECUTIVE SUMMARY

Analysis of ${data.drawers.length} drawer assembly requirements indicates need for ${data.workforceNeeds.workers_needed} workers on an 8-hour shift, achieving ${data.workforceNeeds.utilization}% utilization. Total capacity requirement: ${data.totalTime} worker-hours.

## WORKLOAD ANALYSIS

**Total Requirements**
- Drawers to Assemble: ${data.drawers.length}
- Total Time Required: ${data.totalTime} hours
- Worker Capacity Needed: ${data.workforceNeeds.workers_needed} workers (8-hour shift)
- Efficiency Rate: ${data.workforceNeeds.utilization}%

**Complexity Distribution**
- Simple Drawers (<5 min): ${data.complexity.simple} (${((data.complexity.simple / data.drawers.length) * 100).toFixed(1)}%)
- Medium Drawers (5-8 min): ${data.complexity.medium} (${((data.complexity.medium / data.drawers.length) * 100).toFixed(1)}%)
- Complex Drawers (>8 min): ${data.complexity.complex} (${((data.complexity.complex / data.drawers.length) * 100).toFixed(1)}%)

**Peak Period Analysis**
${data.peakTimes.map(p => `- **${p.time}**: ${p.drawers} drawers requiring ${p.workers_needed} workers`).join('\n')}

## STAFFING RECOMMENDATIONS

1. **Core Team**: ${data.workforceNeeds.workers_needed} workers for full shift
2. **Peak Support**: Add ${Math.max(...data.peakTimes.map(p => p.workers_needed)) - data.workforceNeeds.workers_needed} workers during peak periods (${data.peakTimes.filter(p => p.workers_needed > 5).map(p => p.time).join(', ')})
3. **Skill Mix**: Balance experienced workers for complex drawers with junior staff for simple tasks

## OPTIMIZATION OPPORTUNITIES

- **Scheduling**: Front-load complex drawers to early shift when workers are fresh
- **Training**: Cross-train workers to handle medium complexity drawers more efficiently
- **Process**: Standardize assembly procedures to reduce complex drawer time by 10-15%
- **Utilization**: Current ${data.workforceNeeds.utilization}% utilization ${data.workforceNeeds.utilization >= 90 ? 'is optimal' : 'could be improved through better scheduling'}

## CONCLUSION

Optimal staffing at ${data.workforceNeeds.workers_needed} workers with peak support will complete ${data.drawers.length} drawers within shift. Focus on process optimization for complex drawers to improve overall efficiency.`;
        break;

      case 'smart_assignment':
        content = `# SMART FLIGHT ASSIGNMENT REPORT
Flight ${flightId} | Generated: ${timestamp}

## EXECUTIVE SUMMARY

AI-optimized flight assignment achieves $${data.summary.total_savings} in cost savings by intelligently integrating expiration management, consumption prediction, and productivity optimization. Successfully assigns ${data.summary.near_expiry_items_used} near-expiry items to high-consumption products.

## OPTIMIZATION STRATEGY

**Multi-Factor AI Optimization**
1. **Expiry Intelligence**: Prioritize ${data.summary.near_expiry_items_used} near-expiry products to prevent waste
2. **Consumption Prediction**: Adjust quantities based on historical consumption patterns
3. **Productivity Balance**: Maintain efficient assembly time (${data.summary.assembly_time_change >= 0 ? '+' : ''}${data.summary.assembly_time_change} min impact)

**Status**: ${data.summary.status.replace(/_/g, ' ')}

## FINANCIAL IMPACT

- **Total Cost Savings**: $${data.summary.total_savings}
- **Waste Prevention**: $${data.recommendations.reduce((sum, r) => sum + (r.financial_impact.waste_prevented || 0), 0).toFixed(2)} from expiry optimization
- **Consumption Optimization**: $${data.recommendations.reduce((sum, r) => sum + (r.financial_impact.consumption_savings || 0), 0).toFixed(2)} from quantity adjustments
- **Per-Flight ROI**: $${data.summary.total_savings} per optimized flight
- **Annual Potential** (200 flights): $${(parseFloat(data.summary.total_savings) * 200).toFixed(2)}

## KEY ASSIGNMENTS

${data.recommendations.slice(0, 5).map((rec, idx) => `**${idx + 1}. ${rec.product_name}**
Standard: ${rec.standard_qty} → Recommended: ${rec.recommended_qty} units (${rec.quantity_change > 0 ? '+' : ''}${rec.quantity_change})
Savings: $${rec.financial_impact.total.toFixed(2)}
${rec.use_near_expiry ? `⚠️ USE LOT ${rec.selected_lot} - expires in ${rec.days_until_expiry} days` : ''}
${rec.factors.map(f => `• [${f.type}] ${f.description}`).join('\n')}`).join('\n\n')}

## IMPLEMENTATION NOTES

**For Warehouse Team**:
1. Priority loading of near-expiry LOTs as specified above
2. Adjust quantities according to recommendations
3. Follow FEFO (First Expired, First Out) for all near-expiry items
4. Expected assembly time impact: ${data.summary.assembly_time_change >= 0 ? '+' : ''}${data.summary.assembly_time_change} minutes

**Quality Checks**:
- Verify LOT numbers match assignment sheet
- Confirm expiry dates before loading
- Double-check quantity adjustments

## CONCLUSION

This AI-optimized assignment demonstrates the power of integrated intelligence: preventing $${data.summary.total_savings} in waste while maintaining operational efficiency. Expected outcomes: reduced food waste, optimized inventory rotation, and improved cost efficiency.

**Recommendation**: Approve and implement immediately.`;
        break;

      default:
        content = `# REPORT\n\nGenerated: ${timestamp}\n\n${JSON.stringify(data, null, 2)}`;
    }

    return {
      success: true,
      content,
      timestamp,
      mock: true
    };
  }

  /**
   * Helper: Convert file to base64
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Helper: Simulate API delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const geminiApi = new GeminiAPI();

// Export for environment configuration
export const configureGeminiAPI = (apiKey) => {
  geminiApi.apiKey = apiKey;
};
