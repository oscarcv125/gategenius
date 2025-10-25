import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { formatDaysUntilExpiry, getExpiryColor, isExpired } from '../../utils/dateHelpers';

/**
 * Product Table Component
 * Displays products in a sortable, filterable table
 */
export default function ProductTable({ products, onRemoveProduct }) {
  const [sortField, setSortField] = useState('Days_Until_Expiry');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.Product_Name?.toLowerCase().includes(searchLower) ||
      product.Product_ID?.toLowerCase().includes(searchLower) ||
      product.LOT_Number?.toLowerCase().includes(searchLower)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Convert to numbers if numeric field
    if (sortField === 'Days_Until_Expiry' || sortField === 'Quantity') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-primary-600" />
      : <ChevronDown className="w-4 h-4 text-primary-600" />;
  };

  const handleRemove = (product) => {
    if (onRemoveProduct) {
      onRemoveProduct(product);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">All Products</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, LOT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        Showing {sortedProducts.length} of {products.length} products
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Product_ID')}
              >
                <div className="flex items-center space-x-1">
                  <span>Product ID</span>
                  <SortIcon field="Product_ID" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Product_Name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Product Name</span>
                  <SortIcon field="Product_Name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('LOT_Number')}
              >
                <div className="flex items-center space-x-1">
                  <span>LOT Number</span>
                  <SortIcon field="LOT_Number" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Expiry_Date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Expiry Date</span>
                  <SortIcon field="Expiry_Date" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Days_Until_Expiry')}
              >
                <div className="flex items-center space-x-1">
                  <span>Days Left</span>
                  <SortIcon field="Days_Until_Expiry" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Quantity')}
              >
                <div className="flex items-center space-x-1">
                  <span>Quantity</span>
                  <SortIcon field="Quantity" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.slice(0, 50).map((product, idx) => {
              const expired = isExpired(product.Days_Until_Expiry);
              return (
                <tr key={idx} className={`hover:bg-gray-50 ${expired ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.Product_ID}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.Product_Name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.LOT_Number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.Expiry_Date}
                  </td>
                  <td className={`px-4 py-3 text-sm ${getExpiryColor(product.Days_Until_Expiry)}`}>
                    {formatDaysUntilExpiry(product.Days_Until_Expiry)}
                    {expired && <span className="ml-2 text-xs">(Expired)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {product.Quantity}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {expired && (
                      <button
                        onClick={() => handleRemove(product)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                        title="Remove expired product"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedProducts.length > 50 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 50 results. Use search to narrow down.
        </div>
      )}

      {sortedProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
