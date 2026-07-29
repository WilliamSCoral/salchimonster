import { useState } from 'react'
import Card, { EmptyMsg } from '../components/ui/Card'
import useFacturasStore from '../store/useFacturasStore'
import useAppStore from '../store/useAppStore'
import { addGasto, deleteGasto } from '../services/facturasService'
import { fmt, formatMoneyInput, parseMoney } from '../utils/format'

export default function GastosView() {
  const { gastos } = useFacturasStore()
  const { user, userProfile, dayLocked } = useAppStore()
  const isAdmin = userProfile?.rol === 'admin'

  const [desc, setDesc]   = useState('')
  const [monto, setMonto] = useState('')
  const [err, setErr]     = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    const montoNum = parseMoney(monto)
    if (!desc.trim()) { setErr('Ingresa una descripción.'); return }
    if (!montoNum)    { setErr('Ingresa un monto válido.'); return }
    setSaving(true); setErr('')
    try {
      await addGasto({ desc: desc.trim(), monto: montoNum }, user.uid)
      setDesc(''); setMonto('')
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const total = gastos.reduce((s, g) => s + (g.monto || 0), 0)

  return (
    <div className="page active">
      {dayLocked && <div className="locked-banner show">🔒 Día guardado — no se puede modificar</div>}

      {!dayLocked && (
        <Card title="💸 Nuevo gasto">
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="fg">
                <label>Concepto</label>
                <input type="text" placeholder="Ej: Empaque, gas, etc." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="fg" style={{ maxWidth: 140 }}>
                <label>Monto</label>
                <input type="text" inputMode="numeric" placeholder="0" value={monto} onChange={e => setMonto(formatMoneyInput(e.target.value))} />
              </div>
            </div>
            {err && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:4 }}>{err}</div>}
            <button type="submit" className="btn-orange mt8" style={{ width:'100%', padding:11 }} disabled={saving}>
              {saving ? 'Guardando...' : '+ Agregar gasto'}
            </button>
          </form>
        </Card>
      )}

      <Card title={`💸 Gastos del día`}>
        {!gastos.length ? <EmptyMsg>Sin gastos registrados.</EmptyMsg> : (
          <>
            <table>
              <thead><tr><th>Concepto</th><th>Monto</th>{isAdmin && <th></th>}</tr></thead>
              <tbody>
                {gastos.map(g => (
                  <tr key={g._docId}>
                    <td>{g.desc}</td>
                    <td style={{ fontWeight:700 }}>{fmt(g.monto)}</td>
                    {isAdmin && <td><button className="btn-sm btn-danger" onClick={() => { if(confirm('¿Eliminar?')) deleteGasto(g._docId) }}>✕</button></td>}
                  </tr>
                ))}
                <tr className="total-row"><td>TOTAL</td><td>{fmt(total)}</td>{isAdmin && <td></td>}</tr>
              </tbody>
            </table>
          </>
        )}
      </Card>
    </div>
  )
}
