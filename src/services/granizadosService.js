/**
 * Servicio del módulo Granizados (granizados, sodas, micheladas, limonadas).
 */
import {
  onSnapshot, setDoc, addDoc, deleteDoc, doc,
  serverTimestamp,
} from 'firebase/firestore'
import { granDoc, michDoc, michVentasCol, limonDoc, limonVentasCol } from '../firebase/collections'
import { PRECIO_9OZ, PRECIO_12OZ, PRECIO_CREMOSO, PRECIO_SODA } from '../utils/constants'

// ── Listeners ────────────────────────────────────────────────────────────────

export function subscribeGranizados(callback) {
  return onSnapshot(granDoc(), snap => {
    callback(snap.exists() ? snap.data() : {})
  })
}

export function subscribeMicheladas(callback) {
  return onSnapshot(michDoc(), snap => {
    callback(snap.exists() ? snap.data() : {})
  })
}

export function subscribeMicheladasVentas(callback) {
  return onSnapshot(michVentasCol(), snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

export function subscribeLimonadas(callback) {
  return onSnapshot(limonDoc(), snap => {
    callback(snap.exists() ? snap.data() : {})
  })
}

export function subscribeLimonadasVentas(callback) {
  return onSnapshot(limonVentasCol(), snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

// ── Writes — Granizados ───────────────────────────────────────────────────────

export async function saveGranizados(data) {
  return setDoc(granDoc(), data, { merge: true })
}

// ── Writes — Micheladas ───────────────────────────────────────────────────────

export async function saveMicheladasMeta(data) {
  return setDoc(michDoc(), data, { merge: true })
}

export async function addMicheladaVenta(ventaData) {
  return addDoc(michVentasCol(), { ...ventaData, createdAt: serverTimestamp() })
}

export async function deleteMicheladaVenta(docId) {
  return deleteDoc(doc(michVentasCol(), docId))
}

// ── Writes — Limonadas ────────────────────────────────────────────────────────

export async function saveLimonadasMeta(data) {
  return setDoc(limonDoc(), data, { merge: true })
}

export async function addLimonadaVenta(ventaData) {
  return addDoc(limonVentasCol(), { ...ventaData, createdAt: serverTimestamp() })
}

export async function deleteLimonadaVenta(docId) {
  return deleteDoc(doc(limonVentasCol(), docId))
}

// ── Cálculos puros ────────────────────────────────────────────────────────────

export function calcTotalsGranizados(gran = {}, michVentas = [], limonVentas = [], michMeta = {}, limonMeta = {}) {
  const {
    oz9ef = 0, oz9tr = 0, oz12ef = 0, oz12tr = 0,
    cremEf = 0, cremTr = 0,
    descuentoMonto = 0,
    sodaEf = 0, sodaTr = 0,
  } = gran

  const efBruto = oz9ef * PRECIO_9OZ + oz12ef * PRECIO_12OZ + (cremEf || 0) * PRECIO_CREMOSO
  const trBruto = oz9tr * PRECIO_9OZ + oz12tr * PRECIO_12OZ + (cremTr || 0) * PRECIO_CREMOSO
  const sodaEfVal = sodaEf * PRECIO_SODA
  const sodaTrVal = sodaTr * PRECIO_SODA
  const descuento = descuentoMonto || 0
  const neto      = (efBruto + trBruto) - descuento
  const sodaNeto  = sodaEfVal + sodaTrVal

  // Micheladas
  let michEf = 0, michTr = 0
  michVentas.forEach(v => {
    if (v.pago === 'efectivo') michEf += v.total || 0
    else                       michTr += v.total || 0
  })
  const michDescuento = michMeta.descuentoMonto || 0
  const michTotal     = michEf + michTr - michDescuento

  // Limonadas
  let limonEf = 0, limonTr = 0
  limonVentas.forEach(v => {
    if (v.pago === 'efectivo') limonEf += v.total || 0
    else                       limonTr += v.total || 0
  })
  const limonDescuento = limonMeta.descuentoMonto || 0
  const limonTotal     = limonEf + limonTr - limonDescuento

  return {
    // Granizados
    oz9ef, oz9tr, oz12ef, oz12tr, cremEf, cremTr,
    efBruto, trBruto, descuento, neto,
    // Sodas
    sodaEf, sodaTr, sodaEfVal, sodaTrVal, sodaNeto,
    // Micheladas
    michEf, michTr, michDescuento, michTotal,
    // Limonadas
    limonEf, limonTr, limonDescuento, limonTotal,
  }
}
