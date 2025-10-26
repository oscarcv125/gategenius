/**
 * Productivity Data Service
 * Handles all data loading and parsing for productivity module
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ProductivityDataService {
  static async loadData() {
    try {
      const res = await fetch(`${API_BASE_URL}/productivity`);
      if (!res.ok) throw new Error(`Productivity API error: ${res.status} ${res.statusText}`);
      
      const rows = await res.json();
      
      return rows.map(r => ({
        Drawer_ID: r.Drawer_ID ?? r.drawer_id,
        Flight_Type: r.Flight_Type ?? r.flight_type,
        Drawer_Category: r.Drawer_Category ?? r.drawer_category,
        Total_Items: Number(r.Total_Items ?? r.total_items ?? 0),
        Unique_Item_Types: Number(r.Unique_Item_Types ?? r.unique_item_types ?? 0),
        Item_List: r.Item_List ?? r.item_list ?? ''
      }));
    } catch (error) {
      console.error('Failed to load productivity data:', error);
      throw error;
    }
  }
}
