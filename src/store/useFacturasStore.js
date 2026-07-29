/**
 * Store de Facturas, Gastos, Empleados y Compras.
 * Los datos llegan vía onSnapshot (suscripciones en tiempo real).
 */
import { create } from 'zustand'
import { calcTotals } from '../services/facturasService'

const useFacturasStore = create((set, get) => ({
  facturas:  [],
  gastos:    [],
  empleados: [],
  compras:   [],
  baseEfectivo: 0,

  setFacturas:     (facturas)     => set({ facturas }),
  setGastos:       (gastos)       => set({ gastos }),
  setEmpleados:    (empleados)    => set({ empleados }),
  setCompras:      (compras)      => set({ compras }),
  setBaseEfectivo: (baseEfectivo) => set({ baseEfectivo }),

  /** Calcula todos los totales del día actual. */
  totals: () => {
    const { facturas, gastos, empleados, compras, baseEfectivo } = get()
    return calcTotals({ facturas, gastos, empleados, compras, baseEfectivo })
  },

  /** Número siguiente de factura (máximo + 1). */
  nextFacturaNum: () => {
    const { facturas } = get()
    if (!facturas.length) return 1
    return Math.max(...facturas.map(f => f.num || 0)) + 1
  },

  /** Resetea todos los datos (al cerrar sesión o nuevo día). */
  reset: () => set({ facturas: [], gastos: [], empleados: [], compras: [], baseEfectivo: 0 }),
}))

export default useFacturasStore
