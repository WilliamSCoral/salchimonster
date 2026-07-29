import { useState, useEffect, useCallback } from 'react'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { fetchHistorial, fetchRecord, deleteRecord } from '../services/historialService'
import { fmt } from '../utils/format'
import { MESES } from '../utils/constants'

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

export default function HistorialView() {
  const [records,    setRecords]    = useState({}) // id → true
  const [legacy,     setLegacy]     = useState([]) // registros formato antiguo
  const [calYear,    setCalYear]    = useState(new Date().getFullYear())
  const [calMonth,   setCalMonth]   = useState(new Date().getMonth())
  const [loading,    setLoading]    = useState(true)

  const [selected,   setSelected]   = useState(null) // record completo
  const [modalOpen,  setModalOpen]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await fetchHistorial()
      const dateMap = {}, legacyArr = []
      all.forEach(r => {
        if (DATE_KEY_RE.test(r._docId)) dateMap[r._docId] = true
        else legacyArr.push(r)
      })
      legacyArr.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
      setRecords(dateMap)
      setLegacy(legacyArr)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openRecord = async (docId) => {
    const r = await fetchRecord(docId)
    if (r) { setSelected(r); setModalOpen(true) }
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm('¿Eliminar este registro del historial? Esta acción no se puede deshacer.')) return
    await deleteRecord(selected._docId)
    setModalOpen(false); setSelected(null); load()
  }

  // ── Calendar render ─────────────────────────────────────────────────────
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const today        = new Date()
  const firstDay     = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate()
  const startOffset  = firstDay === 0 ? 6 : firstDay - 1
  const isCurrentMon = today.getFullYear() === calYear && today.getMonth() === calMonth

  return (
    <div className="page active">

      {/* Calendario */}
      <Card title="📅 Registros guardados">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <button onClick={prevMonth} style={{ background:'#f7fafc', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'1rem', fontWeight:700 }}>←</button>
          <span style={{ fontWeight:800, fontSize:'1rem' }}>{MESES[calMonth]} {calYear}</span>
          <button onClick={nextMonth} style={{ background:'#f7fafc', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'1rem', fontWeight:700 }}>→</button>
        </div>

        {loading ? <div className="empty-msg">Cargando...</div> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:'0.68rem', fontWeight:700, color:'var(--gray)', padding:'6px 0' }}>{d}</div>
            ))}
            {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const mesNum = String(calMonth + 1).padStart(2, '0')
              const diaStr = String(d).padStart(2, '0')
              const key    = `${calYear}-${mesNum}-${diaStr}`
              const hasRec = records[key]
              const isToday= isCurrentMon && d === today.getDate()
              if (hasRec) return (
                <div key={d} onClick={() => openRecord(key)}
                  style={{ textAlign:'center', padding:'10px 2px', borderRadius:10, background:'#276749', color:'#fff', fontWeight:800, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 2px 6px rgba(39,103,73,0.25)' }}>
                  {d}
                </div>
              )
              if (isToday) return (
                <div key={d} style={{ textAlign:'center', padding:'10px 2px', borderRadius:10, background:'#ebf8ff', color:'#2b6cb0', fontWeight:700, fontSize:'0.85rem', border:'2px solid #2b6cb0' }}>{d}</div>
              )
              return <div key={d} style={{ textAlign:'center', padding:'10px 2px', borderRadius:10, background:'#f7fafc', color:'#a0aec0', fontSize:'0.85rem' }}>{d}</div>
            })}
          </div>
        )}

        {/* Leyenda */}
        <div style={{ display:'flex', gap:12, marginTop:14, fontSize:'0.78rem', color:'var(--gray)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:14, height:14, borderRadius:5, background:'#276749', display:'inline-block' }} />Con registro</span>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:14, height:14, borderRadius:5, background:'#ebf8ff', border:'2px solid #2b6cb0', display:'inline-block' }} />Hoy</span>
        </div>
      </Card>

      {/* Registros anteriores (formato legacy) */}
      {legacy.length > 0 && (
        <Card title="📋 Registros anteriores">
          {legacy.map(r => {
            const t = r.totals || {}
            const tg = r.totalsGran || {}; const tm = r.totalsMich || {}; const tl = r.totalsLimon || {}
            const total = (t.ventaDia || t.bruto || 0) + (tg.neto || 0) + (tg.sodaNeto || 0) + (tm.total || 0) + (tl.total || 0)
            return (
              <div key={r._docId} className="hist-item" onClick={() => openRecord(r._docId)}>
                <div className="hist-fecha">📅 {r.fecha || r._docId}</div>
                <div className="hist-info">
                  <span>💵 Ef: {fmt(t.ef || 0)}</span>
                  <span>🏦 Tr: {fmt(t.tr || 0)}</span>
                  <span>📦 {t.cnt || 0} facturas</span>
                </div>
                <div className="hist-neto c-green">{fmt(total)}</div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Modal detalle registro */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="📋 Detalle del registro">
        {selected && <RecordDetail record={selected} onDelete={handleDelete} />}
      </Modal>
    </div>
  )
}

function RecordDetail({ record: r, onDelete }) {
  const t  = r.totals || {}
  const tg = r.totalsGran || {}; const tm = r.totalsMich || {}; const tl = r.totalsLimon || {}
  const ventaTotal = (t.ventaDia || t.bruto || 0) + (tg.neto || 0) + (tg.sodaNeto || 0) + (tm.total || 0) + (tl.total || 0)

  return (
    <>
      <p style={{ fontSize:'0.78rem', color:'var(--gray)', marginBottom:12 }}>
        {r.fecha} · Guardado el {new Date(r.savedAt).toLocaleString('es-CO')}
        {r.savedByName ? ` por ${r.savedByName}` : ''}
      </p>

      {/* Salchimonster */}
      <div style={{ background:'#f0fff4', border:'1.5px solid #c6f6d5', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
        <div style={{ fontWeight:700, color:'#276749', marginBottom:6, fontSize:'0.82rem' }}>🧾 Salchimonster (Facturas)</div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:3 }}><span>💵 Efectivo</span><strong style={{ color:'#276749' }}>{fmt(t.ef || 0)}</strong></div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:6 }}><span>🏦 Transferencias</span><strong style={{ color:'#2b6cb0' }}>{fmt(t.tr || 0)}</strong></div>
        <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'0.9rem', borderTop:'1px dashed #c6f6d5', paddingTop:6 }}><span>Total facturas</span><span style={{ color:'#276749' }}>{fmt(t.ventaDia || t.bruto || 0)}</span></div>
      </div>

      {/* Granizados */}
      {(tg.efBruto || tg.trBruto || tg.sodaNeto || tm.total || tl.total) ? (
        <div style={{ background:'#e6fffa', border:'1.5px solid #81e6d9', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
          <div style={{ fontWeight:700, color:'#234e52', marginBottom:6, fontSize:'0.82rem' }}>🧊 Módulo Granizados</div>
          {(tg.efBruto + tg.trBruto) > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:3 }}><span>🧊 Granizados</span><span>{fmt(tg.efBruto + tg.trBruto)}</span></div>}
          {(tg.sodaNeto > 0)          && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:3 }}><span>🥤 Sodas</span><span>{fmt(tg.sodaNeto)}</span></div>}
          {(tm.total > 0)             && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:3 }}><span>🍺 Micheladas</span><span>{fmt(tm.total)}</span></div>}
          {(tl.total > 0)             && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:3 }}><span>🍋 Limonadas</span><span>{fmt(tl.total)}</span></div>}
        </div>
      ) : null}

      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1rem', background:'#f0fff4', padding:'10px 12px', borderRadius:10, marginBottom:12 }}>
        <span>💰 Total día</span><span style={{ color:'#276749' }}>{fmt(ventaTotal)}</span>
      </div>

      <button className="btn-danger" style={{ width:'100%', padding:11, marginTop:4 }} onClick={onDelete}>
        🗑 Eliminar este registro
      </button>
    </>
  )
}
