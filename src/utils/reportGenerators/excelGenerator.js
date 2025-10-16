/**
 * Excel Report Generator
 * Generates Excel files with multiple worksheets for different module reports
 */

import * as XLSX from 'xlsx';

/**
 * Generate Expiration Intelligence Report Excel
 */
export const generateExpirationExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  const timestamp = new Date().toLocaleString();

  // Summary Sheet
  const summaryData = [
    ['GateGenius - Expiration Intelligence Report'],
    [`Generated: ${timestamp}`],
    [''],
    ['SUMMARY STATISTICS'],
    ['Metric', 'Value'],
    ['Total Products', data.stats.total_products],
    ['Critical Units (Expiring Today)', data.stats.critical_units],
    ['Warning Units (Expiring This Week)', data.stats.warning_units],
    ['Estimated Value at Risk', `$${data.stats.estimated_critical_value.toFixed(2)}`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  summarySheet['!cols'] = [
    { wch: 35 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Critical Items Sheet
  if (data.criticalItems && data.criticalItems.length > 0) {
    const criticalSheet = XLSX.utils.json_to_sheet(
      data.criticalItems.map(item => ({
        'Product ID': item.Product_ID,
        'Product Name': item.Product_Name,
        'LOT Number': item.LOT_Number,
        'Expiry Date': item.Expiry_Date,
        'Quantity': item.Quantity
      }))
    );

    criticalSheet['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, criticalSheet, 'Critical Items');
  }

  // Warning Items Sheet
  if (data.warningItems && data.warningItems.length > 0) {
    const warningSheet = XLSX.utils.json_to_sheet(
      data.warningItems.map(item => ({
        'Product ID': item.Product_ID,
        'Product Name': item.Product_Name,
        'LOT Number': item.LOT_Number,
        'Expiry Date': item.Expiry_Date,
        'Days Until Expiry': item.Days_Until_Expiry,
        'Quantity': item.Quantity
      }))
    );

    warningSheet['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, warningSheet, 'Warning Items');
  }

  // All Products Sheet
  if (data.allProducts && data.allProducts.length > 0) {
    const productsSheet = XLSX.utils.json_to_sheet(
      data.allProducts.map(item => ({
        'Product ID': item.Product_ID,
        'Product Name': item.Product_Name,
        'LOT Number': item.LOT_Number,
        'Expiry Date': item.Expiry_Date,
        'Days Until Expiry': item.Days_Until_Expiry,
        'Quantity': item.Quantity
      }))
    );

    productsSheet['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, productsSheet, 'All Products');
  }

  return workbook;
};

/**
 * Generate Consumption Prediction Report Excel
 */
export const generateConsumptionExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  const timestamp = new Date().toLocaleString();

  // Summary Sheet
  const summaryData = [
    ['GateGenius - Consumption Prediction Report'],
    [`Generated: ${timestamp}`],
    [''],
    ['WASTE ANALYSIS SUMMARY'],
    ['Metric', 'Value'],
    ['Total Waste Cost', `$${data.stats.total_waste_cost.toFixed(2)}`],
    ['Monthly Waste Cost', `$${(data.stats.total_waste_cost * 4).toFixed(2)}`],
    ['Returned Units', data.stats.total_returned_units],
    ['Average Consumption Rate', `${data.stats.overall_consumption_rate}%`],
    ['Flights Analyzed', data.stats.unique_flights],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // High Waste Products Sheet
  if (data.highWasteProducts && data.highWasteProducts.length > 0) {
    const highWasteSheet = XLSX.utils.json_to_sheet(
      data.highWasteProducts.map(product => ({
        'Product Name': product.product_name,
        'Consumption Rate': `${product.avg_consumption_rate}%`,
        'Total Waste': `$${product.total_waste.toFixed(2)}`,
        'Flights Count': product.flights_count,
        'Recommendation': `Reduce loading by ${Math.round((100 - product.avg_consumption_rate) / 2)}%`
      }))
    );
    highWasteSheet['!cols'] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 }
    ];
    XLSX.utils.book_append_sheet(workbook, highWasteSheet, 'High Waste Products');
  }

  // Stockout Risk Products Sheet
  if (data.stockoutRiskProducts && data.stockoutRiskProducts.length > 0) {
    const stockoutSheet = XLSX.utils.json_to_sheet(
      data.stockoutRiskProducts.map(product => ({
        'Product Name': product.product_name,
        'Ran Out Count': product.ran_out_early_count,
        'Avg Consumption': `${product.avg_consumption_rate}%`,
        'Recommendation': 'Increase loading by 15-20%'
      }))
    );
    stockoutSheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, stockoutSheet, 'Stockout Risks');
  }

  return workbook;
};

/**
 * Generate Productivity Planning Report Excel
 */
export const generateProductivityExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  const timestamp = new Date().toLocaleString();

  // Summary Sheet
  const summaryData = [
    ['GateGenius - Workforce Planning Report'],
    [`Generated: ${timestamp}`],
    [''],
    ['WORKFORCE SUMMARY'],
    ['Metric', 'Value'],
    ['Total Drawers', data.summary.total_drawers],
    ['Total Worker-Hours', `${data.summary.total_time}h`],
    ['Workers Needed (8-hour shift)', data.summary.workers_needed],
    ['Utilization', `${data.summary.utilization}%`],
    [''],
    ['COMPLEXITY BREAKDOWN'],
    ['Level', 'Count'],
    ['Simple (<5 min)', data.complexity.simple],
    ['Medium (5-8 min)', data.complexity.medium],
    ['Complex (>8 min)', data.complexity.complex],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Peak Times Sheet
  if (data.peakTimes && data.peakTimes.length > 0) {
    const peakSheet = XLSX.utils.json_to_sheet(
      data.peakTimes.map(peak => ({
        'Time Slot': peak.time,
        'Drawers': peak.drawers,
        'Workers Needed': peak.workers_needed
      }))
    );
    peakSheet['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, peakSheet, 'Peak Times');
  }

  return workbook;
};

/**
 * Generate Smart Assignment Report Excel
 */
export const generateSmartAssignmentExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  const timestamp = new Date().toLocaleString();

  // Summary Sheet
  const summaryData = [
    [`GateGenius - Smart Assignment Report - Flight ${data.flightId}`],
    [`Generated: ${timestamp}`],
    [''],
    ['FLIGHT DETAILS'],
    ['Property', 'Value'],
    ['Flight ID', data.flight.Flight_ID],
    ['Origin', data.flight.Origin],
    ['Flight Type', data.flight.Flight_Type],
    ['Passenger Count', data.flight.Passenger_Count],
    [''],
    ['FINANCIAL IMPACT ANALYSIS'],
    ['Scope', 'Savings'],
    ['Per Flight', `$${data.summary.total_savings.toFixed(2)}`],
    ['Per Day (100 flights)', `$${(data.summary.total_savings * 100).toFixed(2)}`],
    ['Per Year (Single Facility)', `$${(data.summary.total_savings * 36500).toFixed(2)}`],
    ['Global (200 Facilities)', `$${(data.summary.total_savings * 7300000).toFixed(2)}`],
    [''],
    ['OPTIMIZATION SUMMARY'],
    ['Metric', 'Value'],
    ['Near-Expiry Items Used', data.summary.near_expiry_items_used],
    ['Assembly Time Impact', `${data.summary.assembly_time_change >= 0 ? '+' : ''}${data.summary.assembly_time_change} minutes`],
    ['Status', data.summary.status.replace('_', ' ')],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Recommendations Sheet
  if (data.recommendations && data.recommendations.length > 0) {
    const recsSheet = XLSX.utils.json_to_sheet(
      data.recommendations.map(rec => ({
        'Product Name': rec.product_name,
        'Standard Qty': rec.standard_qty,
        'Recommended Qty': rec.recommended_qty,
        'Change': `${rec.quantity_change >= 0 ? '+' : ''}${rec.quantity_change}`,
        'LOT Number': rec.selected_lot || 'Standard',
        'Expiry Info': rec.days_until_expiry ? `Expires in ${rec.days_until_expiry} days` : 'N/A',
        'Savings': `$${rec.financial_impact.total.toFixed(2)}`
      }))
    );
    recsSheet['!cols'] = [
      { wch: 25 },
      { wch: 13 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, recsSheet, 'Recommendations');
  }

  return workbook;
};

/**
 * Download Excel file
 */
export const downloadExcel = (workbook, filename) => {
  XLSX.writeFile(workbook, filename);
};
