/**
 * Servicio de Facturas — toda la lógica de negocio CRUD sobre Firestore.
 * Los componentes nunca llaman a Firestore directamente; usan este servicio.
 */
import {
  collection, doc,
  addDoc, updateDoc, deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { draftCol, draftDoc } from '../firebase/collections'

// ── Listeners ────────────────────────────────────────────────────────────────

/** Escucha en tiempo real las facturas del día activo. */
export function subscribeFacturas(callback) {
  return onSnapshot(draftCol('facturas'), snap => {
    const facturas = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
    facturas.sort((a, b) => (a.num || 0) - (b.num || 0))
    callback(facturas)
  })
}

/** Escucha en tiempo real los gastos del día activo. */
export function subscribeGastos(callback) {
  return onSnapshot(draftCol('gastos'), snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

/** Escucha en tiempo real los empleados del día activo. */
export function subscribeEmpleados(callback) {
  return onSnapshot(draftCol('empleados'), snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

/** Escucha en tiempo real las compras de caja del día activo. */
export function subscribeCompras(callback) {
  return onSnapshot(draftCol('compras'), snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

/** Escucha el documento raíz del draft (baseEfectivo, locked, testMode). */
export function subscribeDraftMeta(callback) {
  return onSnapshot(draftDoc(), snap => {
    callback(snap.exists() ? snap.data() : {})
  })
}

// ── Facturas ─────────────────────────────────────────────────────────────────

export async function addFactura(facturaData, userId) {
  return addDoc(draftCol('facturas'), {
    ...facturaData,
    createdAt: serverTimestamp(),
    createdBy: userId,
  })
}

export async function deleteFactura(docId) {
  return deleteDoc(doc(draftCol('facturas'), docId))
}

// ── Gastos ───────────────────────────────────────────────────────────────────

export async function addGasto(data, userId) {
  return addDoc(draftCol('gastos'), { ...data, createdAt: serverTimestamp(), createdBy: userId })
}

export async function deleteGasto(docId) {
  return deleteDoc(doc(draftCol('gastos'), docId))
}

// ── Empleados ─────────────────────────────────────────────────────────────────

export async function addEmpleado(data, userId) {
  return addDoc(draftCol('empleados'), { ...data, createdAt: serverTimestamp(), createdBy: userId })
}

export async function deleteEmpleado(docId) {
  return deleteDoc(doc(draftCol('empleados'), docId))
}

// ── Compras de caja ───────────────────────────────────────────────────────────

export async function addCompra(data, userId) {
  return addDoc(draftCol('compras'), { ...data, createdAt: serverTimestamp(), createdBy: userId })
}

export async function deleteCompra(docId) {
  return deleteDoc(doc(draftCol('compras'), docId))
}

// ── Base de caja ──────────────────────────────────────────────────────────────

export async function setBaseEfectivo(amount) {
  return updateDoc(draftDoc(), { baseEfectivo: amount })
}

// ── Cálculos (puros, sin Firestore) ──────────────────────────────────────────

/**
 * Calcula todos los totales a partir del estado en memoria.
 */
export function calcTotals({ facturas = [], gastos = [], empleados = [], compras = [], baseEfectivo = 0 }) {
  let ef = 0, tr = 0, cnt = 0

  facturas.forEach(f => {
    cnt++
    if (!f.mixto) {
      if (f.tipo === 'efectivo') ef += f.monto || 0
      else                       tr += f.monto || 0
    } else {
      ;(f.pagos || []).forEach(p => {
        if (p.tipo === 'efectivo') ef += p.monto || 0
        else                       tr += p.monto || 0
      })
    }
  })

  const bruto    = ef + tr
  const gastosEf = gastos.reduce((s, g) => s + (g.monto || 0), 0)
  const empEf    = empleados.filter(e => e.tipo !== 'transferencia').reduce((s, e) => s + (e.pago || 0), 0)
  const comprasEf= compras.filter(c => c.tipo === 'efectivo').reduce((s, c) => s + (c.monto || 0), 0)

  const ventaDia = bruto - tr      // efectivo neto de ventas
  const neto     = ventaDia - gastosEf - empEf - comprasEf
  const caja     = baseEfectivo + neto

  return {
    ef, tr, cnt, bruto,
    gastos: gastosEf,
    empleados: empEf,
    comprasEf,
    ventaDia,
    neto,
    baseEfectivo,
    caja,
  }
}
