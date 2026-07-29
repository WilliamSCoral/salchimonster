/**
 * Card genérica.
 * Props: title, action (elemento JSX), children, style
 */
export default function Card({ title, action, children, style }) {
  return (
    <div className="card" style={style}>
      {title && (
        <div className="card-title">
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function StatBox({ label, value, color }) {
  return (
    <div className="stat-box">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color || ''}`}>{value}</div>
    </div>
  )
}

export function EmptyMsg({ children }) {
  return <div className="empty-msg">{children || 'Sin datos'}</div>
}
