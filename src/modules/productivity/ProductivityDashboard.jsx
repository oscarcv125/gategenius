import { useEffect } from 'react';
import { useProductivityStore } from '../../store/productivityStore';
import { Users, Clock, TrendingUp } from 'lucide-react';
import PeakTimeChart from '../../components/shared/PeakTimeChart';

/**
 * Workforce Productivity Dashboard
 *
 * Features:
 * - Workers needed calculation
 * - Peak time analysis
 * - Complexity breakdown
 */
export default function ProductivityDashboard() {
  const {
    drawers,
    loading,
    loadData,
    getTotalTime,
    calculateWorkersNeeded,
    getComplexityStats,
    getPeakTimes
  } = useProductivityStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading productivity data...</p>
        </div>
      </div>
    );
  }

  const totalTime = getTotalTime();
  const workforceNeeds = calculateWorkersNeeded(8);
  const complexity = getComplexityStats();
  const peakTimes = getPeakTimes();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Drawers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{drawers.length}</p>
              <p className="text-xs text-gray-500 mt-1">To assemble today</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalTime}h</p>
              <p className="text-xs text-gray-500 mt-1">Worker-hours needed</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Workers Needed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{workforceNeeds.workers_needed}</p>
              <p className="text-xs text-gray-500 mt-1">For 8-hour shift</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilization</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{workforceNeeds.utilization}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {workforceNeeds.utilization >= 90 ? 'Optimal' : 'Can improve'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Plan Card */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">TODAY'S WORKFORCE PLAN</h3>
            <p className="text-sm text-gray-600 mt-1">Optimal staffing for {new Date().toLocaleDateString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold ${
            workforceNeeds.workers_needed <= 10 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
            {workforceNeeds.workers_needed <= 10 ? 'OPTIMAL STAFFING' : 'PEAK LOAD'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Drawers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{drawers.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Estimated Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalTime}h</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Workers Needed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{workforceNeeds.workers_needed}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Shift Duration</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">8h</p>
          </div>
        </div>
      </div>

      {/* Peak Times Chart */}
      <PeakTimeChart data={peakTimes} />

      {/* Peak Times Details */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Time Details</h3>
        <div className="space-y-3">
          {peakTimes.map((peak, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary-100 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{peak.time}</p>
                  <p className="text-sm text-gray-600">{peak.drawers} drawers to assemble</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{peak.workers_needed} workers</p>
                <p className="text-xs text-gray-500">needed</p>
              </div>
            </div>
          ))}
        </div>
        {peakTimes.some(p => p.workers_needed > 5) && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-yellow-900">💡 Recommendation:</p>
            <p className="text-sm text-yellow-700 mt-1">
              Add 1 extra worker from 14:00-16:00 to handle peak load
            </p>
          </div>
        )}
      </div>

      {/* Complexity Breakdown */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Complexity Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Simple (&lt; 5 min)</p>
              <p className="text-sm text-gray-600">Quick assembly</p>
            </div>
            <span className="text-2xl font-bold text-green-600">{complexity.simple}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Medium (5-8 min)</p>
              <p className="text-sm text-gray-600">Standard assembly</p>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{complexity.medium}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Complex (&gt; 8 min)</p>
              <p className="text-sm text-gray-600">Detailed assembly</p>
            </div>
            <span className="text-2xl font-bold text-red-600">{complexity.complex}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Average Time per Drawer</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{complexity.avg_time} min</p>
        </div>
      </div>
    </div>
  );
}
