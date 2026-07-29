/**
 * Store global de la aplicación.
 * Maneja: autenticación, pestaña activa, modo prueba, bloqueo del día.
 */
import { create } from 'zustand'
import { setTestMode } from '../firebase/collections'

const useAppStore = create((set, get) => ({
  // Auth
  user:        null,
  userProfile: null,
  setUser:        (user)        => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),

  // Navegación
  activeTab: 0,
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Modo prueba
  testMode: false,
  toggleTestMode: () => {
    const next = !get().testMode
    setTestMode(next)
    set({ testMode: next })
  },

  // Bloqueo del día
  dayLocked:  false,
  lockedKey:  null,
  setDayLocked: (locked, key = null) => set({ dayLocked: locked, lockedKey: key }),

  // Base de caja
  baseEfectivo: 0,
  setBaseEfectivo: (val) => set({ baseEfectivo: val }),
}))

export default useAppStore
