/**
 * Servicio de Inventario — categorías, productos, ingresos de stock.
 */
import {
  onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp,
} from 'firebase/firestore'
import { invCategoriasCol, invItemsCol } from '../firebase/collections'

// ── Listeners ────────────────────────────────────────────────────────────────

export function subscribeCategorias(callback) {
  return onSnapshot(invCategoriasCol(), snap => {
    const cats = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
    cats.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    callback(cats)
  })
}

export function subscribeInvItems(callback) {
  return onSnapshot(invItemsCol(), snap => {
    const items = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
    items.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    callback(items)
  })
}

// ── Categorías ────────────────────────────────────────────────────────────────

export async function addCategoria({ nombre, color }) {
  return addDoc(invCategoriasCol(), { nombre, color, creadoAt: serverTimestamp() })
}

export async function updateCategoria(docId, { nombre, color }) {
  return updateDoc(doc(invCategoriasCol(), docId), { nombre, color })
}

export async function deleteCategoria(docId) {
  return deleteDoc(doc(invCategoriasCol(), docId))
}

// ── Productos ─────────────────────────────────────────────────────────────────

export async function addInvItem({ nombre, categoria, unidad, stock, stockMin }) {
  return addDoc(invItemsCol(), { nombre, categoria, unidad, stock, stockMin, creadoAt: serverTimestamp() })
}

export async function updateInvItem(docId, data) {
  return updateDoc(doc(invItemsCol(), docId), data)
}

export async function deleteInvItem(docId) {
  return deleteDoc(doc(invItemsCol(), docId))
}

// ── Ingreso de stock ──────────────────────────────────────────────────────────

export async function registrarIngreso(docId, cantidadActual, cantidadIngreso) {
  const nuevoStock = (cantidadActual || 0) + (cantidadIngreso || 0)
  return updateDoc(doc(invItemsCol(), docId), { stock: nuevoStock })
}

// ── Lógica pura ───────────────────────────────────────────────────────────────

/** Devuelve los items cuyo stock está en o por debajo del mínimo. */
export function getItemsBajoStock(items = []) {
  return items.filter(i => (i.stockMin || 0) > 0 && (i.stock || 0) <= (i.stockMin || 0))
}
