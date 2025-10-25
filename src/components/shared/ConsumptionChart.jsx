import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

/**
 * Consumption Chart Component
 * Shows consumption rates for products
 */
export default function ConsumptionChart({ data, title = "Consumption Analysis" }) {
  // Prepare data for chart
  const chartData = data.map(item => ({
    name: item.product_name?.substring(0, 20) || item.Product_Name?.substring(0, 20) || 'Unknown',
    consumption: item.avg_consumption_rate || item.Consumption_Rate || 0,
    waste: 100 - (item.avg_consumption_rate || item.Consumption_Rate || 0)
  }));

  const getBarColor = (rate) => {
    if (rate >= 80) return '#10b981'; // green
    if (rate >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis label={{ value: 'Consumption %', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Bar dataKey="consumption" fill="#3b82f6" name="Consumed %">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.consumption)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Good (80%+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Average (60-80%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Poor (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}
