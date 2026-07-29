import { useEffect } from 'react'

/**
 * Modal genérico — slide-up desde abajo.
 * Props: open, onClose, title, children
 */
export default function Modal({ open, onClose, title, children }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="modal-bg open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-title">
          <span>{title}</span>
          <button className="btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
