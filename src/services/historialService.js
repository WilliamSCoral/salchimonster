/**
 * Servicio de Historial — guardar días, leer registros, eliminar.
 */
import {
  doc, setDoc, getDoc, getDocs, deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { histCol, draftCol, granDoc, michDoc, michVentasCol, limonDoc, limonVentasCol, draftDoc } from '../firebase/collections'
import { calcTotals } from './facturasService'
import { calcTotalsGranizados } from './granizadosService'

/** Obtiene todos los registros del historial (IDs). */
export async function fetchHistorialIds() {
  const snap = await getDocs(histCol())
  return snap.docs.map(d => d.id)
}

/** Obtiene todos los registros completos del historial. */
export async function fetchHistorial() {
  const snap = await getDocs(histCol())
  return snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
}

/** Lee un registro específico del historial. */
export async function fetchRecord(docId) {
  const snap = await getDoc(doc(histCol(), docId))
  return snap.exists() ? { _docId: snap.id, ...snap.data() } : null
}

/** Elimina un registro del historial. */
export async function deleteRecord(docId) {
  return deleteDoc(doc(histCol(), docId))
}

/**
 * Guarda el estado actual como un registro del historial.
 * Devuelve el key del documento creado.
 */
export async function saveDay({
  diaNombre, diaNum, mesNombre, year,
  state, facturas, gastos, empleados, compras,
  granData, michData, michVentas, limonData, limonVentas,
  savedBy, savedByName,
}) {
  // Construir key YYYY-MM-DD
  const MESES_NUM = {
    Enero:'01', Febrero:'02', Marzo:'03', Abril:'04',
    Mayo:'05',  Junio:'06',  Julio:'07', Agosto:'08',
    Septiembre:'09', Octubre:'10', Noviembre:'11', Diciembre:'12',
  }
  const mesNum = MESES_NUM[mesNombre] || '01'
  const diaStr = String(diaNum).padStart(2, '0')
  const key    = `${year}-${mesNum}-${diaStr}`
  const fecha  = `${diaNombre} ${diaNum} de ${mesNombre} ${year}`

  const totals     = calcTotals({ facturas, gastos, empleados, compras, baseEfectivo: state.baseEfectivo || 0 })
  const granTotals = calcTotalsGranizados(granData, michVentas, limonVentas, michData, limonData)

  const record = {
    fecha,
    savedAt:     Date.now(),
    savedBy,
    savedByName,
    totals,
    totalsGran:  {
      efBruto: granTotals.efBruto, trBruto: granTotals.trBruto,
      neto: granTotals.neto, descuento: granTotals.descuento,
      oz9ef: granTotals.oz9ef, oz9tr: granTotals.oz9tr,
      oz12ef: granTotals.oz12ef, oz12tr: granTotals.oz12tr,
      cremEf: granTotals.cremEf, cremTr: granTotals.cremTr,
      sodaEf: granTotals.sodaEf, sodaTr: granTotals.sodaTr,
      sodaEfVal: granTotals.sodaEfVal, sodaTrVal: granTotals.sodaTrVal,
      sodaNeto: granTotals.sodaNeto,
    },
    totalsMich:  { ef: granTotals.michEf, tr: granTotals.michTr, total: granTotals.michTotal },
    totalsLimon: { ef: granTotals.limonEf, tr: granTotals.limonTr, total: granTotals.limonTotal },
    state:       { facturas, gastos, empleados, compras, baseEfectivo: state.baseEfectivo || 0 },
    granizados:  granData,
    micheladas:  { ...michData, ventas: michVentas },
    limonadas:   { ...limonData, ventas: limonVentas },
  }

  await setDoc(doc(histCol(), key), record)

  // Bloquear el día en el draft
  await setDoc(draftDoc(), { locked: true, lockedAt: serverTimestamp(), lockedKey: key }, { merge: true })

  return key
}
