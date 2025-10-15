import { useState } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, Database, Barcode, Globe } from 'lucide-react';
import { productScanner } from '../../api/productScanner';
import { formatDaysUntilExpiry, getExpiryColor } from '../../utils/dateHelpers';

/**
 * Camera Scanner Component with Intelligent Database Matching
 *
 * Features:
 * - Scans product labels with Gemini Vision API
 * - Matches scanned data against product database
 * - Shows exact matches, fuzzy matches, or "not in database"
 */
export default function CameraScanner({ products = [], onScanComplete }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [barcodeInfo, setBarcodeInfo] = useState(null);
  const [externalData, setExternalData] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setMatchResult(null);
    setBarcodeInfo(null);
    setExternalData(null);
    setStrategies([]);

    try {
      console.log(`🔍 Scanning with database of ${products.length} products...`);

      // Call unified product scanner (tries barcode + OCR)
      const scanResult = await productScanner.scan(file, products);

      if (scanResult.success) {
        // Set all result data
        setResult(scanResult.data);
        setMatchResult(scanResult.matchResult);
        setBarcodeInfo(scanResult.barcodeInfo);
        setExternalData(scanResult.externalData);
        setStrategies(scanResult.strategies);

        console.log('✅ Scan complete:', scanResult);

        if (onScanComplete) {
          onScanComplete({
            data: scanResult.data,
            match: scanResult.matchResult,
            barcode: scanResult.barcodeInfo,
            external: scanResult.externalData,
            strategies: scanResult.strategies
          });
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
    setMatchResult(null);
    setBarcodeInfo(null);
    setExternalData(null);
    setStrategies([]);
    setError(null);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Scan Product Label</h3>
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">{products.length} products</span>
        </div>
      </div>

      {!result && !scanning && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-2">Scan Product Label</p>
          <p className="text-sm text-gray-500 mb-4">
            Upload an image to auto-extract product info and match against database
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
            Multi-Strategy AI: Barcode Detection + OCR + External Database + Fuzzy Matching
          </p>
        </div>
      )}

      {scanning && (
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-blue-700 font-medium">Scanning image...</p>
          <p className="text-sm text-blue-600 mt-1">AI is reading the label and checking database</p>
        </div>
      )}

      {result && matchResult && (
        <div className="space-y-4">
          {/* Match Status Banner */}
          <div className={`rounded-lg p-4 border-2 ${
            matchResult.status === 'FOUND'
              ? matchResult.color === 'green' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {matchResult.status === 'FOUND' ? (
                  <CheckCircle className={`w-6 h-6 ${
                    matchResult.color === 'green' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <h4 className={`text-lg font-bold ${
                  matchResult.status === 'FOUND'
                    ? matchResult.color === 'green' ? 'text-green-900' : 'text-yellow-900'
                    : 'text-red-900'
                }`}>
                  {matchResult.title}
                </h4>
              </div>
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-sm ${
              matchResult.status === 'FOUND'
                ? matchResult.color === 'green' ? 'text-green-700' : 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {matchResult.description}
            </p>
            {matchResult.confidence > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700">Confidence:</span>
                <span className="text-sm font-bold text-gray-900">{matchResult.confidence}%</span>
              </div>
            )}
          </div>

          {/* Detection Strategy Badges */}
          {strategies.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-600">Detection Methods:</span>
              {strategies.map((strategy, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    strategy === 'BARCODE'
                      ? 'bg-purple-100 text-purple-700'
                      : strategy === 'OCR'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {strategy === 'BARCODE' && <Barcode className="w-3 h-3 mr-1" />}
                  {strategy === 'OCR' && <Camera className="w-3 h-3 mr-1" />}
                  {strategy}
                </span>
              ))}
            </div>
          )}

          {/* Barcode Information */}
          {barcodeInfo && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Barcode className="w-5 h-5 text-purple-600" />
                <h5 className="text-sm font-bold text-purple-900">Barcode Detected</h5>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-purple-700 font-medium">Value:</span>
                  <span className="ml-2 font-mono text-purple-900">{barcodeInfo.value}</span>
                </div>
                <div>
                  <span className="text-purple-700 font-medium">Format:</span>
                  <span className="ml-2 text-purple-900">{barcodeInfo.format}</span>
                </div>
              </div>
            </div>
          )}

          {/* External API Data */}
          {externalData && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <h5 className="text-sm font-bold text-blue-900">External Product Database</h5>
              </div>
              <div className="space-y-2">
                <div className="bg-white rounded p-2">
                  <span className="text-xs text-blue-700 font-medium">Product Name:</span>
                  <p className="text-sm text-blue-900 font-medium mt-1">{externalData.product_name}</p>
                </div>
                {externalData.brands && externalData.brands !== 'Unknown' && (
                  <div className="bg-white rounded p-2">
                    <span className="text-xs text-blue-700 font-medium">Brand:</span>
                    <p className="text-sm text-blue-900 mt-1">{externalData.brands}</p>
                  </div>
                )}
                {externalData.quantity && (
                  <div className="bg-white rounded p-2">
                    <span className="text-xs text-blue-700 font-medium">Quantity:</span>
                    <p className="text-sm text-blue-900 mt-1">{externalData.quantity}</p>
                  </div>
                )}
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ Data from Open Food Facts - matched against local inventory
                </p>
              </div>
            </div>
          )}

          {/* Scanned Data */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="text-sm font-bold text-gray-700 mb-3">📸 Extracted Information:</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Product ID</p>
                  {result._enriched_ID && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{result.Product_ID}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">LOT Number</p>
                  {result._enriched_LOT && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{result.LOT_Number}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Product Name</p>
                  {result._enriched_Name && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{result.Product_Name}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Expiry Date</p>
                  {result._enriched_Date && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-red-600">{result.Expiry_Date}</p>
              </div>
            </div>
            {(result._enriched_LOT || result._enriched_ID || result._enriched_Name || result._enriched_Date) && (
              <p className="text-xs text-blue-600 mt-3 bg-blue-50 p-2 rounded">
                💡 Some fields were auto-filled from database match
              </p>
            )}
          </div>

          {/* Database Matches */}
          {matchResult.status === 'FOUND' && matchResult.matches && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="text-sm font-bold text-blue-900 mb-3">
                💾 Database Match{matchResult.matches.length > 1 ? 'es' : ''}
                {matchResult.matches.length > 1 && ` (${matchResult.matches.length})`}:
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matchResult.matches.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Product:</span>
                        <span className="ml-1 font-bold text-gray-900">{product.Product_Name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <span className="ml-1 font-medium text-gray-900">{product.Product_ID}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">LOT:</span>
                        <span className="ml-1 font-medium text-gray-900">{product.LOT_Number}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Expiry:</span>
                        <span className={`ml-1 font-medium ${getExpiryColor(product.Days_Until_Expiry)}`}>
                          {formatDaysUntilExpiry(product.Days_Until_Expiry)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Stock:</span>
                        <span className="ml-1 font-medium text-gray-900">{product.Quantity_in_Stock} units</span>
                        <span className="ml-2 text-gray-600">Value:</span>
                        <span className="ml-1 font-medium text-gray-900">${product.Cost_per_Unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not in Database Suggestion */}
          {matchResult.status === 'NOT_IN_DATABASE' && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h5 className="text-sm font-bold text-orange-900 mb-2">💡 Suggestion:</h5>
              <p className="text-sm text-orange-700">{matchResult.suggestion}</p>
              <ul className="mt-3 text-sm text-orange-700 list-disc list-inside space-y-1">
                <li>Verify this is an airline catering product</li>
                <li>Check if it needs to be added to the inventory system</li>
                <li>Contact inventory manager if unsure</li>
              </ul>
            </div>
          )}

          <button
            onClick={handleReset}
            className="btn-primary w-full"
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
