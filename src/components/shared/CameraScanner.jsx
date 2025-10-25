import { useState } from 'react';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';
import { geminiApi } from '../../api/geminiApi';

/**
 * Camera Scanner Component
 * Allows uploading images to scan expiry dates using Gemini Vision API
 */
export default function CameraScanner({ onScanComplete }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      // Call Gemini Vision API (currently using mock)
      const scanResult = await geminiApi.scanExpiryLabel(file);

      if (scanResult.success) {
        setResult(scanResult.data);
        if (onScanComplete) {
          onScanComplete(scanResult.data);
        }
      } else {
        setError(scanResult.error || 'Failed to scan image');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Scan Product Label</h3>
        <Camera className="w-6 h-6 text-gray-400" />
      </div>

      {!result && !scanning && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-2">Scan Product Label</p>
          <p className="text-sm text-gray-500 mb-4">
            Upload an image of the product label to auto-read expiry date
          </p>

          <label className="btn-primary inline-flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <p className="text-xs text-gray-400 mt-3">
            AI Vision powered by Gemini
          </p>
        </div>
      )}

      {scanning && (
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-blue-700 font-medium">Scanning image...</p>
          <p className="text-sm text-blue-600 mt-1">AI is reading the label</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-bold text-green-900">Scan Successful!</h4>
            </div>
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Product ID</p>
              <p className="text-lg font-bold text-gray-900">{result.Product_ID}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">LOT Number</p>
              <p className="text-lg font-bold text-gray-900">{result.LOT_Number}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Product Name</p>
              <p className="text-lg font-bold text-gray-900">{result.Product_Name}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Expiry Date</p>
              <p className="text-lg font-bold text-red-600">{result.Expiry_Date}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Confidence</p>
              <p className="text-xs text-gray-600">AI detection accuracy</p>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(result.Confidence * 100)}%
            </div>
          </div>

          <button
            onClick={handleReset}
            className="btn-primary w-full mt-4"
          >
            Scan Another Product
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-bold text-red-900">Scan Failed</h4>
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
