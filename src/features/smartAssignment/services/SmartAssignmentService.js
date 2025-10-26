const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class SmartAssignmentService {
  // 1) Trae consumo desde tu backend
  static async getConsumption() {
    const res = await fetch(`${API_BASE_URL}/consumption`);
    if (!res.ok) throw new Error(`Consumption API error: ${res.status} ${res.statusText}`);
    return res.json();
  }

  // Utils
  static toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  static dateStr(r) {
    const d = (r.Date ?? r.flight_date ?? '').toString();
    return d.includes('T') ? d.split('T')[0] : d;
  }

  static groupByFlight(rows) {
    const m = new Map();
    rows.forEach(r => {
      const k = r.Flight_ID ?? r.flight_id;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(r);
    });
    return m;
  }

  static groupByDate(rows) {
    const m = new Map();
    rows.forEach(r => {
      const d = this.dateStr(r);
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(r);
    });
    return m;
  }

  // 2) Ahorro real por vuelo (usa tu predictor si ya lo tienes; aquí una heurística estable)
  static computeFlightSavings(rows) {
    let savings = 0;
    let unitsPrevented = 0;
    let criticalItems = 0;

    rows.forEach(r => {
      const std = this.toNum(r.Standard_Specification_Qty ?? r.standard_specification_qty);
      const cons = this.toNum(r.Quantity_Consumed ?? r.quantity_consumed);
      const ret  = this.toNum(r.Quantity_Returned ?? r.quantity_returned);
      const cost = this.toNum(r.Unit_Cost ?? r.unit_cost);

      // Reducir 70% del exceso como recomendación
      const suggested = Math.max(0, Math.round(cons + (std - cons) * 0.3));
      const delta = std - suggested;

      if (delta > 0) {
        unitsPrevented += delta;
        savings += delta * cost;
        if (ret > std * 0.5) criticalItems += 1;
      }
    });

    // 0.2 min por unidad no cargada
    const timeImpactMin = Math.round(unitsPrevented * 0.2 * 10) / 10;

    return {
      savingsPerFlight: Math.round(savings * 100) / 100,
      unitsPrevented,
      timeImpactMin,
      criticalItems
    };
  }

  // 3) Ahorro por día con vuelos reales de la DB
  static dailySavings(rows) {
    const byDate = this.groupByDate(rows);
    const out = [];
    byDate.forEach((list, date) => {
      const byFlight = this.groupByFlight(list);
      let day = 0;
      byFlight.forEach(fr => { day += this.computeFlightSavings(fr).savingsPerFlight; });
      out.push({ date, daySavings: Math.round(day * 100) / 100, flights: byFlight.size });
    });
    return out;
  }

  // 4) Proyección anual del facility basada en promedio observado
  static facilityYearProjection(rows) {
    const daily = this.dailySavings(rows);
    if (daily.length === 0) return 0;
    const avg = daily.reduce((s, d) => s + d.daySavings, 0) / daily.length;
    return Math.round(avg * 365);
  }
}
