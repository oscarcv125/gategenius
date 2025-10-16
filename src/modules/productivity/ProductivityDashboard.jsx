import { useEffect } from 'react';
import { useProductivityStore } from '../../store/productivityStore';
import { Users, Clock, TrendingUp } from 'lucide-react';
import PeakTimeChart from '../../components/shared/PeakTimeChart';
import ReportDownloader from '../../components/shared/ReportDownloader';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading productivity data...</p>
        </div>
      </div>
    );
  }

  const totalTime = getTotalTime();
  const workforceNeeds = calculateWorkersNeeded(8);
  const complexity = getComplexityStats();
  const peakTimes = getPeakTimes();

  // Prepare report data
  const reportData = {
    drawers,
    totalTime,
    workforceNeeds,
    complexity,
    peakTimes
  };

  return (
    <div className="space-y-6">
      {/* Report Download Section */}
      <div className="flex justify-end">
        <ReportDownloader
          moduleName="Workforce Planning"
          data={reportData}
          reportType="productivity"
        />
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Drawers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{drawers.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">To assemble today</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalTime}h</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Worker-hours needed</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Workers Needed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{workforceNeeds.workers_needed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For 8-hour shift</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card select-none">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{workforceNeeds.utilization}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {workforceNeeds.utilization >= 90 ? 'Optimal' : 'Can improve'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Plan Card */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-gray-700 select-none">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">TODAY'S WORKFORCE PLAN</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Optimal staffing for {new Date().toLocaleDateString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold ${
            workforceNeeds.workers_needed <= 10 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
            {workforceNeeds.workers_needed <= 10 ? 'OPTIMAL STAFFING' : 'PEAK LOAD'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Drawers</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{drawers.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalTime}h</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Workers Needed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{workforceNeeds.workers_needed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Shift Duration</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">8h</p>
          </div>
        </div>
      </div>

      {/* Peak Times Chart */}
      <PeakTimeChart data={peakTimes} />

      {/* Peak Times Details */}
      <div className="card select-none">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Peak Time Details</h3>
        <div className="space-y-3">
          {peakTimes.map((peak, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{peak.time}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{peak.drawers} drawers to assemble</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary-600 dark:text-primary-400">{peak.workers_needed} workers</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">needed</p>
              </div>
            </div>
          ))}
        </div>
        {peakTimes.some(p => p.workers_needed > 5) && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">💡 Recommendation:</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Add 1 extra worker from 14:00-16:00 to handle peak load
            </p>
          </div>
        )}
      </div>

      {/* Complexity Breakdown */}
      <div className="card select-none">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Complexity Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Simple (&lt; 5 min)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick assembly</p>
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{complexity.simple}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Medium (5-8 min)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Standard assembly</p>
            </div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{complexity.medium}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Complex (&gt; 8 min)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Detailed assembly</p>
            </div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{complexity.complex}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Time per Drawer</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{complexity.avg_time} min</p>
        </div>
      </div>
    </div>
  );
}
