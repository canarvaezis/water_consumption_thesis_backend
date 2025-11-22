/**
 * Utilidades para trabajar con Firestore
 * 
 * Funciones helper para manejar Timestamps y conversiones
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Convertir Timestamp de Firestore a Date de JavaScript
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Si ya es un Date, retornarlo
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Si es un Timestamp de Firestore, convertirlo
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Si es un objeto Timestamp de Firestore (sin método toDate)
  if (timestamp && timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Si es un string o número, intentar crear Date
  return new Date(timestamp);
};

/**
 * Convertir Date de JavaScript a Timestamp de Firestore
 */
export const dateToTimestamp = (date) => {
  if (!date) return null;
  
  // Si ya es un Timestamp, retornarlo
  if (date instanceof Timestamp) {
    return date;
  }
  
  // Si es un Date, convertirlo
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  
  // Si es un string o número, crear Date primero
  return Timestamp.fromDate(new Date(date));
};

/**
 * Normalizar fecha a inicio del día
 */
export const normalizeToStartOfDay = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Normalizar fecha a fin del día
 */
export const normalizeToEndOfDay = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

