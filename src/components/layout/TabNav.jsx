import useAppStore from '../../store/useAppStore'

const TABS = [
  { icon: '🧾', label: 'Facturas'   },
  { icon: '💸', label: 'Gastos'     },
  { icon: '👷', label: 'Empleados'  },
  { icon: '🏦', label: 'Caja'       },
  { icon: '📈', label: 'Resumen'    },
  { icon: '📅', label: 'Historial'  },
  { icon: '👥', label: 'Usuarios'   },
  { icon: '🧊', label: 'Granizados' },
  { icon: '🍽️', label: 'Menú'       },
  { icon: '📦', label: 'Inventario' },
]

export default function TabNav() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div className="tabs">
      {TABS.map((tab, i) => (
        <div
          key={i}
          className={`tab${activeTab === i ? ' active' : ''}`}
          onClick={() => setActiveTab(i)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </div>
      ))}
    </div>
  )
}
