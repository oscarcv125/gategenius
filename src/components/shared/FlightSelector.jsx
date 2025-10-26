import { Plane } from 'lucide-react';

/**
 * Flight Selector Component
 * Displays a grid of flights to select from
 */
export default function FlightSelector({ flights, selectedFlight, onSelect }) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Select Flight for Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {flights.map((flight) => {
          const isSelected = selectedFlight?.Flight_ID === flight.Flight_ID;

          return (
            <button
              key={flight.Flight_ID}
              onClick={() => onSelect(flight)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Plane className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className={`font-bold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                    {flight.Flight_ID}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  flight.Flight_Type === 'long-haul'
                    ? 'bg-blue-100 text-blue-700'
                    : flight.Flight_Type === 'medium-haul'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {flight.Flight_Type}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium text-gray-900">{flight.Origin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium text-gray-900">{flight.Passenger_Count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{flight.Service_Type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {(flight.Date || flight.flight_date || '').toString().split('T')[0] || '—'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {flights.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No flights available
        </div>
      )}
    </div>
  );
}
