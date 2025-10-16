/**
 * CSV Report Generator
 * Generates CSV files with multiple sections for different module reports
 */

/**
 * Escape CSV field value
 */
const escapeCSVField = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape double quotes and wrap in quotes if contains comma, newline, or quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Convert array of objects to CSV rows
 */
const objectsToCSVRows = (objects, columns) => {
  if (!objects || objects.length === 0) return [];

  const rows = [];

  // Header row
  rows.push(columns.map(col => escapeCSVField(col)).join(','));

  // Data rows
  objects.forEach(obj => {
    const row = columns.map(col => escapeCSVField(obj[col]));
    rows.push(row.join(','));
  });

  return rows;
};

/**
 * Generate Expiration Intelligence Report CSV
 */
export const generateExpirationCSV = (data) => {
  const rows = [];
  const timestamp = new Date().toLocaleString();

  // Header
  rows.push('GateGenius - Expiration Intelligence Report');
  rows.push(`Generated: ${timestamp}`);
  rows.push('');

  // Summary Statistics
  rows.push('SUMMARY STATISTICS');
  rows.push('Metric,Value');
  rows.push(`Total Products,${data.stats.total_products}`);
  rows.push(`Critical Units (Expiring Today),${data.stats.critical_units}`);
  rows.push(`Warning Units (Expiring This Week),${data.stats.warning_units}`);
  rows.push(`Estimated Value at Risk,$${data.stats.estimated_critical_value.toFixed(2)}`);
  rows.push('');

  // Critical Items
  if (data.criticalItems && data.criticalItems.length > 0) {
    rows.push('CRITICAL ITEMS (Expiring Today)');
    rows.push(...objectsToCSVRows(data.criticalItems, [
      'Product_ID',
      'Product_Name',
      'LOT_Number',
      'Expiry_Date',
      'Quantity'
    ]));
    rows.push('');
  }

  // Warning Items
  if (data.warningItems && data.warningItems.length > 0) {
    rows.push('WARNING ITEMS (Expiring This Week)');
    rows.push(...objectsToCSVRows(data.warningItems, [
      'Product_ID',
      'Product_Name',
      'LOT_Number',
      'Expiry_Date',
      'Days_Until_Expiry',
      'Quantity'
    ]));
    rows.push('');
  }

  // All Products
  if (data.allProducts && data.allProducts.length > 0) {
    rows.push('ALL PRODUCTS');
    rows.push(...objectsToCSVRows(data.allProducts, [
      'Product_ID',
      'Product_Name',
      'LOT_Number',
      'Expiry_Date',
      'Days_Until_Expiry',
      'Quantity'
    ]));
  }

  return rows.join('\n');
};

/**
 * Generate Consumption Prediction Report CSV
 */
export const generateConsumptionCSV = (data) => {
  const rows = [];
  const timestamp = new Date().toLocaleString();

  // Header
  rows.push('GateGenius - Consumption Prediction Report');
  rows.push(`Generated: ${timestamp}`);
  rows.push('');

  // Summary Statistics
  rows.push('WASTE ANALYSIS SUMMARY');
  rows.push('Metric,Value');
  rows.push(`Total Waste Cost,$${data.stats.total_waste_cost.toFixed(2)}`);
  rows.push(`Monthly Waste Cost,$${(data.stats.total_waste_cost * 4).toFixed(2)}`);
  rows.push(`Returned Units,${data.stats.total_returned_units}`);
  rows.push(`Average Consumption Rate,${data.stats.overall_consumption_rate}%`);
  rows.push(`Flights Analyzed,${data.stats.unique_flights}`);
  rows.push('');

  // High Waste Products
  if (data.highWasteProducts && data.highWasteProducts.length > 0) {
    rows.push('HIGH WASTE PRODUCTS (Low Consumption Rate)');
    rows.push('Product Name,Consumption Rate,Total Waste,Flights Count,Recommendation');
    data.highWasteProducts.forEach(product => {
      const recommendation = `Reduce loading by ${Math.round((100 - product.avg_consumption_rate) / 2)}%`;
      rows.push([
        escapeCSVField(product.product_name),
        `${product.avg_consumption_rate}%`,
        `$${product.total_waste.toFixed(2)}`,
        product.flights_count,
        escapeCSVField(recommendation)
      ].join(','));
    });
    rows.push('');
  }

  // Stockout Risk Products
  if (data.stockoutRiskProducts && data.stockoutRiskProducts.length > 0) {
    rows.push('STOCKOUT RISK PRODUCTS');
    rows.push('Product Name,Ran Out Count,Average Consumption,Recommendation');
    data.stockoutRiskProducts.forEach(product => {
      const recommendation = `Increase loading by 15-20%`;
      rows.push([
        escapeCSVField(product.product_name),
        product.ran_out_early_count,
        `${product.avg_consumption_rate}%`,
        escapeCSVField(recommendation)
      ].join(','));
    });
  }

  return rows.join('\n');
};

