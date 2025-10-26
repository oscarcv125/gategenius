const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ExpiryDataService {
  static async loadData() {
    const res = await fetch(`${API_BASE_URL}/expiration`);
    if (!res.ok) throw new Error(`Expiration API error: ${res.status} ${res.statusText}`);
    const rows = await res.json();

    return rows.map(r => {
      const dateStr = String(r.Expiry_Date ?? r.expiry_date ?? '');
      const onlyDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const expiry = new Date(onlyDate);
      const todayMs = Date.now();
      const diffDays = Math.ceil((expiry.getTime() - todayMs) / 86400000);

      return {
        Product_ID: r.Product_ID ?? r.product_id,
        Product_Name: r.Product_Name ?? r.product_name,
        Weight_or_Volume: r.Weight_or_Volume ?? r.weight_or_volume,
        LOT_Number: r.LOT_Number ?? r.lot_number,
        Expiry_Date: onlyDate,
        Days_Left: Number.isFinite(diffDays) ? diffDays : null,
        Quantity: Number(r.Quantity ?? r.quantity ?? 0)
      };
    });
  }
}
