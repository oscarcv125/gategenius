/**
 * Consumption Data Service
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { parseCSV, validateCSVData } from '../../../shared/utils/csvParser';
import { calculateConsumptionRate, calculateWasteCost } from '../utils/consumptionCalculations';

export class ConsumptionDataService {
  static async loadData() {
    try {
      const res = await fetch(`${API_BASE_URL}/consumption`);
      if (!res.ok) throw new Error(`Consumption API error: ${res.status} ${res.statusText}`);
      const rows = await res.json();

      // Normaliza a las claves esperadas por el store/UI
      return rows.map(item => ({
        Flight_ID: item.Flight_ID ?? item.flight_id ?? item.FlightId,
        Origin: item.Origin ?? item.origin,
        Date: item.Date ?? item.flight_date,
        Flight_Type: item.Flight_Type ?? item.flight_type,
        Service_Type: item.Service_Type ?? item.service_type,
        Passenger_Count: Number(item.Passenger_Count ?? item.passenger_count ?? 0),
        Product_ID: item.Product_ID ?? item.product_id,
        Product_Name: item.Product_Name ?? item.product_name,
        Standard_Specification_Qty: Number(item.Standard_Specification_Qty ?? item.standard_specification_qty ?? 0),
        Quantity_Returned: Number(item.Quantity_Returned ?? item.quantity_returned ?? 0),
        Quantity_Consumed: Number(item.Quantity_Consumed ?? item.quantity_consumed ?? 0),
        Unit_Cost: Number(item.Unit_Cost ?? item.unit_cost ?? 0),
        Crew_Feedback: item.Crew_Feedback ?? item.crew_feedback ?? ''
      }));
    } catch (err) {
      console.error('Consumption fetch failed', err);
      throw err;
    }
  }
}