import { DollarSign, TrendingUp, Package, Zap } from 'lucide-react';

/**
 * Impact Summary Component
 * Shows the overall financial and operational impact
 */
export default function ImpactSummary({ summary }) {
  if (!summary) return null;

  const {
    total_savings = 0,
    near_expiry_items_used = 0,
    assembly_time_change = 0,
    critical_items_count = 0
  } = summary;

  // Calculate global projections
  const savingsPerDay = total_savings * 100; // 100 flights per day
  const savingsPerYear = savingsPerDay * 365;
  const globalSavings = savingsPerYear * 200; // 200 facilities

  return (
    <div className="card bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Global Impact Projection</h3>
        <p className="text-purple-100">Based on this optimization scaled globally</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-300" />
            <span className="text-sm text-purple-100">Per Flight</span>
          </div>
          <p className="text-3xl font-bold">${total_savings.toFixed(2)}</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-300" />
            <span className="text-sm text-purple-100">Per Day</span>
          </div>
          <p className="text-3xl font-bold">${savingsPerDay.toFixed(0)}</p>
          <p className="text-xs text-purple-200 mt-1">100 flights</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-blue-300" />
            <span className="text-sm text-purple-100">Per Year</span>
          </div>
          <p className="text-3xl font-bold">${(savingsPerYear / 1000).toFixed(0)}K</p>
          <p className="text-xs text-purple-200 mt-1">Single facility</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-sm text-purple-100">Global (200 facilities)</span>
          </div>
          <p className="text-3xl font-bold">${(globalSavings / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-purple-200 mt-1">per year</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
        <div>
          <p className="text-purple-100 text-sm">Waste Prevented</p>
          <p className="text-2xl font-bold">{near_expiry_items_used}</p>
          <p className="text-xs text-purple-200">units</p>
        </div>
        <div>
          <p className="text-purple-100 text-sm">Time Impact</p>
          <p className="text-2xl font-bold">{assembly_time_change >= 0 ? '+' : ''}{assembly_time_change}</p>
          <p className="text-xs text-purple-200">minutes</p>
        </div>
        <div>
          <p className="text-purple-100 text-sm">Critical Items</p>
          <p className="text-2xl font-bold">{critical_items_count}</p>
          <p className="text-xs text-purple-200">addressed</p>
        </div>
      </div>

      {globalSavings > 100000000 && (
        <div className="mt-6 p-4 bg-yellow-400/20 border border-yellow-300/30 rounded-lg">
          <p className="font-bold text-yellow-100 text-center text-lg">
            🏆 Over $100M in global annual savings!
          </p>
        </div>
      )}
    </div>
  );
}
