/**
 * Formatea un número como moneda colombiana.
 * Ej: 12500 → "$ 12.500"
 */
export function fmt(n = 0) {
  return '$ ' + Math.round(n).toLocaleString('es-CO')
}

/**
 * Parsea un string con puntos de miles a número.
 * Ej: "12.500" → 12500
 */
export function parseMoney(str = '') {
  return parseInt(String(str).replace(/\./g, '').replace(/[^0-9]/g, ''), 10) || 0
}

/**
 * Formatea un input de texto como moneda mientras el usuario escribe.
 * Devuelve el string formateado.
 */
export function formatMoneyInput(raw = '') {
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('es-CO')
}

/**
 * Devuelve un string de fecha legible.
 * Ej: new Date() → "Martes 15 de Enero 2025"
 */
export function fechaLegible(date = new Date()) {
  const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                 'Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${DIAS[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]} ${date.getFullYear()}`
}
