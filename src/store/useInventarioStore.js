import { create } from 'zustand'
import { getItemsBajoStock } from '../services/inventarioService'

const useInventarioStore = create((set, get) => ({
  categorias:    [],
  items:         [],
  alertShown:    false,

  setCategorias: (categorias) => set({ categorias }),
  setItems:      (items)      => set({ items }),
  setAlertShown: (v)          => set({ alertShown: v }),

  bajoStock: () => getItemsBajoStock(get().items),
  reset: () => set({ categorias: [], items: [], alertShown: false }),
}))

export default useInventarioStore
