/**
 * Productivity Data Service
 * Handles all data loading and parsing for productivity module
 */
import Papa from 'papaparse';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ProductivityDataService {
  static async loadData() {
    try {
      const res = await fetch(`${API_BASE_URL}/productivity`);
      if (!res.ok) throw new Error(`Productivity API error: ${res.status} ${res.statusText}`);

      const rows = await res.json();

      return rows.map(r => {
        // Obtener los números de forma segura
        const totalItems = Number(r.Total_Items ?? r.total_items ?? 0);
        const uniqueTypes = Number(r.Unique_Item_Types ?? r.unique_item_types ?? 0);

        // ESTO ES LO QUE FALTABA: calcular tiempo estimado por cajón
        // Fórmula: 0.5 minutos base + 0.2 min por item + 0.3 min por tipo único
        const estimatedTimeMinutes = 0.5 + (totalItems * 0.2) + (uniqueTypes * 0.3);

        return {
          Drawer_ID: r.Drawer_ID ?? r.drawer_id,
          Flight_Type: r.Flight_Type ?? r.flight_type,
          Drawer_Category: r.Drawer_Category ?? r.drawer_category,
          Total_Items: totalItems,
          Unique_Item_Types: uniqueTypes,
          Item_List: r.Item_List ?? r.item_list ?? '',
          // CAMPO CLAVE: tiempo estimado en minutos por cajón
          Estimated_Time: Math.round(estimatedTimeMinutes * 10) / 10
        };
      });
    } catch (error) {
      console.warn('API not available, falling back to CSV:', error.message);
      return await this.loadFromCSV();
    }
  }

  static async loadFromCSV() {
    const response = await fetch('/data/productivity.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const rows = results.data.map(r => {
            const totalItems = Number(r.Total_Items || 0);
            const uniqueTypes = Number(r.Unique_Item_Types || 0);
            const estimatedTimeMinutes = 0.5 + (totalItems * 0.2) + (uniqueTypes * 0.3);

            return {
              Drawer_ID: r.Drawer_ID,
              Flight_Type: r.Flight_Type,
              Drawer_Category: r.Drawer_Category,
              Total_Items: totalItems,
              Unique_Item_Types: uniqueTypes,
              Item_List: r.Item_List || '',
              Estimated_Time: Math.round(estimatedTimeMinutes * 10) / 10
            };
          });
          console.log('✅ Loaded productivity.csv:', rows.length, 'records');
          resolve(rows);
        },
        error: (error) => {
          console.error('❌ Error parsing productivity.csv:', error);
          reject(error);
        }
      });
    });
  }
}
