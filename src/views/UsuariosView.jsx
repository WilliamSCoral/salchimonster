import { useState, useEffect } from 'react'
import Card, { EmptyMsg } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { subscribeUsuarios, createUser, deleteUserProfile } from '../services/usuariosService'
import useAppStore from '../store/useAppStore'

export default function UsuariosView() {
  const { userProfile } = useAppStore()
  const isAdmin = userProfile?.rol === 'admin'
  const [users,  setUsers]  = useState([])
  const [modal,  setModal]  = useState(false)
  const [nombre, setNombre] = useState('')
  const [username,setUsername] = useState('')
  const [email,  setEmail]  = useState('')
  const [pass,   setPass]   = useState('')
  const [rol,    setRol]    = useState('mesero')
  const [codigo, setCodigo] = useState('')
  const [err,    setErr]    = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = subscribeUsuarios(setUsers)
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!nombre || !username || !email || !pass) { setErr('Todos los campos marcados son obligatorios.'); return }
    setSaving(true); setErr('')
    try {
      await createUser({ nombre, username, email, password: pass, rol, codigoDescuento: codigo })
      setModal(false)
      setNombre(''); setUsername(''); setEmail(''); setPass(''); setCodigo('')
    } catch (e) { setErr(e.message || 'Error al crear usuario.') }
    finally { setSaving(false) }
  }

  if (!isAdmin) return (
    <div className="page active">
      <div style={{ textAlign:'center', padding:40, color:'var(--gray)' }}>🔒 Solo administradores pueden ver esta sección.</div>
    </div>
  )

  return (
    <div className="page active">
      <Card title="👥 Usuarios del sistema" action={<button className="btn-sm btn-blue" onClick={() => setModal(true)}>+ Nuevo</button>}>
        {!users.length ? <EmptyMsg>Sin usuarios registrados.</EmptyMsg> : (
          users.map(u => (
            <div key={u._docId} className="user-item">
              <div className="user-item-info">
                <div className="user-item-name">{u.nombre}</div>
                <div className="user-item-sub">{u.username} · {u.email}</div>
              </div>
              <span className={`role-badge role-${u.rol}`}>{u.rol}</span>
              {isAdmin && u._docId !== userProfile?._uid && (
                <button className="btn-sm btn-danger" style={{ marginLeft:8 }}
                  onClick={() => { if(confirm('¿Eliminar usuario?')) deleteUserProfile(u._docId) }}>🗑</button>
              )}
            </div>
          ))
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="👤 Nuevo usuario">
        <div className="fg"><label>Nombre completo *</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} /></div>
        <div className="fg" style={{ marginTop:8 }}><label>Username *</label><input type="text" autoCapitalize="none" value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div className="fg" style={{ marginTop:8 }}><label>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="fg" style={{ marginTop:8 }}><label>Contraseña *</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} /></div>
        <div className="fg" style={{ marginTop:8 }}>
          <label>Rol</label>
          <select value={rol} onChange={e => setRol(e.target.value)}>
            <option value="mesero">Mesero</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="fg" style={{ marginTop:8 }}><label>Código de descuento (opcional)</label><input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
        {err && <div style={{ color:'var(--red)', fontSize:'0.82rem', marginTop:8 }}>{err}</div>}
        <button className="btn-blue mt8" style={{ width:'100%', padding:12 }} onClick={handleCreate} disabled={saving}>
          {saving ? 'Creando...' : 'Crear usuario'}
        </button>
      </Modal>
    </div>
  )
}
