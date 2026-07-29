import { useState, useEffect } from 'react'
import Card, { EmptyMsg } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import useInventarioStore from '../store/useInventarioStore'
import {
  addCategoria, updateCategoria, deleteCategoria as deleteCat,
  addInvItem, updateInvItem, deleteInvItem as deleteItem,
  registrarIngreso,
} from '../services/inventarioService'
import { fmt } from '../utils/format'

const COLORES = ['#e53e3e','#dd6b20','#d69e2e','#38a169','#3182ce','#805ad5','#d53f8c','#4a5568']

export default function InventarioView() {
  const { categorias, items, bajoStock, alertShown, setAlertShown } = useInventarioStore()
  const [filtroCat, setFiltroCat] = useState('')

  // ── Modales ──
  const [modalCat,   setModalCat]   = useState(false)
  const [modalItem,  setModalItem]  = useState(false)
  const [modalIng,   setModalIng]   = useState(false)
  const [modalAlert, setModalAlert] = useState(false)

  // ── Formulario categoría ──
  const [catDocId, setCatDocId] = useState('')
  const [catNombre, setCatNombre] = useState('')
  const [catColor,  setCatColor]  = useState('#38a169')
  const [catErr,    setCatErr]    = useState('')

  // ── Formulario producto ──
  const [invDocId,    setInvDocId]    = useState('')
  const [invNombre,   setInvNombre]   = useState('')
  const [invCat,      setInvCat]      = useState('')
  const [invUnidad,   setInvUnidad]   = useState('und')
  const [invStock,    setInvStock]    = useState('')
  const [invStockMin, setInvStockMin] = useState('')
  const [invErr,      setInvErr]      = useState('')
  const [invSaving,   setInvSaving]   = useState(false)

  // ── Ingreso ──
  const [ingDocId, setIngDocId] = useState('')
  const [ingItem,  setIngItem]  = useState(null)
  const [ingCant,  setIngCant]  = useState('')
  const [ingErr,   setIngErr]   = useState('')

  // Pop-up automático una vez por sesión
  useEffect(() => {
    const bajos = bajoStock()
    if (bajos.length && !alertShown) {
      setAlertShown(true)
      const t = setTimeout(() => setModalAlert(true), 1200)
      return () => clearTimeout(t)
    }
  }, [items])

  // ── Handlers categoría ──
  const openCat = (cat = null) => {
    setCatDocId(cat?._docId || '')
    setCatNombre(cat?.nombre || '')
    setCatColor(cat?.color || '#38a169')
    setCatErr('')
    setModalCat(true)
  }

  const saveCat = async () => {
    if (!catNombre.trim()) { setCatErr('El nombre es obligatorio.'); return }
    const dup = categorias.find(c => c.nombre.toLowerCase() === catNombre.trim().toLowerCase() && c._docId !== catDocId)
    if (dup) { setCatErr('Ya existe una categoría con ese nombre.'); return }
    try {
      if (catDocId) await updateCategoria(catDocId, { nombre: catNombre.trim(), color: catColor })
      else           await addCategoria({ nombre: catNombre.trim(), color: catColor })
      setModalCat(false)
    } catch (e) { setCatErr(e.message) }
  }

  const removeCat = async (cat) => {
    const count = items.filter(i => i.categoria === cat._docId).length
    const msg = count > 0
      ? `¿Eliminar "${cat.nombre}"?\n${count} producto(s) quedarán sin categoría.`
      : `¿Eliminar la categoría "${cat.nombre}"?`
    if (!confirm(msg)) return
    await deleteCat(cat._docId)
  }

  // ── Handlers producto ──
  const openItem = (item = null) => {
    setInvDocId(item?._docId || '')
    setInvNombre(item?.nombre || '')
    setInvCat(item?.categoria || '')
    setInvUnidad(item?.unidad || 'und')
    setInvStock(item?.stock != null ? String(item.stock) : '')
    setInvStockMin(item?.stockMin != null ? String(item.stockMin) : '')
    setInvErr('')
    setModalItem(true)
  }

  const saveItem = async () => {
    if (!invNombre.trim()) { setInvErr('El nombre es obligatorio.'); return }
    setInvSaving(true); setInvErr('')
    const data = {
      nombre: invNombre.trim(), categoria: invCat, unidad: invUnidad,
      stock: parseFloat(invStock) || 0, stockMin: parseFloat(invStockMin) || 0,
    }
    try {
      if (invDocId) await updateInvItem(invDocId, data)
      else           await addInvItem(data)
      setModalItem(false)
    } catch (e) { setInvErr(e.message) }
    finally { setInvSaving(false) }
  }

  const removeItem = async (item) => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    await deleteItem(item._docId)
  }

  // ── Handlers ingreso ──
  const openIngreso = (item) => {
    setIngDocId(item._docId); setIngItem(item)
    setIngCant(''); setIngErr('')
    setModalIng(true)
  }

  const confirmarIngreso = async () => {
    const cant = parseFloat(ingCant) || 0
    if (cant <= 0) { setIngErr('Ingresa una cantidad mayor a 0.'); return }
    await registrarIngreso(ingDocId, ingItem.stock, cant)
    setModalIng(false)
  }

  // ── Render ──
  const itemsFiltrados = filtroCat ? items.filter(i => i.categoria === filtroCat) : items
  const bajos = bajoStock()

  return (
    <div className="page active">

      {/* Banner stock bajo */}
      {bajos.length > 0 && (
        <div style={{ background:'#fff5f5', border:'1.5px solid #feb2b2', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#c53030' }}>⚠️ Stock bajo</div>
              <div style={{ fontSize:'0.78rem', color:'#9b2c2c', marginTop:2 }}>
                {bajos.length} producto{bajos.length > 1 ? 's' : ''} por debajo del stock mínimo
              </div>
            </div>
            <button onClick={() => setModalAlert(true)} className="btn-sm" style={{ background:'#c53030', color:'#fff' }}>Ver</button>
          </div>
        </div>
      )}

      {/* Categorías */}
      <Card title="🏷️ Categorías" action={<button className="btn-sm btn-blue" onClick={() => openCat()}>+ Nueva</button>}>
        {!categorias.length ? (
          <EmptyMsg>Sin categorías. Crea la primera →</EmptyMsg>
        ) : (
          categorias.map(cat => (
            <div key={cat._docId} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, background:'var(--light)', border:'1px solid var(--border)', marginBottom:6 }}>
              <span style={{ width:14, height:14, borderRadius:'50%', background:cat.color || '#4a5568', flexShrink:0 }} />
              <span style={{ flex:1, fontWeight:600, fontSize:'0.88rem' }}>{cat.nombre}</span>
              <span style={{ fontSize:'0.72rem', color:'var(--gray)' }}>{items.filter(i => i.categoria === cat._docId).length} productos</span>
              <button className="btn-sm btn-ghost" onClick={() => openCat(cat)}>✏️</button>
              <button className="btn-sm btn-danger" onClick={() => removeCat(cat)}>🗑</button>
            </div>
          ))
        )}
      </Card>

      {/* Productos */}
      <Card title="📦 Productos en inventario" action={<button className="btn-sm btn-green" onClick={() => openItem()}>+ Agregar</button>}>
        <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} style={{ marginBottom:10, fontSize:'0.82rem', padding:'7px 10px', width:'100%' }}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c._docId} value={c._docId}>{c.nombre}</option>)}
        </select>

        {!itemsFiltrados.length ? (
          <EmptyMsg>Sin productos{filtroCat ? ' en esta categoría' : ''}. Agrega el primero →</EmptyMsg>
        ) : (
          itemsFiltrados.map(item => {
            const cat   = categorias.find(c => c._docId === item.categoria)
            const bajo  = (item.stock || 0) <= (item.stockMin || 0) && (item.stockMin || 0) > 0
            return (
              <div key={item._docId} style={{ border:`1.5px solid ${bajo ? '#feb2b2' : 'var(--border)'}`, borderRadius:10, background: bajo ? '#fffafa' : '#fff', padding:'10px 12px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:3 }}>{item.nombre}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {cat && <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 7px', borderRadius:10, background:`${cat.color}22`, color:cat.color }}>{cat.nombre}</span>}
                      {bajo && <span style={{ fontSize:'0.68rem', fontWeight:800, padding:'2px 8px', borderRadius:10, background:'#fff5f5', color:'#c53030' }}>⚠️ STOCK BAJO</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'1.1rem', fontWeight:800, color: bajo ? '#c53030' : '#276749' }}>{item.stock || 0} <span style={{ fontSize:'0.72rem' }}>{item.unidad || 'und'}</span></div>
                    <div style={{ fontSize:'0.7rem', color:'var(--gray)' }}>Mín: {item.stockMin || 0} {item.unidad || 'und'}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, marginTop:8 }}>
                  <button className="btn-sm btn-green" style={{ flex:1 }} onClick={() => openIngreso(item)}>📥 Ingreso</button>
                  <button className="btn-sm btn-ghost" onClick={() => openItem(item)}>✏️</button>
                  <button className="btn-sm btn-danger" onClick={() => removeItem(item)}>🗑</button>
                </div>
              </div>
            )
          })
        )}
      </Card>

      {/* ── Modal: Categoría ── */}
      <Modal open={modalCat} onClose={() => setModalCat(false)} title={catDocId ? '✏️ Editar categoría' : '🏷️ Nueva categoría'}>
        <div className="fg">
          <label>Nombre de la categoría</label>
          <input type="text" placeholder="Ej: Carnes, Bebidas..." autoCapitalize="words" value={catNombre} onChange={e => setCatNombre(e.target.value)} />
        </div>
        <div style={{ marginTop:10 }}>
          <label style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Color</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
            {COLORES.map(c => (
              <span key={c} onClick={() => setCatColor(c)} style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: c === catColor ? '3px solid #2d3748' : '2px solid transparent' }} />
            ))}
          </div>
        </div>
        {catErr && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:8 }}>{catErr}</div>}
        <button className="btn-blue mt8" style={{ width:'100%', padding:12 }} onClick={saveCat}>Guardar categoría</button>
      </Modal>

      {/* ── Modal: Producto ── */}
      <Modal open={modalItem} onClose={() => setModalItem(false)} title={invDocId ? '✏️ Editar producto' : '📦 Nuevo producto'}>
        <div className="fg">
          <label>Nombre del producto</label>
          <input type="text" placeholder="Ej: Pechuga de pollo" autoCapitalize="words" value={invNombre} onChange={e => setInvNombre(e.target.value)} />
        </div>
        <div className="form-row" style={{ marginTop:8 }}>
          <div className="fg">
            <label>Categoría</label>
            <select value={invCat} onChange={e => setInvCat(e.target.value)}>
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c._docId} value={c._docId}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="fg" style={{ maxWidth:130 }}>
            <label>Unidad</label>
            <select value={invUnidad} onChange={e => setInvUnidad(e.target.value)}>
              <option value="und">Unidades</option>
              <option value="kg">Kilogramos</option>
              <option value="g">Gramos</option>
              <option value="L">Litros</option>
              <option value="ml">Mililitros</option>
              <option value="porciones">Porciones</option>
              <option value="bolsas">Bolsas</option>
              <option value="cajas">Cajas</option>
            </select>
          </div>
        </div>
        <div className="form-row" style={{ marginTop:8 }}>
          <div className="fg">
            <label>Stock actual</label>
            <input type="number" inputMode="decimal" placeholder="0" min="0" step="0.1" value={invStock} onChange={e => setInvStock(e.target.value)} />
          </div>
          <div className="fg">
            <label>Stock mínimo</label>
            <input type="number" inputMode="decimal" placeholder="0" min="0" step="0.1" value={invStockMin} onChange={e => setInvStockMin(e.target.value)} />
          </div>
        </div>
        {invErr && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:8 }}>{invErr}</div>}
        <button className="btn-blue mt8" style={{ width:'100%', padding:12 }} onClick={saveItem} disabled={invSaving}>
          {invSaving ? 'Guardando...' : (invDocId ? 'Guardar cambios' : 'Guardar producto')}
        </button>
      </Modal>

      {/* ── Modal: Ingreso ── */}
      <Modal open={modalIng} onClose={() => setModalIng(false)} title="📥 Ingreso de stock">
        {ingItem && (
          <div style={{ background:'var(--light)', borderRadius:10, padding:'10px 12px', marginBottom:12, fontSize:'0.85rem' }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>{ingItem.nombre}</div>
            <div style={{ color:'var(--gray)', fontSize:'0.78rem' }}>
              Stock actual: <strong>{ingItem.stock || 0} {ingItem.unidad || 'und'}</strong> · Mín: <strong>{ingItem.stockMin || 0}</strong>
            </div>
          </div>
        )}
        <div className="fg">
          <label>Cantidad que ingresa</label>
          <input type="number" inputMode="decimal" placeholder="0" min="0" step="0.1" value={ingCant} onChange={e => setIngCant(e.target.value)} />
        </div>
        {ingItem && ingCant && parseFloat(ingCant) > 0 && (
          <div style={{ marginTop:6, fontSize:'0.83rem', color:'var(--gray)', textAlign:'center' }}>
            Nuevo stock: {ingItem.stock || 0} + {ingCant} = {((ingItem.stock || 0) + parseFloat(ingCant)).toFixed(2)} {ingItem.unidad || 'und'}
          </div>
        )}
        {ingErr && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:4 }}>{ingErr}</div>}
        <button className="btn-green mt8" style={{ width:'100%', padding:12 }} onClick={confirmarIngreso}>✅ Confirmar ingreso</button>
      </Modal>

      {/* ── Modal: Alerta stock bajo ── */}
      <Modal open={modalAlert} onClose={() => setModalAlert(false)} title="⚠️ Productos con stock bajo">
        <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:'60vh', overflowY:'auto' }}>
          {bajos.length === 0 ? (
            <EmptyMsg>✅ Todo el inventario está bien surtido.</EmptyMsg>
          ) : bajos.map(item => {
            const cat = categorias.find(c => c._docId === item.categoria)
            return (
              <div key={item._docId} style={{ background:'#fff5f5', border:'1.5px solid #feb2b2', borderRadius:10, padding:'10px 12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{item.nombre}</div>
                    {cat && <div style={{ fontSize:'0.72rem', color:cat.color, fontWeight:600, marginTop:2 }}>{cat.nombre}</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#c53030' }}>{item.stock || 0}</div>
                    <div style={{ fontSize:'0.68rem', color:'#9b2c2c' }}>{item.unidad || 'und'} · Mín: {item.stockMin}</div>
                  </div>
                </div>
                <button className="btn-sm btn-green" style={{ width:'100%', marginTop:8, padding:7 }}
                  onClick={() => { setModalAlert(false); openIngreso(item) }}>
                  📥 Retanquear ahora
                </button>
              </div>
            )
          })}
        </div>
        <button className="btn-ghost mt8" style={{ width:'100%', padding:11 }} onClick={() => setModalAlert(false)}>Cerrar</button>
      </Modal>
    </div>
  )
}
