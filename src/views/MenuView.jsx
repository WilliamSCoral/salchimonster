import { useState, useEffect } from 'react'
import Card, { EmptyMsg } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { subscribeMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuService'
import { fmt, formatMoneyInput, parseMoney } from '../utils/format'

export default function MenuView() {
  const [menu,    setMenu]    = useState([])
  const [modal,   setModal]   = useState(false)
  const [editId,  setEditId]  = useState('')
  const [codigo,  setCodigo]  = useState('')
  const [nombre,  setNombre]  = useState('')
  const [precio,  setPrecio]  = useState('')
  const [err,     setErr]     = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    const unsub = subscribeMenu(setMenu)
    return unsub
  }, [])

  const openModal = (item = null) => {
    setEditId(item?._docId || '')
    setCodigo(item?.codigo || '')
    setNombre(item?.nombre || '')
    setPrecio(item ? formatMoneyInput(String(item.precio)) : '')
    setErr('')
    setModal(true)
  }

  const save = async () => {
    if (!codigo.trim()) { setErr('El código es obligatorio.'); return }
    if (!nombre.trim()) { setErr('El nombre es obligatorio.'); return }
    const precioNum = parseMoney(precio)
    if (!precioNum)     { setErr('Ingresa un precio válido.'); return }
    const dup = menu.find(p => p.codigo.toLowerCase() === codigo.trim().toLowerCase() && p._docId !== editId)
    if (dup) { setErr('Ese código ya existe: ' + dup.nombre); return }
    setSaving(true); setErr('')
    try {
      const data = { codigo: codigo.trim().toUpperCase(), nombre: nombre.trim(), precio: precioNum }
      if (editId) await updateMenuItem(editId, data)
      else         await addMenuItem(data)
      setModal(false)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page active">
      <Card title="🍽️ Platos del menú" action={<button className="btn-sm btn-blue" onClick={() => openModal()}>+ Nuevo plato</button>}>
        {!menu.length ? <EmptyMsg>Sin platos registrados. Agrega el primero →</EmptyMsg> : (
          <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Precio</th><th></th></tr></thead>
            <tbody>
              {menu.map(p => (
                <tr key={p._docId}>
                  <td><span className="badge" style={{ background:'#ebf4ff', color:'#2b6cb0' }}>{p.codigo}</span></td>
                  <td style={{ fontWeight:600 }}>{p.nombre}</td>
                  <td style={{ fontWeight:700 }}>{fmt(p.precio)}</td>
                  <td style={{ display:'flex', gap:4 }}>
                    <button className="btn-sm btn-ghost" onClick={() => openModal(p)}>✏️</button>
                    <button className="btn-sm btn-danger" onClick={() => { if(confirm('¿Eliminar?')) deleteMenuItem(p._docId) }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? '✏️ Editar plato' : '🍽️ Nuevo plato'}>
        <div className="form-row">
          <div className="fg" style={{ maxWidth:110 }}>
            <label>Código único</label>
            <input type="text" placeholder="P01" autoCapitalize="characters" style={{ textTransform:'uppercase' }}
              value={codigo} onChange={e => setCodigo(e.target.value)} />
          </div>
          <div className="fg">
            <label>Nombre del plato</label>
            <input type="text" placeholder="Ej: Salchipapa especial" autoCapitalize="words"
              value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
        </div>
        <div className="fg" style={{ marginTop:8 }}>
          <label>Precio</label>
          <input type="text" inputMode="numeric" placeholder="0"
            value={precio} onChange={e => setPrecio(formatMoneyInput(e.target.value))} />
        </div>
        {err && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:8 }}>{err}</div>}
        <button className="btn-blue mt8" style={{ width:'100%', padding:12 }} onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : (editId ? 'Guardar cambios' : 'Guardar plato')}
        </button>
      </Modal>
    </div>
  )
}
