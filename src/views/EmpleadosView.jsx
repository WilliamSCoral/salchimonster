import { useState } from 'react'
import Card, { EmptyMsg } from '../components/ui/Card'
import useFacturasStore from '../store/useFacturasStore'
import useAppStore from '../store/useAppStore'
import { addEmpleado, deleteEmpleado } from '../services/facturasService'
import { fmt, formatMoneyInput, parseMoney } from '../utils/format'

export default function EmpleadosView() {
  const { empleados } = useFacturasStore()
  const { user, userProfile, dayLocked } = useAppStore()
  const isAdmin = userProfile?.rol === 'admin'

  const [nombre, setNombre] = useState('')
  const [pago,   setPago]   = useState('')
  const [tipo,   setTipo]   = useState('efectivo')
  const [err, setErr]       = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    const pagoNum = parseMoney(pago)
    if (!nombre.trim()) { setErr('Ingresa el nombre del empleado.'); return }
    if (!pagoNum)       { setErr('Ingresa un pago válido.'); return }
    setSaving(true); setErr('')
    try {
      await addEmpleado({ nombre: nombre.trim(), pago: pagoNum, tipo }, user.uid)
      setNombre(''); setPago('')
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const total = empleados.reduce((s, e) => s + (e.pago || 0), 0)

  return (
    <div className="page active">
      {dayLocked && <div className="locked-banner show">🔒 Día guardado — no se puede modificar</div>}

      {!dayLocked && (
        <Card title="👷 Registrar pago de empleado">
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="fg">
                <label>Nombre</label>
                <input type="text" placeholder="Nombre del empleado" autoCapitalize="words" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              <div className="fg" style={{ maxWidth: 130 }}>
                <label>Pago</label>
                <input type="text" inputMode="numeric" placeholder="0" value={pago} onChange={e => setPago(formatMoneyInput(e.target.value))} />
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
            <button type="submit" className="btn-purple mt8" style={{ width:'100%', padding:11 }} disabled={saving}>
              {saving ? 'Guardando...' : '+ Agregar empleado'}
            </button>
          </form>
        </Card>
      )}

      <Card title="👷 Empleados del día">
        {!empleados.length ? <EmptyMsg>Sin empleados registrados.</EmptyMsg> : (
          <table>
            <thead><tr><th>Nombre</th><th>Pago</th><th>Tipo</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {empleados.map(e => (
                <tr key={e._docId}>
                  <td style={{ fontWeight:600 }}>{e.nombre}</td>
                  <td style={{ fontWeight:700 }}>{fmt(e.pago)}</td>
                  <td><span className={`badge badge-${e.tipo === 'efectivo' ? 'ef' : 'tr'}`}>{e.tipo === 'efectivo' ? 'Ef' : 'Tr'}</span></td>
                  {isAdmin && <td><button className="btn-sm btn-danger" onClick={() => { if(confirm('¿Eliminar?')) deleteEmpleado(e._docId) }}>✕</button></td>}
                </tr>
              ))}
              <tr className="total-row"><td>TOTAL</td><td>{fmt(total)}</td><td></td>{isAdmin && <td></td>}</tr>
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
