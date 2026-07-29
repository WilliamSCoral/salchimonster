import * as XLSX from 'xlsx'
import { fmt } from './format'

/**
 * Genera y descarga un archivo Excel con el resumen del día.
 *
 * @param {object} state      - Estado actual (facturas, gastos, empleados, compras)
 * @param {object} totals     - Totales calculados de facturas
 * @param {string} fecha      - Nombre legible de la fecha
 * @param {object} stateGran  - Estado del módulo granizados
 * @param {object} totalsGran - Totales calculados de granizados
 * @param {object} stateMich  - Estado del módulo micheladas
 * @param {object} totalsMich - Totales calculados de micheladas
 * @param {object} stateLimon - Estado del módulo limonadas
 * @param {object} totalsLimon- Totales calculados de limonadas
 */
export function exportToExcel(
  state, totals, fecha,
  stateGran, totalsGran,
  stateMich, totalsMich,
  stateLimon, totalsLimon,
) {
  const data = buildExcelData(
    state, totals, fecha,
    stateGran, totalsGran,
    stateMich, totalsMich,
    stateLimon, totalsLimon,
  )
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Resumen')
  XLSX.writeFile(wb, `Salchimonster_${fecha.replace(/ /g, '_')}.xlsx`)
}

function buildExcelData(
  state, t, fecha,
  sg, tg,
  sm, tm,
  sl, tl,
) {
  const data = []

  data.push(['SALCHIMONSTER — RESUMEN DEL DÍA'])
  data.push(['Fecha:', fecha])
  data.push([])

  // ── Facturas ──────────────────────────────────────────────────────────────
  data.push(['FACTURAS'])
  data.push([])
  data.push(['N°', 'Descripción', 'Monto', 'Tipo'])

  ;(state.facturas || []).forEach(f => {
    if (!f.mixto) {
      data.push([f.num, f.desc || '—', f.monto || 0, f.tipo === 'efectivo' ? 'Efectivo' : 'Transferencia'])
    } else {
      const pagos = f.pagos || []
      const efT   = pagos.filter(p => p.tipo === 'efectivo').reduce((s, p) => s + (p.monto || 0), 0)
      const trs   = pagos.filter(p => p.tipo === 'transferencia')
      if (efT > 0) data.push([f.num, f.desc || '—', efT, 'Efectivo'])
      trs.forEach((p, i) => data.push([`${f.num}-${i + 1}`, f.desc || '—', p.monto || 0, 'Transferencia']))
    }
  })

  data.push(['', '', 'TOTAL EFECTIVO',       t.ef])
  data.push(['', '', 'TOTAL TRANSFERENCIAS', t.tr])
  data.push(['', '', 'TOTAL BRUTO',          t.bruto])
  data.push([])

  // ── Gastos ────────────────────────────────────────────────────────────────
  data.push(['GASTOS'])
  data.push(['Concepto', 'Monto'])
  ;(state.gastos || []).forEach(g => data.push([g.desc, g.monto]))
  data.push(['TOTAL GASTOS', t.gastos])
  data.push([])

  // ── Empleados ─────────────────────────────────────────────────────────────
  data.push(['EMPLEADOS'])
  data.push(['Nombre', 'Pago', 'Tipo'])
  ;(state.empleados || []).forEach(e =>
    data.push([e.nombre, e.pago, e.tipo === 'transferencia' ? 'Transferencia' : 'Efectivo'])
  )
  data.push(['TOTAL EMPLEADOS', t.empleados])
  data.push([])

  // ── Compras de caja ───────────────────────────────────────────────────────
  data.push(['COMPRAS DE CAJA'])
  data.push(['Ítem', 'Valor', 'Tipo'])
  ;(state.compras || []).forEach(c =>
    data.push([c.desc, c.monto, c.tipo === 'efectivo' ? 'Efectivo' : 'Transferencia'])
  )
  data.push([])

  // ── Resumen financiero facturas ───────────────────────────────────────────
  data.push(['RESUMEN FINANCIERO'])
  data.push(['Venta del día (facturas)',   t.ventaDia || t.bruto])
  data.push(['Neto del día',               t.neto])
  data.push(['Base de caja',               state.baseEfectivo || 0])
  data.push(['Total disponible en caja',   t.caja])
  data.push([])

  // ── Granizados ────────────────────────────────────────────────────────────
  if (sg && tg) {
    data.push(['GRANIZADOS'])
    data.push([])
    data.push(['Producto', 'Efectivo', 'Transferencia', 'Total und.', 'Total $'])
    data.push(['9 oz',    tg.oz9ef  || 0, tg.oz9tr  || 0, (tg.oz9ef  || 0) + (tg.oz9tr  || 0), ((tg.oz9ef  || 0) + (tg.oz9tr  || 0)) * 10000])
    data.push(['12 oz',   tg.oz12ef || 0, tg.oz12tr || 0, (tg.oz12ef || 0) + (tg.oz12tr || 0), ((tg.oz12ef || 0) + (tg.oz12tr || 0)) * 12000])
    data.push(['Cremosos',tg.cremEf || 0, tg.cremTr || 0, (tg.cremEf || 0) + (tg.cremTr || 0), ((tg.cremEf || 0) + (tg.cremTr || 0)) * 13000])
    data.push(['SODAS',   tg.sodaEf || 0, tg.sodaTr || 0, '', (tg.sodaEfVal || 0) + (tg.sodaTrVal || 0)])
    data.push(['TOTAL EFECTIVO GRANIZADOS',       tg.efBruto])
    data.push(['TOTAL TRANSFERENCIAS GRANIZADOS', tg.trBruto])
    data.push(['DESCUENTO GRANIZADOS',            tg.descuento || 0])
    data.push(['TOTAL NETO GRANIZADOS',           tg.neto])
    data.push([])
  }

  // ── Micheladas ────────────────────────────────────────────────────────────
  if (sm && tm && (sm.ventas || []).length) {
    data.push(['MICHELADAS'])
    data.push(['Tipo', 'Cantidad', 'Precio Unit.', 'Total', 'Pago'])
    ;(sm.ventas || []).forEach(v =>
      data.push([v.tipoVenta || 'Individual', v.cantidad, v.precioUnitario, v.total, v.pago === 'efectivo' ? 'Efectivo' : 'Transferencia'])
    )
    data.push(['TOTAL EFECTIVO MICHELADAS',       tm.ef])
    data.push(['TOTAL TRANSFERENCIAS MICHELADAS', tm.tr])
    data.push(['TOTAL MICHELADAS',                tm.total])
    data.push([])
  }

  // ── Limonadas ─────────────────────────────────────────────────────────────
  if (sl && tl && (sl.ventas || []).length) {
    data.push(['LIMONADAS'])
    data.push(['Tipo', 'Cantidad', 'Precio Unit.', 'Total', 'Pago'])
    ;(sl.ventas || []).forEach(v =>
      data.push([v.tipoVenta || 'Individual', v.cantidad, v.precioUnitario, v.total, v.pago === 'efectivo' ? 'Efectivo' : 'Transferencia'])
    )
    data.push(['TOTAL EFECTIVO LIMONADAS',       tl.ef])
    data.push(['TOTAL TRANSFERENCIAS LIMONADAS', tl.tr])
    data.push(['TOTAL LIMONADAS',                tl.total])
  }

  return data
}
