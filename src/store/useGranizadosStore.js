import { create } from 'zustand'
import { calcTotalsGranizados } from '../services/granizadosService'

const useGranizadosStore = create((set, get) => ({
  granData:   {},
  michData:   {},
  michVentas: [],
  limonData:  {},
  limonVentas:[],

  setGranData:    (d) => set({ granData:    d }),
  setMichData:    (d) => set({ michData:    d }),
  setMichVentas:  (v) => set({ michVentas:  v }),
  setLimonData:   (d) => set({ limonData:   d }),
  setLimonVentas: (v) => set({ limonVentas: v }),

  totals: () => {
    const { granData, michData, michVentas, limonData, limonVentas } = get()
    return calcTotalsGranizados(granData, michVentas, limonVentas, michData, limonData)
  },

  reset: () => set({ granData:{}, michData:{}, michVentas:[], limonData:{}, limonVentas:[] }),
}))

export default useGranizadosStore
