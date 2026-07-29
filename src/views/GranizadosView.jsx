import { useState, useRef } from 'react'
import Card from '../components/ui/Card'
import useGranizadosStore from '../store/useGranizadosStore'
import useAppStore from '../store/useAppStore'
import { saveGranizados } from '../services/granizadosService'
import { fmt } from '../utils/format'
import { PRECIO_9OZ, PRECIO_12OZ, PRECIO_CREMOSO, PRECIO_SODA } from '../utils/constants'

function NumInput({ label, value, onChange }) {
  return (
    <div className="fg">
      <label>{label}</label>
      <input type="number" inputMode="numeric" placeholder="0" min="0"
        value={value || ''} onChange={e => onChange(parseInt(e.target.value) || 0)} />
    </div>
  )
}

export default function GranizadosView() {
  const { granData, totals } = useGranizadosStore()
  const { dayLocked } = useAppStore()
  const t = totals()
  const timer = useRef(null)

  const update = (field, val) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveGranizados({ ...granData, [field]: val })
    }, 800)
  }

  const setField = (field, val) => update(field, val)

  return (
    <div className="page active">
      {dayLocked && <div className="locked-banner show">🔒 Día guardado — no se puede modificar</div>}

      <Card title="🧊 Ventas del día">
        <div style={{ fontSize:'0.78rem', color:'var(--gray)', marginBottom:12, background:'var(--light)', padding:'6px 10px', borderRadius:8 }}>
          💡 Precio: <strong>9oz = $10.000</strong> · <strong>12oz = $12.000</strong> · <strong>Cremosos = $13.000</strong>
        </div>

        <div style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:6, color:'#2b6cb0' }}>🥤 Vasos 9 oz</div>
        <div className="form-row">
          <NumInput label="💵 Efectivo"      value={granData.oz9ef} onChange={v => setField('oz9ef', v)} />
          <NumInput label="🏦 Transferencia" value={granData.oz9tr} onChange={v => setField('oz9tr', v)} />
        </div>

        <div style={{ fontWeight:700, fontSize:'0.82rem', margin:'14px 0 6px', color:'#553c9a' }}>🥤 Vasos 12 oz</div>
        <div className="form-row">
          <NumInput label="💵 Efectivo"      value={granData.oz12ef} onChange={v => setField('oz12ef', v)} />
          <NumInput label="🏦 Transferencia" value={granData.oz12tr} onChange={v => setField('oz12tr', v)} />
        </div>

        <div style={{ fontWeight:700, fontSize:'0.82rem', margin:'14px 0 6px', color:'#276749' }}>🍦 Cremosos</div>
        <div className="form-row">
          <NumInput label="💵 Efectivo"      value={granData.cremEf} onChange={v => setField('cremEf', v)} />
          <NumInput label="🏦 Transferencia" value={granData.cremTr} onChange={v => setField('cremTr', v)} />
        </div>

        {/* Totales */}
        <div style={{ marginTop:14, borderTop:'1.5px dashed var(--border)', paddingTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:4 }}>
            <span style={{ color:'#2b6cb0' }}>🥤 9oz — {(granData.oz9ef || 0) + (granData.oz9tr || 0)} vasos</span>
            <span style={{ fontWeight:700, color:'#2b6cb0' }}>{fmt(t.efBruto ? (granData.oz9ef || 0) * PRECIO_9OZ + (granData.oz9tr || 0) * PRECIO_9OZ : 0)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:4 }}>
            <span style={{ color:'#553c9a' }}>🥤 12oz — {(granData.oz12ef || 0) + (granData.oz12tr || 0)} vasos</span>
            <span style={{ fontWeight:700, color:'#553c9a' }}>{fmt(((granData.oz12ef || 0) + (granData.oz12tr || 0)) * PRECIO_12OZ)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', marginBottom:10 }}>
            <span style={{ color:'#276749' }}>🍦 Cremosos — {(granData.cremEf || 0) + (granData.cremTr || 0)} und.</span>
            <span style={{ fontWeight:700, color:'#276749' }}>{fmt(((granData.cremEf || 0) + (granData.cremTr || 0)) * PRECIO_CREMOSO)}</span>
          </div>
          <div className="neto-box neto-pos" style={{ margin:0 }}>
            <span className="neto-label">🧊 Total bruto granizados</span>
            <span className="neto-value">{fmt(t.efBruto + t.trBruto)}</span>
          </div>
        </div>
      </Card>

      {/* Sodas */}
      <Card title={`🥤 Sodas  ·  $${PRECIO_SODA.toLocaleString('es-CO')} c/u`}>
        <div className="form-row">
          <NumInput label="💵 Efectivo"      value={granData.sodaEf} onChange={v => setField('sodaEf', v)} />
          <NumInput label="🏦 Transferencia" value={granData.sodaTr} onChange={v => setField('sodaTr', v)} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'0.88rem', background:'#f0fff4', padding:'8px 10px', borderRadius:8, marginTop:10, color:'#276749' }}>
          <span>= Total sodas</span><span>{fmt(t.sodaNeto)}</span>
        </div>
      </Card>
    </div>
  )
}
