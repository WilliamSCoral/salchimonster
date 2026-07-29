import Card, { StatBox } from '../components/ui/Card'
import useFacturasStore from '../store/useFacturasStore'
import useGranizadosStore from '../store/useGranizadosStore'
import { fmt } from '../utils/format'

export default function ResumenView() {
  const totals  = useFacturasStore(s => s.totals())
  const granTot = useGranizadosStore(s => s.totals())

  return (
    <div className="page active">

      {/* Venta del día — solo facturas Salchimonster */}
      <Card title="📊 Venta del día">
        <div className="stat-grid">
          <StatBox label="💵 Efectivo"       value={fmt(totals.ef)}    color="c-green" />
          <StatBox label="🏦 Transferencias" value={fmt(totals.tr)}    color="c-blue"  />
          <StatBox label="📦 Facturas"       value={totals.cnt}        color="c-gray"  />
          <StatBox label="💰 Total bruto"    value={fmt(totals.bruto)} color="c-purple"/>
        </div>
        <div id="venta-dia-box" className={`neto-box ${totals.ventaDia >= 0 ? 'neto-pos' : 'neto-neg'}`}>
          <span className="neto-label">🧾 Venta del día (facturas)</span>
          <span className="neto-value">{fmt(totals.ventaDia)}</span>
        </div>
      </Card>

      {/* Neto del día */}
      <Card title="📉 Egresos">
        <div className="stat-grid">
          <StatBox label="💸 Gastos"    value={fmt(totals.gastos)}    color="c-red"    />
          <StatBox label="👷 Empleados" value={fmt(totals.empleados)} color="c-orange" />
          <StatBox label="🛒 Compras"   value={fmt(totals.comprasEf)} color="c-orange" />
        </div>
        <div className={`neto-box ${totals.neto >= 0 ? 'neto-pos' : 'neto-neg'}`}>
          <span className="neto-label">Neto del día</span>
          <span className="neto-value">{fmt(totals.neto)}</span>
        </div>
      </Card>

      {/* Caja */}
      <Card title="🏦 Estado de caja">
        <div className="caja-saldo">
          <div className="saldo-label">Total disponible en caja</div>
          <div className="saldo-value">{fmt(totals.caja)}</div>
          <div className="saldo-sub">Base: {fmt(totals.baseEfectivo)} + Neto: {fmt(totals.neto)}</div>
        </div>
      </Card>

      {/* Módulo Granizados (referencia) */}
      {(granTot.efBruto + granTot.trBruto + granTot.michTotal + granTot.limonTotal) > 0 && (
        <Card title="🧊 Resumen Granizados (referencia)">
          <div className="stat-grid">
            {granTot.neto > 0        && <StatBox label="🧊 Granizados" value={fmt(granTot.neto)}      color="c-blue"   />}
            {granTot.sodaNeto > 0    && <StatBox label="🥤 Sodas"      value={fmt(granTot.sodaNeto)}   color="c-blue"   />}
            {granTot.michTotal > 0   && <StatBox label="🍺 Micheladas" value={fmt(granTot.michTotal)}  color="c-purple" />}
            {granTot.limonTotal > 0  && <StatBox label="🍋 Limonadas"  value={fmt(granTot.limonTotal)} color="c-green"  />}
          </div>
        </Card>
      )}
    </div>
  )
}
