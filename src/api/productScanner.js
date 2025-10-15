/**
 * Unified Product Scanner
 *
 * Multi-strategy product identification system:
 * 1. Barcode Detection (Cloud Vision) → Direct or External API lookup
 * 2. OCR + Fuzzy Match (Gemini Vision) → Text extraction + database match
 *
 * Always extracts LOT + Expiry via OCR (never in barcodes)
 */

import { cloudVisionApi } from './cloudVisionApi';
import { geminiApi } from './geminiApi';
import { matchScannedProduct } from '../utils/productMatcher';

class ProductScanner {
  constructor() {
    this.externalProductAPI = 'https://world.openfoodfacts.org/api/v0/product';
  }

  /**
   * Main scanning entry point - tries multiple strategies
   * @param {File} imageFile - Image to scan
   * @param {Array} productsDatabase - Local product database
   * @returns {Promise<Object>} Unified scan result
   */
  async scan(imageFile, productsDatabase = []) {
    console.log('🚀 Starting multi-strategy product scan...');

    const result = {
      success: false,
      strategies: [],
      data: null,
      matchResult: null,
      barcodeInfo: null,
      externalData: null
    };

    // STRATEGY 1: Barcode Detection (parallel with OCR for speed)
    const [barcodeResult, ocrResult] = await Promise.all([
      this.tryBarcodeStrategy(imageFile, productsDatabase),
      this.tryOCRStrategy(imageFile, productsDatabase)
    ]);

    // Use barcode if high confidence found
    if (barcodeResult.success && barcodeResult.confidence >= 0.8) {
      console.log('✅ Using barcode strategy (high confidence)');
      result.success = true;
      result.data = this.mergeResults(barcodeResult.data, ocrResult.data);
      result.matchResult = barcodeResult.matchResult;
      result.barcodeInfo = barcodeResult.barcodeInfo;
      result.externalData = barcodeResult.externalData;
      result.strategies.push('BARCODE', 'OCR');
      result.primaryStrategy = 'BARCODE';
    }
    // Fall back to OCR
    else if (ocrResult.success) {
      console.log('✅ Using OCR strategy (barcode not found or low confidence)');
      result.success = true;
      result.data = ocrResult.data;
      result.matchResult = ocrResult.matchResult;
      result.barcodeInfo = barcodeResult.barcodeInfo; // Include if detected
      result.strategies.push('OCR');
      result.primaryStrategy = 'OCR';
    }
    // Both failed
    else {
      console.log('❌ All strategies failed');
      result.error = 'Unable to identify product from image';
      result.strategies.push('NONE');
    }

    return result;
  }

  /**
   * STRATEGY 1: Barcode Detection + Lookup
   */
  async tryBarcodeStrategy(imageFile, productsDatabase) {
    try {
      // Detect barcode
      const barcodeResult = await cloudVisionApi.detectBarcode(imageFile);

      if (!barcodeResult.success) {
        return { success: false, reason: barcodeResult.reason };
      }

      const barcode = barcodeResult.primaryBarcode;
      console.log(`🔍 Barcode detected: ${barcode.value} (${barcode.format})`);

      // Try to match in local database first
      const localMatch = this.findBarcodeInDatabase(barcode.value, productsDatabase);

      if (localMatch.found) {
        console.log('✅ Barcode matched in local database');
        return {
          success: true,
          confidence: 1.0,
          data: localMatch.product,
          matchResult: {
            status: 'FOUND',
            title: '✅ Barcode Match (100%)',
            description: `Found in database via barcode ${barcode.format}: ${barcode.value}`,
            matches: [localMatch.product],
            confidence: 100,
            color: 'green'
          },
          barcodeInfo: barcode
        };
      }

      // Try external product database (for demo/enrichment)
      console.log('🌐 Barcode not in local DB, checking external database...');
      const externalData = await this.queryExternalProductAPI(barcode.value);

      if (externalData) {
        console.log('✅ Product found in external database:', externalData.product_name);

        // Try to fuzzy match external data to our database
        const fuzzyMatch = this.fuzzyMatchExternalProduct(externalData, productsDatabase);

        return {
          success: true,
          confidence: fuzzyMatch.confidence,
          data: fuzzyMatch.product,
          matchResult: {
            status: fuzzyMatch.found ? 'FOUND' : 'EXTERNAL_ONLY',
            title: fuzzyMatch.found
              ? '🔍 External Barcode + Local Match'
              : '🌐 External Product Database',
            description: fuzzyMatch.found
              ? `Barcode lookup identified "${externalData.product_name}", matched to local product`
              : `Product identified via barcode: ${externalData.product_name} (not in local inventory)`,
            matches: fuzzyMatch.found ? [fuzzyMatch.product] : [],
            confidence: Math.round(fuzzyMatch.confidence * 100),
            color: fuzzyMatch.found ? 'green' : 'yellow',
            externalInfo: true
          },
          barcodeInfo: barcode,
          externalData
        };
      }

      console.log('⚠️ Barcode not found in any database');
      return {
        success: false,
        reason: 'BARCODE_NOT_RECOGNIZED',
        barcodeInfo: barcode
      };

    } catch (error) {
      console.error('❌ Barcode strategy error:', error);
      return { success: false, reason: 'BARCODE_STRATEGY_ERROR', error: error.message };
    }
  }

