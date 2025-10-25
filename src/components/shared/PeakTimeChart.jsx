import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Peak Time Chart Component
 * Shows worker needs across different time periods
 */
export default function PeakTimeChart({ data }) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Time Analysis</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            yAxisId="left"
            label={{ value: 'Drawers', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Workers', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="drawers" fill="#3b82f6" name="Drawers to Assemble" />
          <Bar yAxisId="right" dataKey="workers_needed" fill="#10b981" name="Workers Needed" />
          <ReferenceLine yAxisId="right" y={5} stroke="#ef4444" strokeDasharray="3 3" label="Normal Capacity" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Drawers</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Workers</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-gray-600">Normal Capacity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
