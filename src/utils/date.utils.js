/**
 * Utilidades para manejo de fechas
 */

/**
 * Convertir una fecha a formato YYYY-MM-DD
 * @param {Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export function dateToYYYYMMDD(date) {
  if (!date) {
    return null;
  }
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    throw new Error('Fecha inválida');
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD
 * @returns {string} - Fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayYYYYMMDD() {
  return dateToYYYYMMDD(new Date());
}

