import { useState } from 'react'
import Card, { EmptyMsg } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import useFacturasStore from '../store/useFacturasStore'
import useAppStore from '../store/useAppStore'
import { addFactura, deleteFactura } from '../services/facturasService'
import { fmt, formatMoneyInput, parseMoney } from '../utils/format'

export default function FacturasView() {
  const { facturas, nextFacturaNum } = useFacturasStore()
  const { user, userProfile, dayLocked } = useAppStore()
  const isAdmin = userProfile?.rol === 'admin'

  const [desc,  setDesc]  = useState('')
  const [monto, setMonto] = useState('')
  const [tipo,  setTipo]  = useState('efectivo')
  const [saving, setSaving] = useState(false)
  const [err,   setErr]   = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    const montoNum = parseMoney(monto)
    if (!montoNum) { setErr('Ingresa un monto válido.'); return }
    setSaving(true); setErr('')
    try {
      await addFactura({
        num:   nextFacturaNum(),
        desc:  desc.trim() || '',
        monto: montoNum,
        tipo,
        mixto: false,
      }, user.uid)
      setDesc(''); setMonto('')
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (docId) => {
    if (!isAdmin) return
    if (!confirm('¿Eliminar esta factura?')) return
    await deleteFactura(docId)
  }

  return (
    <div className="page active">
      {dayLocked && (
        <div className="locked-banner show">🔒 Día guardado — no se puede modificar</div>
      )}

      {/* Formulario */}
      {!dayLocked && (
        <Card title="🧾 Nueva factura">
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="fg" style={{ maxWidth: 70 }}>
                <label>N°</label>
                <input value={nextFacturaNum()} readOnly style={{ textAlign:'center', fontWeight:700 }} />
              </div>
              <div className="fg">
                <label>Descripción</label>
                <input
                  type="text" placeholder="Opcional"
                  value={desc} onChange={e => setDesc(e.target.value)}
                />
              </div>
              <div className="fg" style={{ maxWidth: 130 }}>
                <label>Monto</label>
                <input
                  type="text" inputMode="numeric" placeholder="0"
                  value={monto}
                  onChange={e => setMonto(formatMoneyInput(e.target.value))}
                />
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
            <button type="submit" className="btn-blue mt8" style={{ width:'100%', padding:11 }} disabled={saving}>
              {saving ? 'Guardando...' : '+ Agregar factura'}
            </button>
          </form>
        </Card>
      )}

      {/* Lista de facturas */}
      <Card title={`🧾 Facturas del día (${facturas.length})`}>
        {!facturas.length ? (
          <EmptyMsg>Sin facturas aún. Agrega la primera →</EmptyMsg>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Descripción</th><th>Monto</th><th>Tipo</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f._docId}>
                  <td style={{ fontWeight:700 }}>{f.num}</td>
                  <td>{f.desc || '—'}</td>
                  <td style={{ fontWeight:700 }}>{fmt(f.monto || 0)}</td>
                  <td>
                    <span className={`badge badge-${f.tipo === 'efectivo' ? 'ef' : 'tr'}`}>
                      {f.tipo === 'efectivo' ? 'Ef' : 'Tr'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(f._docId)}>✕</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