  /**
   * STRATEGY 2: OCR + Fuzzy Matching (existing approach)
   */
  async tryOCRStrategy(imageFile, productsDatabase) {
    try {
      console.log('📝 Running OCR strategy...');

      // Use existing Gemini Vision OCR
      const ocrResult = await geminiApi.scanExpiryLabel(imageFile, productsDatabase);

      if (!ocrResult.success) {
        return { success: false, reason: 'OCR_FAILED', error: ocrResult.error };
      }

      // Use existing product matcher
      const match = matchScannedProduct(ocrResult.data, productsDatabase);

      // Format result
      const matchResult = this.formatMatchResult(match);

      return {
        success: true,
        confidence: match.confidence,
        data: match.enrichedData || ocrResult.data,
        matchResult
      };

    } catch (error) {
      console.error('❌ OCR strategy error:', error);
      return { success: false, reason: 'OCR_STRATEGY_ERROR', error: error.message };
    }
  }

  /**
   * Find barcode in local database
   * (Note: Current CSV doesn't have barcode column, so this will rarely match)
   */
  findBarcodeInDatabase(barcodeValue, productsDatabase) {
    // Try matching against Product_ID (in case some are barcodes)
    const match = productsDatabase.find(p =>
      p.Product_ID === barcodeValue ||
      p.Barcode === barcodeValue ||
      p.GTIN === barcodeValue ||
      p.EAN === barcodeValue
    );

    if (match) {
      return { found: true, product: match };
    }

    return { found: false };
  }

  /**
   * Query external product database (Open Food Facts)
   */
  async queryExternalProductAPI(barcode) {
    try {
      const response = await fetch(`${this.externalProductAPI}/${barcode}.json`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        return null;
      }

      const product = data.product;

      return {
        product_name: product.product_name || 'Unknown',
        brands: product.brands || 'Unknown',
        categories: product.categories || '',
        quantity: product.quantity || '',
        image_url: product.image_front_url || product.image_url || null,
        barcode: barcode
      };

    } catch (error) {
      console.error('External API error:', error);
      return null;
    }
  }

  /**
   * Try to match external product data to local database
   */
  fuzzyMatchExternalProduct(externalData, productsDatabase) {
    const productName = externalData.product_name.toLowerCase();

    // Try to find similar product in local database
    let bestMatch = null;
    let bestScore = 0;

    for (const product of productsDatabase) {
      const localName = (product.Product_Name || '').toLowerCase();

      // Simple word matching
      const words = productName.split(/\s+/).filter(w => w.length > 3);
      let score = 0;

      words.forEach(word => {
        if (localName.includes(word)) {
          score += 0.3;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
      }
    }

    // If decent match found (>60% confidence)
    if (bestScore >= 0.6) {
      return {
        found: true,
        product: {
          ...bestMatch,
          _external_product_name: externalData.product_name,
          _external_match: true
        },
        confidence: bestScore
      };
    }

    // No good match - return external data formatted
    return {
      found: false,
      product: {
        Product_ID: 'EXTERNAL',
        Product_Name: externalData.product_name,
        LOT_Number: 'Unknown',
        Expiry_Date: 'Unknown',
        _external_only: true,
        _external_data: externalData
      },
      confidence: 0.5
    };
  }

  /**
   * Merge barcode + OCR results (OCR provides LOT/Expiry)
   */
  mergeResults(barcodeData, ocrData) {
    if (!ocrData) return barcodeData;

    return {
      ...barcodeData,
      // Override with OCR-extracted LOT and Expiry (more reliable)
      LOT_Number: ocrData.LOT_Number || barcodeData.LOT_Number || 'Unknown',
      Expiry_Date: ocrData.Expiry_Date || barcodeData.Expiry_Date || 'Unknown',
      _merged: true,
      _lot_source: ocrData.LOT_Number ? 'OCR' : 'Database',
      _expiry_source: ocrData.Expiry_Date ? 'OCR' : 'Database'
    };
  }

  /**
   * Format match result for UI
   */
  formatMatchResult(match) {
    const { matches, matchType, confidence } = match;

    if (matches.length === 0) {
      return {
        status: 'NOT_IN_DATABASE',
        title: '⚠️ Not in Database',
        description: 'Product not found in local inventory',
        confidence: 0,
        color: 'red'
      };
    }

    let title = '';
    switch (matchType) {
      case 'PRODUCT_ID':
        title = '✅ Exact Product ID';
        break;
      case 'LOT_NUMBER':
        title = '✅ Exact LOT Match';
        break;
      case 'NAME_AND_DATE':
        title = '✅ Name + Date Match';
        break;
      case 'FUZZY_NAME':
        title = `📊 ${matches.length} Similar Match${matches.length > 1 ? 'es' : ''}`;
        break;
      default:
        title = '✅ Match Found';
    }

    return {
      status: 'FOUND',
      title,
      description: `Confidence: ${Math.round(confidence * 100)}%`,
      matches,
      confidence: Math.round(confidence * 100),
      color: confidence > 0.8 ? 'green' : 'yellow'
    };
  }
}

// Export singleton instance
export const productScanner = new ProductScanner();
