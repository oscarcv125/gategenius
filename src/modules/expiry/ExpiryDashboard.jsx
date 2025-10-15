import { useEffect } from 'react';
import { useExpiryStore } from '../../store/expiryStore';
import { AlertTriangle, Calendar, Camera, Package } from 'lucide-react';
import CameraScanner from '../../components/shared/CameraScanner';
import ProductTable from '../../components/shared/ProductTable';
import { formatDaysUntilExpiry } from '../../utils/dateHelpers';

/**
 * Expiration Intelligence Dashboard
 * Owner: Hermann
 *
 * Features:
 * - Critical expiry alerts (expiring today)
 * - Warning alerts (expiring this week)
 * - Camera scanning for LOT numbers
 * - Auto-rotation recommendations
 */
export default function ExpiryDashboard() {
  const {
    products,
    loading,
    loadData,
    getCriticalItems,
    getWarningItems,
    getWasteStats,
    removeProduct
  } = useExpiryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expiration data...</p>
        </div>
      </div>
    );
  }

  const criticalItems = getCriticalItems();
  const warningItems = getWarningItems();
  const stats = getWasteStats();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.total_products}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Critical (Today)"
          value={stats.critical_units}
          subtitle={`${stats.critical_count} products`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Warning (This Week)"
          value={stats.warning_units}
          subtitle={`${stats.warning_count} products`}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Value at Risk"
          value={`$${stats.estimated_critical_value.toFixed(2)}`}
          subtitle="Expiring today"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <div className="alert-danger">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold text-red-900">CRITICAL EXPIRY ALERTS</h3>
              <p className="text-sm text-red-700 mt-1">
                {criticalItems.length} products expire TODAY (Oct 24, 2025)
              </p>
              <div className="mt-4 space-y-3">
                {criticalItems.slice(0, 5).map((item) => (
                  <div key={item.LOT_Number} className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{item.Quantity} units</span>
                          <span className="text-gray-600">{item.Product_Name}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          LOT: {item.LOT_Number} | Expires: {item.Expiry_Date}
                        </div>
                      </div>
                      <button
                        className="btn-primary text-sm"
                        onClick={() => {
                          // Navigate to Smart Assignment tab
                          window.dispatchEvent(new CustomEvent('navigateToSmartAssignment', {
                            detail: { product: item }
                          }));
                        }}
                      >
                        Assign to Flight
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningItems.length > 0 && (
        <div className="alert-warning">
          <div className="flex items-start">
            <Calendar className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold text-yellow-900">WARNING - THIS WEEK</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {warningItems.length} products expiring in the next 7 days
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {warningItems.slice(0, 6).map((item) => (
                  <div key={item.LOT_Number} className="bg-white rounded-lg p-3 border-l-4 border-yellow-400">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.Product_Name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.Quantity} units | LOT: {item.LOT_Number}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Expires in {formatDaysUntilExpiry(item.Days_Until_Expiry)} ({item.Expiry_Date})
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner */}
      <CameraScanner
        products={products}
        onScanComplete={(data) => {
          console.log('Scanned product:', data);
          // Hermann can add logic to add this to the store
        }}
      />

      {/* All Products Table */}
      <ProductTable products={products} onRemoveProduct={removeProduct} />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
