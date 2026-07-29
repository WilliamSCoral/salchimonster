import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

/**
 * Hook de autenticación.
 * Retorna: { user, userProfile, loading, login, logout, error }
 */
export function useAuth() {
  const [user,        setUser]        = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Cargar perfil extendido desde Firestore
        try {
          const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
          setUserProfile(snap.exists() ? snap.data() : null)
        } catch {
          setUserProfile(null)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    setError('')
    try {
      // Si el input no tiene @, buscar el email real por username
      const resolvedEmail = email.includes('@')
        ? email
        : await resolveEmailFromUsername(email)
      await signInWithEmailAndPassword(auth, resolvedEmail, password)
    } catch (e) {
      setError(friendlyError(e.code))
      throw e
    }
  }

  const logout = () => signOut(auth)

  return { user, userProfile, loading, login, logout, error, setError }
}

/**
 * Busca el email de un usuario por su campo `username` en Firestore.
 */
async function resolveEmailFromUsername(username) {
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const q    = query(collection(db, 'usuarios'), where('username', '==', username.toLowerCase()))
  const snap = await getDocs(q)
  if (snap.empty) throw { code: 'auth/user-not-found' }
  return snap.docs[0].data().email
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Usuario o contraseña incorrectos.'
    case 'auth/too-many-requests':  return 'Demasiados intentos. Espera un momento.'
    case 'auth/network-request-failed': return 'Sin conexión a internet.'
    default: return 'Error al iniciar sesión. Intenta de nuevo.'
  }
}
