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
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Scan Product Label</h3>
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{products.length} products</span>
        </div>
      </div>

      {!result && !scanning && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Scan Product Label</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-3"></div>
          <p className="text-blue-700 dark:text-blue-300 font-medium">Scanning image...</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">AI is reading the label and checking database</p>
        </div>
      )}

      {result && matchResult && (
        <div className="space-y-4">
          {/* Match Status Banner */}
          <div className={`rounded-lg p-4 border-2 ${
            matchResult.status === 'FOUND'
              ? matchResult.color === 'green' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {matchResult.status === 'FOUND' ? (
                  <CheckCircle className={`w-6 h-6 ${
                    matchResult.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
                <h4 className={`text-lg font-bold ${
                  matchResult.status === 'FOUND'
                    ? matchResult.color === 'green' ? 'text-green-900 dark:text-green-200' : 'text-yellow-900 dark:text-yellow-200'
                    : 'text-red-900 dark:text-red-200'
                }`}>
                  {matchResult.title}
                </h4>
              </div>
              <button
                onClick={handleReset}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-sm ${
              matchResult.status === 'FOUND'
                ? matchResult.color === 'green' ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {matchResult.description}
            </p>
            {matchResult.confidence > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Confidence:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{matchResult.confidence}%</span>
              </div>
            )}
          </div>

          {/* Detection Strategy Badges */}
          {strategies.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Detection Methods:</span>
              {strategies.map((strategy, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    strategy === 'BARCODE'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      : strategy === 'OCR'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center space-x-2 mb-2">
                <Barcode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h5 className="text-sm font-bold text-purple-900 dark:text-purple-200">Barcode Detected</h5>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Value:</span>
                  <span className="ml-2 font-mono text-purple-900 dark:text-purple-100">{barcodeInfo.value}</span>
                </div>
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Format:</span>
                  <span className="ml-2 text-purple-900 dark:text-purple-100">{barcodeInfo.format}</span>
                </div>
              </div>
            </div>
          )}

          {/* External API Data */}
          {externalData && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h5 className="text-sm font-bold text-blue-900 dark:text-blue-200">External Product Database</h5>
              </div>
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 rounded p-2">
                  <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Product Name:</span>
                  <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mt-1">{externalData.product_name}</p>
                </div>
                {externalData.brands && externalData.brands !== 'Unknown' && (
                  <div className="bg-white dark:bg-gray-800 rounded p-2">
                    <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Brand:</span>
                    <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">{externalData.brands}</p>
                  </div>
                )}
                {externalData.quantity && (
                  <div className="bg-white dark:bg-gray-800 rounded p-2">
                    <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Quantity:</span>
                    <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">{externalData.quantity}</p>
                  </div>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ℹ️ Data from Open Food Facts - matched against local inventory
                </p>
              </div>
            </div>
          )}

          {/* Scanned Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">📸 Extracted Information:</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Product ID</p>
                  {result._enriched_ID && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{result.Product_ID}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">LOT Number</p>
                  {result._enriched_LOT && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{result.LOT_Number}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Product Name</p>
                  {result._enriched_Name && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{result.Product_Name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expiry Date</p>
                  {result._enriched_Date && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                <p className="font-medium text-red-600 dark:text-red-400">{result.Expiry_Date}</p>
              </div>
            </div>
            {(result._enriched_LOT || result._enriched_ID || result._enriched_Name || result._enriched_Date) && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                💡 Some fields were auto-filled from database match
              </p>
            )}
          </div>

          {/* Database Matches */}
          {matchResult.status === 'FOUND' && matchResult.matches && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h5 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-3">
                💾 Database Match{matchResult.matches.length > 1 ? 'es' : ''}
                {matchResult.matches.length > 1 && ` (${matchResult.matches.length})`}:
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matchResult.matches.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Product:</span>
                        <span className="ml-1 font-bold text-gray-900 dark:text-gray-100">{product.Product_Name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ID:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{product.Product_ID}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">LOT:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{product.LOT_Number}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Expiry:</span>
                        <span className={`ml-1 font-medium ${getExpiryColor(product.Days_Until_Expiry)}`}>
                          {formatDaysUntilExpiry(product.Days_Until_Expiry)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{product.Quantity_in_Stock} units</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Value:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">${product.Cost_per_Unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not in Database Suggestion */}
          {matchResult.status === 'NOT_IN_DATABASE' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
              <h5 className="text-sm font-bold text-orange-900 dark:text-orange-200 mb-2">💡 Suggestion:</h5>
              <p className="text-sm text-orange-700 dark:text-orange-300">{matchResult.suggestion}</p>
              <ul className="mt-3 text-sm text-orange-700 dark:text-orange-300 list-disc list-inside space-y-1">
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
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-200 dark:border-red-700">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-bold text-red-900 dark:text-red-200">Scan Failed</h4>
            <button
              onClick={handleReset}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
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
