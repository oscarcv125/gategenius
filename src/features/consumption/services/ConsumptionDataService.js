/**
 * Consumption Data Service
 */
import Papa from 'papaparse';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
import { parseCSV, validateCSVData } from '../../../shared/utils/csvParser';
import { calculateConsumptionRate, calculateWasteCost } from '../utils/consumptionCalculations';

export class ConsumptionDataService {
  static async loadData() {
    try {
      const res = await fetch(`${API_BASE_URL}/consumption`);
      if (!res.ok) throw new Error(`Consumption API error: ${res.status} ${res.statusText}`);
      const rows = await res.json();

      return rows.map(item => {
    const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const rawDate = item.Date ?? item.flight_date ?? '';
  const dateOnly = typeof rawDate === 'string' && rawDate.includes('T')
    ? rawDate.split('T')[0]
    : rawDate;

  return {
    Flight_ID: item.Flight_ID ?? item.flight_id,
    Origin: item.Origin ?? item.origin,
    Date: dateOnly, // <- fecha limpia sin T...Z
    Flight_Type: item.Flight_Type ?? item.flight_type,
    Service_Type: item.Service_Type ?? item.service_type,
    Passenger_Count: toNum(item.Passenger_Count ?? item.passenger_count),
    Product_ID: item.Product_ID ?? item.product_id,
    Product_Name: item.Product_Name ?? item.product_name,
    Standard_Specification_Qty: toNum(item.Standard_Specification_Qty ?? item.standard_specification_qty),
    Quantity_Returned: toNum(item.Quantity_Returned ?? item.quantity_returned),
    Quantity_Consumed: toNum(item.Quantity_Consumed ?? item.quantity_consumed),
    Unit_Cost: toNum(item.Unit_Cost ?? item.unit_cost),
    Crew_Feedback: item.Crew_Feedback ?? item.crew_feedback ?? ''
  };
});

    } catch (err) {
      console.warn('API not available, falling back to CSV:', err.message);
      return await this.loadFromCSV();
    }
  }

  static async loadFromCSV() {
    const response = await fetch('/data/consumption.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const rows = results.data.map(item => {
            const toNum = (v) => {
              const n = Number(v);
              return Number.isFinite(n) ? n : 0;
            };

            return {
              Flight_ID: item.Flight_ID,
              Origin: item.Origin,
              Date: item.Date,
              Flight_Type: item.Flight_Type,
              Service_Type: item.Service_Type,
              Passenger_Count: toNum(item.Passenger_Count),
              Product_ID: item.Product_ID,
              Product_Name: item.Product_Name,
              Standard_Specification_Qty: toNum(item.Standard_Specification_Qty),
              Quantity_Returned: toNum(item.Quantity_Returned),
              Quantity_Consumed: toNum(item.Quantity_Consumed),
              Unit_Cost: toNum(item.Unit_Cost),
              Crew_Feedback: item.Crew_Feedback || ''
            };
          });
          console.log('✅ Loaded consumption.csv:', rows.length, 'records');
          resolve(rows);
        },
        error: (error) => {
          console.error('❌ Error parsing consumption.csv:', error);
          reject(error);
        }
      });
    });
  }
}