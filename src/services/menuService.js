import {
  onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { menuCol } from '../firebase/collections'

export function subscribeMenu(callback) {
  const q = query(menuCol(), orderBy('nombre'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ _docId: d.id, ...d.data() })))
  })
}

export async function addMenuItem({ codigo, nombre, precio }) {
  return addDoc(menuCol(), { codigo, nombre, precio, creadoAt: serverTimestamp() })
}

export async function updateMenuItem(docId, { codigo, nombre, precio }) {
  return updateDoc(doc(menuCol(), docId), { codigo, nombre, precio })
}

export async function deleteMenuItem(docId) {
  return deleteDoc(doc(menuCol(), docId))
}
