/**
 * Cloud Vision API Wrapper
 *
 * Handles barcode detection using Google Cloud Vision API
 * Works with the same API key as Gemini
 */

class CloudVisionAPI {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    this.endpoint = 'https://vision.googleapis.com/v1/images:annotate';
  }

  /**
   * Detect barcodes in an image
   * @param {File|Blob} imageFile - Image file to scan
   * @returns {Promise<Object>} Barcode detection result
   */
  async detectBarcode(imageFile) {
    if (!this.apiKey) {
      console.warn('⚠️ No API key configured, skipping barcode detection');
      return { success: false, reason: 'NO_API_KEY' };
    }

    try {
      console.log('🔍 Detecting barcode with Cloud Vision API...');

      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Prepare Cloud Vision API request
      const payload = {
        requests: [{
          image: { content: base64Image },
          features: [
            { type: 'BARCODE_DETECTION', maxResults: 5 },
            { type: 'TEXT_DETECTION', maxResults: 1 } // Backup for text-only labels
          ]
        }]
      };

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Cloud Vision API failed');
      }

      const result = await response.json();
      const annotations = result.responses?.[0];
      const barcodeAnnotations = annotations?.barcodeAnnotations || [];

      if (barcodeAnnotations.length === 0) {
        console.log('📝 No barcode found in image');
        return { success: false, reason: 'NO_BARCODE_FOUND' };
      }

      // Return all detected barcodes (sorted by confidence if available)
      const barcodes = barcodeAnnotations.map(barcode => ({
        value: barcode.rawValue,
        format: barcode.format, // EAN_13, UPC_A, CODE_128, QR_CODE, etc.
        boundingBox: barcode.boundingPoly
      }));

      console.log(`✅ Found ${barcodes.length} barcode(s):`, barcodes);

      return {
        success: true,
        barcodes,
        primaryBarcode: barcodes[0] // Most prominent barcode
      };

    } catch (error) {
      console.error('❌ Cloud Vision barcode detection error:', error);
      return {
        success: false,
        reason: 'BARCODE_ERROR',
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
}

// Export singleton instance
export const cloudVisionApi = new CloudVisionAPI();
