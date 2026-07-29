/**
 * Helpers de colecciones Firestore.
 * DRAFT()  → colección del día activo (o "test" en modo prueba)
 * HIST()   → colección del historial guardado
 */
import { collection, doc } from 'firebase/firestore'
import { db } from './config'

let testMode = false

export const setTestMode = (val) => { testMode = val }
export const getTestMode = ()     => testMode

/** Referencia al documento del borrador activo */
export const draftDoc = () =>
  doc(db, testMode ? 'draft_test' : 'draft', 'current')

/** Subcolección dentro del borrador (facturas, gastos, empleados, compras, comandas) */
export const draftCol = (name) =>
  collection(draftDoc(), name)

/** Referencia al documento de granizados */
export const granDoc = () =>
  doc(db, testMode ? 'draft_test' : 'draft', 'granizados')

/** Referencia al documento de micheladas */
export const michDoc = () =>
  doc(db, testMode ? 'draft_test' : 'draft', 'micheladas')

/** Subcolección de ventas de micheladas */
export const michVentasCol = () =>
  collection(michDoc(), 'ventas')

/** Referencia al documento de limonadas */
export const limonDoc = () =>
  doc(db, testMode ? 'draft_test' : 'draft', 'limonadas')

/** Subcolección de ventas de limonadas */
export const limonVentasCol = () =>
  collection(limonDoc(), 'ventas')

/** Colección del historial (registros guardados) */
export const histCol = () =>
  collection(db, testMode ? 'historial_test' : 'historial')

/** Colección global de menú (no depende del día) */
export const menuCol = () => collection(db, 'menu')

/** Colección global de usuarios */
export const usuariosCol = () => collection(db, 'usuarios')

/** Colecciones globales de inventario */
export const invCategoriasCol = () => collection(db, 'inv_categorias')
export const invItemsCol       = () => collection(db, 'inv_items')

/** Timestamp server */
export { serverTimestamp as TS } from 'firebase/firestore'
