import { useEffect, useState } from 'react';
import { useConsumptionStore } from '../../store/consumptionStore';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, CheckCircle } from 'lucide-react';
import FlightSelector from '../../components/shared/FlightSelector';
import ConsumptionChart from '../../components/shared/ConsumptionChart';
import ReportDownloader from '../../components/shared/ReportDownloader';

/**
 * Consumption Intelligence Dashboard
 *
 * Features:
 * - Flight consumption predictions
 * - High waste product alerts
 * - Stockout risk warnings
 * - Cost savings recommendations
 */
export default function ConsumptionDashboard() {
  const {
    flights,
    loading,
    loadData,
    getUniqueFlights,
    getFlightItems,
    getHighWasteProducts,
    getStockoutRiskProducts,
    getWasteStats,
    predictConsumption
  } = useConsumptionStore();

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flightPredictions, setFlightPredictions] = useState(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uniqueFlights = getUniqueFlights();
  const highWasteProducts = getHighWasteProducts();
  const stockoutRiskProducts = getStockoutRiskProducts();
  const stats = getWasteStats();

  // Prepare report data
  const reportData = {
    stats,
    highWasteProducts,
    stockoutRiskProducts,
    selectedFlight,
    flightPredictions
  };

  // When a flight is selected, generate predictions
  useEffect(() => {
    if (selectedFlight) {
      const items = getFlightItems(selectedFlight.Flight_ID);

      const predictions = items.map(item => {
        const pred = predictConsumption(
          item.Product_ID,
          selectedFlight.Flight_Type,
          item.Standard_Specification_Qty
        );

        return {
          ...item,
          ...pred
        };
      });

      setFlightPredictions(predictions);
    }
  }, [selectedFlight]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading consumption data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Download Section */}
      <div className="flex justify-end">
        <ReportDownloader
          moduleName="Consumption Prediction"
          data={reportData}
          reportType="consumption"
          flightId={selectedFlight?.Flight_ID}
        />
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Waste Cost</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                ${stats.total_waste_cost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly: ${(stats.total_waste_cost * 4).toFixed(0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Returned Units</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total_returned_units}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Could be reduced</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Consumption</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.overall_consumption_rate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all flights</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Flights Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.unique_flights}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Historical data</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Flight Selector */}
      <FlightSelector
        flights={uniqueFlights.slice(0, 12)}
        selectedFlight={selectedFlight}
        onSelect={setSelectedFlight}
      />

      {/* Flight Predictions */}
      {selectedFlight && flightPredictions && (
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-gray-700 select-none">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Flight {selectedFlight.Flight_ID} - Consumption Predictions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Flight Type</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedFlight.Flight_Type}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Passengers</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedFlight.Passenger_Count}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Products</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{flightPredictions.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Confidence</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {flightPredictions[0]?.confidence || 'medium'}
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {flightPredictions.slice(0, 10).map((pred, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{pred.Product_Name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        pred.avg_consumption_rate >= 80
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : pred.avg_consumption_rate >= 60
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {pred.avg_consumption_rate}% avg consumption
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Standard Qty</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{pred.Standard_Specification_Qty}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Predicted Qty</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">{pred.predicted_qty}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Difference</p>
                        <p className={`font-bold ${pred.difference < 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {pred.difference > 0 ? '+' : ''}{pred.difference}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        {pred.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consumption Chart */}
      {highWasteProducts.length > 0 && (
        <ConsumptionChart
          data={highWasteProducts}
          title="High Waste Products - Consumption Rates"
        />
      )}

      {/* High Waste Products */}
      {highWasteProducts.length > 0 && (
        <div className="card select-none">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">High Waste Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Products with low consumption rates (below 70%)</p>
            </div>
            <div className="flex items-center justify-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
          </div>

          <div className="space-y-3">
            {highWasteProducts.slice(0, 5).map((product) => (
              <div key={product.product_id} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{product.product_name}</h4>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                        {product.avg_consumption_rate}% consumed
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Total waste: ${product.total_waste.toFixed(2)}</span>
                      <span>•</span>
                      <span>{product.flights_count} flights</span>
                    </div>
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">💡 Recommendation:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        Reduce loading by {Math.round((100 - product.avg_consumption_rate) / 2)}% to minimize waste.
                        Potential savings: ${(product.total_waste * 0.5).toFixed(2)} per month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stockout Risk Products */}
      {stockoutRiskProducts.length > 0 && (
        <div className="card select-none">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Stockout Risk Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Products that frequently run out during flight</p>
            </div>
            <div className="flex items-center justify-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stockoutRiskProducts.slice(0, 6).map((product) => (
              <div key={product.product_id} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{product.product_name}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      "Ran out early" {product.count} times
                    </span>
                  </div>
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      ✅ Increase loading by 10-15% to prevent stockouts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
