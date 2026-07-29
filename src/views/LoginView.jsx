import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginView() {
  const { login, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await login(username.trim(), password) }
    catch { /* error ya está en useAuth */ }
    finally { setLoading(false) }
  }

  return (
    <div id="login-overlay">
      <div className="login-box">
        <div className="login-logo">🧾</div>
        <div className="login-title">Control de Facturas</div>
        <div className="login-sub">Salchimonster</div>

        <form onSubmit={handleLogin}>
          <div className="fg">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="tu usuario"
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="fg" style={{ marginTop: 10 }}>
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn-blue"
            style={{ width: '100%', marginTop: 16, padding: 13, fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: 8, textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
