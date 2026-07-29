import useAppStore from '../../store/useAppStore'

export default function TopBar({ onSave }) {
  const { user, userProfile, testMode, toggleTestMode } = useAppStore()
  const today = new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>📋 Control de Facturas</h1>
        <div className="date-label">{today}</div>
      </div>
      <div className="topbar-right">
        {testMode && (
          <span style={{ fontSize:'0.65rem', background:'#f6ad55', color:'#7b341e', padding:'2px 6px', borderRadius:'8px', fontWeight:700 }}>
            🧪 PRUEBA
          </span>
        )}
        <span className="user-badge">{userProfile?.nombre || user?.email}</span>
        {onSave && (
          <button className="btn-sm btn-ghost" onClick={onSave} style={{ fontSize:'0.75rem' }}>
            💾 Guardar
          </button>
        )}
      </div>
    </div>
  )
}
