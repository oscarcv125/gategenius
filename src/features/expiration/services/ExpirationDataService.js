const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ExpirationDataService {
  static async loadData() {
    try {
      const res = await fetch(`${API_BASE_URL}/expiration`);
      if (!res.ok) throw new Error(`Expiration API error: ${res.status} ${res.statusText}`);
      
      const rows = await res.json();
      
      return rows.map(r => {
        const dateStr = String(r.Expiry_Date ?? r.expiry_date ?? '');
        const onlyDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const expiry = new Date(onlyDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          Product_ID: r.Product_ID ?? r.product_id,
          Product_Name: r.Product_Name ?? r.product_name,
          Weight_or_Volume: r.Weight_or_Volume ?? r.weight_or_volume,
          LOT_Number: r.LOT_Number ?? r.lot_number,
          Expiry_Date: onlyDate,
          Days_Left: daysLeft,
          Days_Until_Expiry: daysLeft,
          Quantity: Number(r.Quantity ?? r.quantity ?? 0)
        };
      });
    } catch (error) {
      console.error('Failed to load expiry data:', error);
      throw error;
    }
  }

  static async deleteProduct(lotNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/expiration/${lotNumber}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }
}