/**
 * Generate Productivity Planning Report CSV
 */
export const generateProductivityCSV = (data) => {
  const rows = [];
  const timestamp = new Date().toLocaleString();

  // Header
  rows.push('GateGenius - Workforce Planning Report');
  rows.push(`Generated: ${timestamp}`);
  rows.push('');

  // Summary Statistics
  rows.push('WORKFORCE SUMMARY');
  rows.push('Metric,Value');
  rows.push(`Total Drawers,${data.summary.total_drawers}`);
  rows.push(`Total Worker-Hours,${data.summary.total_time}h`);
  rows.push(`Workers Needed (8-hour shift),${data.summary.workers_needed}`);
  rows.push(`Utilization,${data.summary.utilization}%`);
  rows.push('');

  // Peak Times
  if (data.peakTimes && data.peakTimes.length > 0) {
    rows.push('PEAK TIME ANALYSIS');
    rows.push(...objectsToCSVRows(data.peakTimes, [
      'time',
      'drawers',
      'workers_needed'
    ]));
    rows.push('');
  }

  // Complexity Breakdown
  rows.push('COMPLEXITY BREAKDOWN');
  rows.push('Complexity Level,Count');
  rows.push(`Simple (<5 min),${data.complexity.simple}`);
  rows.push(`Medium (5-8 min),${data.complexity.medium}`);
  rows.push(`Complex (>8 min),${data.complexity.complex}`);

  return rows.join('\n');
};

/**
 * Generate Smart Assignment Report CSV
 */
export const generateSmartAssignmentCSV = (data) => {
  const rows = [];
  const timestamp = new Date().toLocaleString();

  // Header
  rows.push(`GateGenius - Smart Assignment Report - Flight ${data.flightId}`);
  rows.push(`Generated: ${timestamp}`);
  rows.push('');

  // Flight Details
  rows.push('FLIGHT DETAILS');
  rows.push('Property,Value');
  rows.push(`Flight ID,${data.flight.Flight_ID}`);
  rows.push(`Origin,${data.flight.Origin}`);
  rows.push(`Flight Type,${data.flight.Flight_Type}`);
  rows.push(`Passenger Count,${data.flight.Passenger_Count}`);
  rows.push('');

  // Financial Impact
  rows.push('FINANCIAL IMPACT ANALYSIS');
  rows.push('Scope,Savings');
  rows.push(`Per Flight,$${data.summary.total_savings.toFixed(2)}`);
  rows.push(`Per Day (100 flights),$${(data.summary.total_savings * 100).toFixed(2)}`);
  rows.push(`Per Year (Single Facility),$${(data.summary.total_savings * 36500).toFixed(2)}`);
  rows.push(`Global (200 Facilities),$${(data.summary.total_savings * 7300000).toFixed(2)}`);
  rows.push('');

  // Summary Metrics
  rows.push('OPTIMIZATION SUMMARY');
  rows.push('Metric,Value');
  rows.push(`Near-Expiry Items Used,${data.summary.near_expiry_items_used}`);
  rows.push(`Assembly Time Impact,${data.summary.assembly_time_change >= 0 ? '+' : ''}${data.summary.assembly_time_change} minutes`);
  rows.push(`Status,${data.summary.status.replace('_', ' ')}`);
  rows.push('');

  // Product Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    rows.push('PRODUCT RECOMMENDATIONS');
    rows.push('Product Name,Standard Qty,Recommended Qty,Change,LOT Number,Expiry Info,Savings');
    data.recommendations.forEach(rec => {
      rows.push([
        escapeCSVField(rec.product_name),
        rec.standard_qty,
        rec.recommended_qty,
        `${rec.quantity_change >= 0 ? '+' : ''}${rec.quantity_change}`,
        escapeCSVField(rec.selected_lot || 'Standard'),
        rec.days_until_expiry ? `Expires in ${rec.days_until_expiry} days` : 'N/A',
        `$${rec.financial_impact.total.toFixed(2)}`
      ].join(','));
    });
  }

  return rows.join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
