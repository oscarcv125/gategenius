import { useEffect, useState } from 'react';
import { useExpiryStore } from '../../store/expiryStore';
import { useConsumptionStore } from '../../store/consumptionStore';
import { Zap, TrendingUp, Calendar, Clock, DollarSign, CheckCircle, Download } from 'lucide-react';
import { generateSmartFlightAssignment } from '../../algorithms/smartAssignment';
import ImpactSummary from '../../components/shared/ImpactSummary';
import ReportDownloader from '../../components/shared/ReportDownloader';

/**
 * Smart Flight Assignment Dashboard
 *
 * THE KILLER FEATURE!
 *
 * This module combines all 3 systems to create intelligent flight assignments:
 * - Uses expiry data to find near-expiry products
 * - Uses consumption predictions to optimize quantities
 * - Calculates productivity impact
 * - Shows integrated recommendations with reasons
 */
export default function SmartAssignmentDashboard() {
  const expiryStore = useExpiryStore();
  const consumptionStore = useConsumptionStore();

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    expiryStore.loadData();
    consumptionStore.loadData();
  }, []);

  // Get unique flights
  const flights = consumptionStore.getUniqueFlights();

  // Select first flight by default
  useEffect(() => {
    if (flights.length > 0 && !selectedFlight) {
      handleFlightSelect(flights[0]);
    }
  }, [flights]);

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setIsApproved(false);
    setShowSuccessMessage(false);

    // Generate smart assignment
    const result = generateSmartFlightAssignment(
      flight,
      expiryStore.products,
      consumptionStore.flights,
      consumptionStore.predictConsumption
    );

    setAssignment(result);
  };

  const handleApproveAndGenerate = () => {
    if (!assignment) return;

    // Mark as approved
    setIsApproved(true);
    setShowSuccessMessage(true);

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);

    // Generate and download loading list
    generateLoadingListCSV(assignment);
  };

  const generateLoadingListCSV = (assignment) => {
    // Generate CSV content
    const headers = ['Product ID', 'Product Name', 'Quantity', 'LOT Number', 'Expiry Date', 'Location', 'Special Instructions'];
    const rows = assignment.recommendations.map(rec => [
      rec.product_id,
      rec.product_name,
      rec.recommended_qty,
      rec.selected_lot || 'Standard',
      rec.days_until_expiry ? `Expires in ${rec.days_until_expiry} days` : 'N/A',
      'Main Storage',
      rec.use_near_expiry ? '⚠️ NEAR EXPIRY - Use First' : 'Standard Loading'
    ]);

    // Build CSV
    const csvContent = [
      `Flight Loading List - ${assignment.flight_id}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Total Items: ${assignment.recommendations.length}`,
      `Total Savings: $${assignment.summary.total_savings}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `LoadingList_${assignment.flight_id}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loading = expiryStore.loading || consumptionStore.loading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing data...</p>
        </div>
      </div>
    );
  }

      // Funciones auxiliares para cálculos de proyección
    const calculateDaySavings = (flight) => {
      if (!flight || !consumptionStore.flights) return 0;
      
      const flightDate = flight.Date;
      const sameDayFlights = consumptionStore.getUniqueFlights()
        .filter(f => f.Date === flightDate);
      
      // Estima ahorro promedio por vuelo del día
      const avgSavingsPerFlight = assignment?.summary.total_savings || 277.67;
      return Math.round(sameDayFlights.length * avgSavingsPerFlight);
    };

    const getDayFlightCount = (flight) => {
      if (!flight) return 0;
      const flightDate = flight.Date;
      return consumptionStore.getUniqueFlights()
        .filter(f => f.Date === flightDate).length;
    };

    const calculateYearSavings = (flight) => {
      const dailyAvg = calculateDaySavings(flight);
      return Math.round((dailyAvg * 365) / 1000); // en miles (K)
    };

    const calculateGlobalSavings = (flight) => {
      const yearSavings = calculateYearSavings(flight) * 1000; // volver a unidades completas
      return Math.round((yearSavings * 200) / 1000000); // en millones (M)
    };


  return (
    <div className="space-y-6">
      {/* Report Download Section */}
      {assignment && (
        <div className="flex justify-end">
          <ReportDownloader
            moduleName="Smart Assignment"
            data={assignment}
            reportType="smart_assignment"
            flightId={selectedFlight?.Flight_ID}
          />
        </div>
      )}

      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-gray-700 select-none">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-purple-600 dark:bg-purple-500 rounded-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Smart Flight Assignment</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI-powered integration of expiry tracking, consumption prediction, and workforce planning
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Expiry Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Consumption Prediction</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Productivity Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Selector */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 select-none">Select Flight</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {flights.slice(0, 6).map((flight) => (
            <button
              key={flight.Flight_ID}
              onClick={() => handleFlightSelect(flight)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedFlight?.Flight_ID === flight.Flight_ID
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{flight.Flight_ID}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{flight.Origin}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{flight.Flight_Type}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                  {flight.Passenger_Count} pax
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Assignment Results */}
      {assignment && (
        <>
          {/* Impact Summary */}
          {/*<ImpactSummary summary={assignment.summary} />*/}
          <div className="card bg-gradient-to-r from-purple-600 to-blue-600 text-white select-none">
          <h3 className="text-xl font-bold mb-2">Global Impact Projection</h3>
          <p className="text-purple-100 mb-6">Based on this optimization scaled globally</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-100 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Per Flight</span>
              </div>
              <p className="text-2xl font-bold">
                ${assignment.summary.total_savings}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-100 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Per Day</span>
              </div>
              <p className="text-2xl font-bold">
                ${calculateDaySavings(selectedFlight)}
              </p>
              <p className="text-xs text-purple-200 mt-1">
                {getDayFlightCount(selectedFlight)} flights
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-100 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                <span>Per Year</span>
              </div>
              <p className="text-2xl font-bold">
                ${calculateYearSavings(selectedFlight)}K
              </p>
              <p className="text-xs text-purple-200 mt-1">Single facility</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-100 text-sm mb-2">
                <Zap className="w-4 h-4" />
                <span>Global (200 facilities)</span>
              </div>
              <p className="text-2xl font-bold">
                ${calculateGlobalSavings(selectedFlight)}M
              </p>
              <p className="text-xs text-purple-200 mt-1">per year</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{assignment.summary.near_expiry_items_used}</p>
              <p className="text-sm text-purple-200">Waste Prevented</p>
              <p className="text-xs text-purple-300">units</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {assignment.summary.assembly_time_change >= 0 ? '-' : '+'}{Math.abs(assignment.summary.assembly_time_change).toFixed(1)}
              </p>
              <p className="text-sm text-purple-200">Time Impact</p>
              <p className="text-xs text-purple-300">minutes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{assignment.summary.critical_items_count}</p>
              <p className="text-sm text-purple-200">Critical Items</p>
              <p className="text-xs text-purple-300">addressed</p>
            </div>
          </div>

          <div className="mt-6 p-3 bg-white/10 rounded-lg">
            <p className="text-center font-bold text-lg">
              🏆 Over $100M in global annual savings!
            </p>
          </div>
        </div>

          {/* Summary Card */}
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-gray-700 select-none">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Flight {assignment.flight_id} - Smart Optimization
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Savings</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${assignment.summary.total_savings}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Near-Expiry Used</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {assignment.summary.near_expiry_items_used}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Time Impact</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {assignment.summary.assembly_time_change >= 0 ? '+' : ''}
                  {assignment.summary.assembly_time_change}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Status</span>
                </div>
                <p className={`text-sm font-bold ${
                  assignment.summary.status === 'CRITICAL_WASTE_PREVENTION'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {assignment.summary.status.replaceAll('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 select-none">Product Recommendations</h3>

            {assignment.recommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.product_id}
                className="card border-l-4 border-purple-500 select-none"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{rec.product_name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.product_id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-gray-500 dark:text-gray-400 line-through">{rec.standard_qty}</span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {rec.recommended_qty}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">units</span>
                    </div>
                    <p className={`text-sm font-medium mt-1 ${
                      rec.quantity_change < 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {rec.quantity_change > 0 ? '+' : ''}{rec.quantity_change} units
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-bold text-gray-900 dark:text-gray-100">WHY?</p>

                  {rec.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start space-x-3 pl-4">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        factor.type === 'Consumption' ? 'bg-blue-500' :
                        factor.type === 'Expiry' ? 'bg-red-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">[{factor.type}]</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{factor.description}</span>
                        {factor.alert && (
                          <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded ${
                            factor.alert === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {factor.alert}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {rec.use_near_expiry && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                      <p className="text-sm font-bold text-red-900 dark:text-red-200">
                        Use LOT {rec.selected_lot} (expires in {rec.days_until_expiry} days)
                      </p>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm font-bold text-green-900 dark:text-green-200">
                      Impact: ${rec.financial_impact.total.toFixed(2)} saved
                    </p>
                    {rec.financial_impact.waste_prevented > 0 && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Waste prevented: ${rec.financial_impact.waste_prevented.toFixed(2)}
                      </p>
                    )}
                    {rec.financial_impact.consumption_savings > 0 && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Consumption savings: ${rec.financial_impact.consumption_savings.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="card bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 animate-fade-in select-none">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-bold text-green-900 dark:text-green-200">Assignment Approved!</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Loading list for Flight {assignment.flight_id} has been generated and downloaded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approve Button */}
          <div className={`card select-none ${isApproved ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700' : 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {isApproved ? 'Assignment Approved' : 'Ready to approve this assignment?'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isApproved
                    ? `Loading list for Flight ${assignment.flight_id} is ready for warehouse`
                    : `This will generate the loading list for Flight ${assignment.flight_id}`
                  }
                </p>
              </div>
              <div className="flex space-x-3">
                {isApproved && (
                  <button
                    onClick={() => generateLoadingListCSV(assignment)}
                    className="btn-secondary"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Again
                  </button>
                )}
                <button
                  onClick={handleApproveAndGenerate}
                  disabled={isApproved}
                  className={`btn-primary ${isApproved ? 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600' : 'bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  {isApproved ? 'Approved' : 'Approve & Generate Loading List'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
