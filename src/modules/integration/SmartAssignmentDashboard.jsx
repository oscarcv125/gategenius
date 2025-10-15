import { useEffect, useState } from 'react';
import { useExpiryStore } from '../../store/expiryStore';
import { useConsumptionStore } from '../../store/consumptionStore';
import { Zap, TrendingUp, Calendar, Clock, DollarSign, CheckCircle, Download } from 'lucide-react';
import { generateSmartFlightAssignment } from '../../algorithms/smartAssignment';
import ImpactSummary from '../../components/shared/ImpactSummary';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-purple-600 rounded-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Smart Flight Assignment</h2>
            <p className="text-gray-600 mt-1">
              AI-powered integration of expiry tracking, consumption prediction, and workforce planning
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Expiry Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Consumption Prediction</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Productivity Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Selector */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Flight</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {flights.slice(0, 6).map((flight) => (
            <button
              key={flight.Flight_ID}
              onClick={() => handleFlightSelect(flight)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedFlight?.Flight_ID === flight.Flight_ID
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{flight.Flight_ID}</p>
                  <p className="text-sm text-gray-600 mt-1">{flight.Origin}</p>
                  <p className="text-xs text-gray-500 mt-1">{flight.Flight_Type}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
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
          <ImpactSummary summary={assignment.summary} />

          {/* Summary Card */}
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Flight {assignment.flight_id} - Smart Optimization
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Savings</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${assignment.summary.total_savings}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Near-Expiry Used</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {assignment.summary.near_expiry_items_used}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Time Impact</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {assignment.summary.assembly_time_change >= 0 ? '+' : ''}
                  {assignment.summary.assembly_time_change}m
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Status</span>
                </div>
                <p className={`text-sm font-bold ${
                  assignment.summary.status === 'CRITICAL_WASTE_PREVENTION'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {assignment.summary.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Product Recommendations</h3>

            {assignment.recommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.product_id}
                className="card border-l-4 border-purple-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{rec.product_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.product_id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-gray-500 line-through">{rec.standard_qty}</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {rec.recommended_qty}
                      </span>
                      <span className="text-gray-600">units</span>
                    </div>
                    <p className={`text-sm font-medium mt-1 ${
                      rec.quantity_change < 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {rec.quantity_change > 0 ? '+' : ''}{rec.quantity_change} units
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-bold text-gray-900">WHY?</p>

                  {rec.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start space-x-3 pl-4">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        factor.type === 'Consumption' ? 'bg-blue-500' :
                        factor.type === 'Expiry' ? 'bg-red-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">[{factor.type}]</span>{' '}
                        <span className="text-gray-600">{factor.description}</span>
                        {factor.alert && (
                          <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded ${
                            factor.alert === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {factor.alert}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {rec.use_near_expiry && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-bold text-red-900">
                        Use LOT {rec.selected_lot} (expires in {rec.days_until_expiry} days)
                      </p>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-bold text-green-900">
                      Impact: ${rec.financial_impact.total.toFixed(2)} saved
                    </p>
                    {rec.financial_impact.waste_prevented > 0 && (
                      <p className="text-xs text-green-700 mt-1">
                        Waste prevented: ${rec.financial_impact.waste_prevented.toFixed(2)}
                      </p>
                    )}
                    {rec.financial_impact.consumption_savings > 0 && (
                      <p className="text-xs text-green-700 mt-1">
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
            <div className="card bg-green-50 border-2 border-green-300 animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-900">Assignment Approved!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Loading list for Flight {assignment.flight_id} has been generated and downloaded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approve Button */}
          <div className={`card ${isApproved ? 'bg-green-50 border-2 border-green-300' : 'bg-purple-50 border-2 border-purple-300'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">
                  {isApproved ? 'Assignment Approved' : 'Ready to approve this assignment?'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
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
                  className={`btn-primary ${isApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
