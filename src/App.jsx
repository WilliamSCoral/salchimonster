import { useEffect, lazy, Suspense } from 'react'
import { onAuthStateChanged }        from 'firebase/auth'
import { doc, getDoc }               from 'firebase/firestore'
import { auth, db }                  from './firebase/config'
import useAppStore                   from './store/useAppStore'
import useFacturasStore              from './store/useFacturasStore'
import useGranizadosStore            from './store/useGranizadosStore'
import useInventarioStore            from './store/useInventarioStore'
import {
  subscribeFacturas, subscribeGastos, subscribeEmpleados,
  subscribeCompras,  subscribeDraftMeta,
} from './services/facturasService'
import {
  subscribeGranizados, subscribeMicheladas, subscribeMicheladasVentas,
  subscribeLimonadas,  subscribeLimonadasVentas,
} from './services/granizadosService'
import { subscribeCategorias, subscribeInvItems } from './services/inventarioService'
import TopBar  from './components/layout/TopBar'
import TabNav  from './components/layout/TabNav'
import LoginView from './views/LoginView'

// ── Lazy views ────────────────────────────────────────────────────────────────
const FacturasView   = lazy(() => import('./views/FacturasView'))
const GastosView     = lazy(() => import('./views/GastosView'))
const EmpleadosView  = lazy(() => import('./views/EmpleadosView'))
const CajaView       = lazy(() => import('./views/CajaView'))
const ResumenView    = lazy(() => import('./views/ResumenView'))
const HistorialView  = lazy(() => import('./views/HistorialView'))
const UsuariosView   = lazy(() => import('./views/UsuariosView'))
const GranizadosView = lazy(() => import('./views/GranizadosView'))
const MenuView       = lazy(() => import('./views/MenuView'))
const InventarioView = lazy(() => import('./views/InventarioView'))

const VIEWS = [
  FacturasView, GastosView, EmpleadosView, CajaView, ResumenView,
  HistorialView, UsuariosView, GranizadosView, MenuView, InventarioView,
]

export default function App() {
  const { user, setUser, setUserProfile, activeTab } = useAppStore()
  const { setFacturas, setGastos, setEmpleados, setCompras, setBaseEfectivo, reset: resetF } = useFacturasStore()
  const { setGranData, setMichData, setMichVentas, setLimonData, setLimonVentas, reset: resetG } = useGranizadosStore()
  const { setCategorias, setItems, reset: resetInv } = useInventarioStore()
  const { setDayLocked } = useAppStore()

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubs = []

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpiar suscripciones anteriores
      unsubs.forEach(u => u()); unsubs.length = 0

      if (!firebaseUser) {
        setUser(null); setUserProfile(null)
        resetF(); resetG(); resetInv()
        return
      }

      setUser(firebaseUser)

      // Cargar perfil del usuario
      try {
        const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        setUserProfile(snap.exists() ? snap.data() : null)
      } catch { setUserProfile(null) }

      // ── Suscripciones Firestore ──────────────────────────────────────────
      unsubs.push(subscribeFacturas(setFacturas))
      unsubs.push(subscribeGastos(setGastos))
      unsubs.push(subscribeEmpleados(setEmpleados))
      unsubs.push(subscribeCompras(setCompras))
      unsubs.push(subscribeDraftMeta(meta => {
        setBaseEfectivo(meta.baseEfectivo || 0)
        setDayLocked(meta.locked || false, meta.lockedKey || null)
      }))

      unsubs.push(subscribeGranizados(setGranData))
      unsubs.push(subscribeMicheladas(setMichData))
      unsubs.push(subscribeMicheladasVentas(setMichVentas))
      unsubs.push(subscribeLimonadas(setLimonData))
      unsubs.push(subscribeLimonadasVentas(setLimonVentas))

      unsubs.push(subscribeCategorias(setCategorias))
      unsubs.push(subscribeInvItems(setItems))
    })

    return () => {
      unsubAuth()
      unsubs.forEach(u => u())
    }
  }, [])

  if (!user) return <LoginView />

  const ActiveView = VIEWS[activeTab] || FacturasView

  return (
    <div id="app-wrapper">
      <TopBar />
      <TabNav />
      <Suspense fallback={<div style={{ padding:20, textAlign:'center', color:'var(--gray)' }}>Cargando...</div>}>
        <ActiveView />
      </Suspense>
    </div>
  )
}
