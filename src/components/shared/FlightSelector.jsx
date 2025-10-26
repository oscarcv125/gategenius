import { useState, useMemo } from 'react';
import { Plane, Search, X } from 'lucide-react';

/**
 * Flight Selector Component
 * Code entry with autocomplete for flight selection
 */
export default function FlightSelector({ flights, selectedFlight, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter flights based on search query
  const filteredFlights = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return flights
      .filter(flight =>
        flight.Flight_ID.toLowerCase().includes(query) ||
        flight.Origin.toLowerCase().includes(query)
      )
      .slice(0, 8); // Show max 8 suggestions
  }, [searchQuery, flights]);

  const handleSelectFlight = (flight) => {
    onSelect(flight);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleClearSelection = () => {
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Select Flight for Analysis
      </h3>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter flight code (e.g., GG-4523)..."
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30
                     transition-colors placeholder-gray-400 dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && searchQuery && filteredFlights.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {filteredFlights.map((flight) => (
              <button
                key={flight.Flight_ID}
                onClick={() => handleSelectFlight(flight)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {flight.Flight_ID}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    flight.Flight_Type === 'long-haul'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : flight.Flight_Type === 'medium-haul'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {flight.Flight_Type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Origin: </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{flight.Origin}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Passengers: </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{flight.Passenger_Count}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showSuggestions && searchQuery && filteredFlights.length === 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
            No flights found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Selected Flight Display */}
      {selectedFlight && (
        <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-bold text-lg text-primary-900 dark:text-primary-200">
                {selectedFlight.Flight_ID}
              </span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="block text-gray-600 dark:text-gray-400 mb-1">Origin</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedFlight.Origin}</span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400 mb-1">Passengers</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedFlight.Passenger_Count}</span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400 mb-1">Service Type</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedFlight.Service_Type}</span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400 mb-1">Flight Type</span>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                selectedFlight.Flight_Type === 'long-haul'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : selectedFlight.Flight_Type === 'medium-haul'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {selectedFlight.Flight_Type}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
            <span className="text-xs text-gray-600 dark:text-gray-400">Date: </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {(selectedFlight.Date || selectedFlight.flight_date || '').toString().split('T')[0] || '—'}
            </span>
          </div>
        </div>
      )}

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        💡 Tip: Start typing a flight code or origin city to find flights quickly
      </p>
    </div>
  );
}
