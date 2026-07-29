import { useState } from 'react'
import Card, { EmptyMsg, StatBox } from '../components/ui/Card'
import useFacturasStore from '../store/useFacturasStore'
import useAppStore from '../store/useAppStore'
import { addCompra, deleteCompra, setBaseEfectivo } from '../services/facturasService'
import { fmt, formatMoneyInput, parseMoney } from '../utils/format'

export default function CajaView() {
  const { compras, baseEfectivo, totals } = useFacturasStore()
  const { user, userProfile, dayLocked } = useAppStore()
  const isAdmin = userProfile?.rol === 'admin'
  const t = totals()

  const [base, setBase]   = useState('')
  const [desc, setDesc]   = useState('')
  const [monto, setMonto] = useState('')
  const [tipo, setTipo]   = useState('efectivo')
  const [err, setErr]     = useState('')
  const [saving, setSaving] = useState(false)

  const handleSetBase = async () => {
    const val = parseMoney(base)
    if (!val && val !== 0) return
    await setBaseEfectivo(val)
    setBase('')
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const montoNum = parseMoney(monto)
    if (!desc.trim()) { setErr('Ingresa una descripción.'); return }
    if (!montoNum)    { setErr('Ingresa un monto válido.'); return }
    setSaving(true); setErr('')
    try {
      await addCompra({ desc: desc.trim(), monto: montoNum, tipo }, user.uid)
      setDesc(''); setMonto('')
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page active">
      {dayLocked && <div className="locked-banner show">🔒 Día guardado — no se puede modificar</div>}

      {/* Estado de caja */}
      <div className="caja-saldo">
        <div className="saldo-label">💰 Total disponible en caja</div>
        <div className="saldo-value">{fmt(t.caja)}</div>
        <div className="saldo-sub">Base: {fmt(baseEfectivo)} + Neto: {fmt(t.neto)}</div>
      </div>

      {/* Base de caja */}
      {!dayLocked && (
        <Card title="🏦 Base de caja">
          <div style={{ fontSize:'0.82rem', color:'var(--gray)', marginBottom:8 }}>
            Base actual: <strong>{fmt(baseEfectivo)}</strong>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>Nueva base</label>
              <input type="text" inputMode="numeric" placeholder="0" value={base} onChange={e => setBase(formatMoneyInput(e.target.value))} />
            </div>
            <button className="btn-blue" onClick={handleSetBase}>Actualizar</button>
          </div>
        </Card>
      )}

      {/* Compras */}
      {!dayLocked && (
        <Card title="🛒 Nueva compra de caja">
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="fg">
                <label>Concepto</label>
                <input type="text" placeholder="Ej: Insumos, bolsas..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="fg" style={{ maxWidth: 130 }}>
                <label>Valor</label>
                <input type="text" inputMode="numeric" placeholder="0" value={monto} onChange={e => setMonto(formatMoneyInput(e.target.value))} />
              </div>
              <div className="fg" style={{ maxWidth: 145 }}>
                <label>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                </select>
              </div>
            </div>
            {err && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:4 }}>{err}</div>}
            <button type="submit" className="btn-orange mt8" style={{ width:'100%', padding:11 }} disabled={saving}>
              {saving ? 'Guardando...' : '+ Agregar compra'}
            </button>
          </form>
        </Card>
      )}

      <Card title="🛒 Compras registradas">
        {!compras.length ? <EmptyMsg>Sin compras registradas.</EmptyMsg> : (
          <table>
            <thead><tr><th>Concepto</th><th>Valor</th><th>Tipo</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {compras.map(c => (
                <tr key={c._docId}>
                  <td>{c.desc}</td>
                  <td style={{ fontWeight:700 }}>{fmt(c.monto)}</td>
                  <td><span className={`badge badge-${c.tipo === 'efectivo' ? 'ef' : 'tr'}`}>{c.tipo === 'efectivo' ? 'Ef' : 'Tr'}</span></td>
                  {isAdmin && <td><button className="btn-sm btn-danger" onClick={() => { if(confirm('¿Eliminar?')) deleteCompra(c._docId) }}>✕</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
