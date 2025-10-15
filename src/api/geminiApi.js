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
