import {
  onSnapshot, doc, setDoc, updateDoc, deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { usuariosCol } from '../firebase/collections'
import { auth } from '../firebase/config'
import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

export function subscribeUsuarios(callback) {
  return onSnapshot(usuariosCol(), snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

/**
 * Crea un nuevo usuario en Firebase Auth + perfil en Firestore.
 * Usa una instancia secundaria de Auth para no cerrar sesión al admin.
 */
export async function createUser({ nombre, username, email, password, rol, codigoDescuento }) {
  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  }

  let secondaryApp
  try {
    secondaryApp = getApp('secondary')
  } catch {
    secondaryApp = initializeApp(firebaseConfig, 'secondary')
  }

  const secondaryAuth = getAuth(secondaryApp)
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)

  await setDoc(doc(usuariosCol(), cred.user.uid), {
    nombre, username: username.toLowerCase(), email, rol,
    codigoDescuento: codigoDescuento || '',
    creadoAt: serverTimestamp(),
    creadoPor: auth.currentUser?.uid || '',
  })

  await secondaryAuth.signOut()
  return cred.user.uid
}

export async function updateUserProfile(uid, data) {
  return updateDoc(doc(usuariosCol(), uid), data)
}

export async function deleteUserProfile(uid) {
  return deleteDoc(doc(usuariosCol(), uid))
}
