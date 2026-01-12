/**
 * Utilidades para cálculos relacionados con consumo de agua
 */

/**
 * Convertir litros a metros cúbicos
 */
export const litersToCubicMeters = (liters) => {
  return liters / 1000;
};

/**
 * Calcular costo según tarifas de Emcali por estrato
 * Tarifas basadas en EMCALI 2021 - Municipio de Cali (ACUEDUCTO)
 * Nota: Solo se calcula el costo variable (sin cargo fijo)
 */
export const EMCALI_RATES = {
  1: { // Estrato 1
    block1: { max: 16, price: 751.15 }, // 0-16 m³
    block2: { price: 2347.35 }, // >16 m³
    hasTwoBlocks: true,
  },
  2: { // Estrato 2
    block1: { max: 16, price: 1619.67 }, // 0-16 m³
    block2: { price: 2347.35 }, // >16 m³
    hasTwoBlocks: true,
  },
  3: { // Estrato 3
    block1: { max: 16, price: 2323.88 }, // 0-16 m³
    block2: { price: 2347.35 }, // >16 m³
    hasTwoBlocks: true,
  },
  4: { // Estrato 4
    pricePerCubicMeter: 2347.35, // Precio único por m³
    hasTwoBlocks: false,
  },
  5: { // Estrato 5
    pricePerCubicMeter: 3544.50, // Precio único por m³
    hasTwoBlocks: false,
  },
  6: { // Estrato 6
    pricePerCubicMeter: 3779.23, // Precio único por m³
    hasTwoBlocks: false,
  },
};

/**
 * Calcular costo del consumo según estrato y volumen
 * Solo calcula el costo variable (sin cargo fijo) basado en los litros consumidos
 * Tarifas según EMCALI 2021 - Municipio de Cali (ACUEDUCTO)
 */
export const calculateWaterCost = (liters, stratum) => {
  const cubicMeters = litersToCubicMeters(liters);
  const rates = EMCALI_RATES[stratum];
  
  if (!rates) {
    throw new Error(`Estrato ${stratum} no válido`);
  }

  let cost = 0;
  
  // Estratos 1, 2, 3: tienen dos bloques (0-16 m³ y >16 m³)
  if (rates.hasTwoBlocks) {
    if (cubicMeters <= rates.block1.max) {
      cost = cubicMeters * rates.block1.price;
    } else {
      cost = rates.block1.max * rates.block1.price;
      cost += (cubicMeters - rates.block1.max) * rates.block2.price;
    }
  } 
  // Estratos 4, 5, 6: precio único por m³
  else {
    cost = cubicMeters * rates.pricePerCubicMeter;
  }

  return Math.round(cost);
};

/**
 * Calcular promedio de consumo
 */
export const calculateAverage = (consumptions) => {
  if (!consumptions || consumptions.length === 0) {
    return 0;
  }
  
  const total = consumptions.reduce((sum, c) => sum + (c.totalEstimatedLiters || 0), 0);
  return total / consumptions.length;
};

/**
 * Calcular variación porcentual
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return ((current - previous) / previous) * 100;
};

/**
 * Calcular consumo total en un período
 */
export const calculateTotalConsumption = (sessions) => {
  return sessions.reduce((total, session) => {
    return total + (session.totalEstimatedLiters || 0);
  }, 0);
};

/**
 * Verificar y obtener la racha actual del usuario
 * Si el último consumo fue antes de ayer, la racha debe ser 0
 * 
 * @param {Object} user - Objeto de usuario con lastConsumptionDate y consumptionStreak
 * @returns {Object} - Objeto con la racha actualizada (puede ser 0 si no hay consumo reciente)
 */
export const getCurrentStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Convertir lastConsumptionDate si es Timestamp de Firestore
  let lastDate = null;
  if (user.lastConsumptionDate) {
    if (user.lastConsumptionDate.toDate && typeof user.lastConsumptionDate.toDate === 'function') {
      lastDate = user.lastConsumptionDate.toDate();
    } else if (user.lastConsumptionDate instanceof Date) {
      lastDate = new Date(user.lastConsumptionDate);
    } else {
      lastDate = new Date(user.lastConsumptionDate);
    }
    lastDate.setHours(0, 0, 0, 0);
  }
  
  let currentStreak = user.consumptionStreak || 0;
  
  // Si no hay última fecha de consumo, racha es 0
  if (!lastDate) {
    currentStreak = 0;
  }
  // Si la última fecha es hoy o ayer, mantener la racha actual
  else if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
    // Mantener la racha actual
    currentStreak = user.consumptionStreak || 0;
  }
  // Si la última fecha es anterior a ayer, la racha debe ser 0
  else {
    currentStreak = 0;
  }
  
  return {
    streak: currentStreak,
    lastConsumptionDate: lastDate,
  };
};

/**
 * Actualizar racha de consumo del usuario al registrar un nuevo consumo
 * 
 * @param {Object} user - Objeto de usuario con lastConsumptionDate y consumptionStreak
 * @param {Date} consumptionDate - Fecha del consumo registrado (debe ser hoy)
 * @returns {Object} - Objeto con los valores actualizados de la racha
 */
export const updateConsumptionStreak = (user, consumptionDate) => {
  const today = new Date(consumptionDate);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Convertir lastConsumptionDate si es Timestamp de Firestore
  let lastDate = null;
  if (user.lastConsumptionDate) {
    if (user.lastConsumptionDate.toDate && typeof user.lastConsumptionDate.toDate === 'function') {
      lastDate = user.lastConsumptionDate.toDate();
    } else if (user.lastConsumptionDate instanceof Date) {
      lastDate = new Date(user.lastConsumptionDate);
    } else {
      lastDate = new Date(user.lastConsumptionDate);
    }
    lastDate.setHours(0, 0, 0, 0);
  }
  
  let newStreak = 0;
  
  // Si la última fecha es ayer, incrementar racha
  if (lastDate && lastDate.getTime() === yesterday.getTime()) {
    newStreak = (user.consumptionStreak || 0) + 1;
  }
  // Si la última fecha es hoy, mantener racha (ya se registró hoy)
  else if (lastDate && lastDate.getTime() === today.getTime()) {
    // Mantener la racha actual
    newStreak = user.consumptionStreak || 0;
  }
  // Si la última fecha es anterior a ayer o no existe, empezar en 1 (nuevo registro)
  else {
    newStreak = 1;
  }
  
  return {
    consumptionStreak: newStreak,
    lastConsumptionDate: today,
    streakLastUpdated: new Date(),
  };
};

/**
 * Normalizar duración a formato estándar (minutos y segundos)
 * Solo acepta formato: { minutes: number, seconds: number }
 * 
 * @param {Object} duration - Duración con minutos y segundos
 * @returns {Object} - { minutes: number, seconds: number }
 */
export const normalizeDuration = (duration) => {
  if (!duration || typeof duration !== 'object') {
    throw new Error('Duración debe ser un objeto con minutos y segundos');
  }
  
  if (duration.minutes === undefined && duration.seconds === undefined) {
    throw new Error('Duración debe tener al menos minutos o segundos');
  }
  
  return {
    minutes: duration.minutes || 0,
    seconds: duration.seconds || 0
  };
};

/**
 * Convertir duración (minutos y segundos) a minutos totales (decimal)
 * 
 * @param {Object} duration - { minutes: number, seconds: number }
 * @returns {number} - Minutos totales como decimal
 */
export const durationToTotalMinutes = (duration) => {
  if (!duration || typeof duration.minutes === 'undefined' || typeof duration.seconds === 'undefined') {
    throw new Error('Duración debe tener minutos y segundos');
  }
  return duration.minutes + (duration.seconds / 60);
};

/**
 * Validar duración
 * 
 * @param {Object} duration - { minutes: number, seconds: number }
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateDuration = (duration) => {
  if (!duration || typeof duration.minutes === 'undefined' || typeof duration.seconds === 'undefined') {
    return { valid: false, error: 'Duración debe tener minutos y segundos' };
  }
  
  // Validar que los segundos estén en rango 0-59
  if (duration.seconds < 0 || duration.seconds >= 60) {
    return { valid: false, error: 'Los segundos deben estar entre 0 y 59' };
  }
  
  // Validar que al menos uno tenga valor > 0
  if (duration.minutes === 0 && duration.seconds === 0) {
    return { valid: false, error: 'La duración debe ser mayor a 0' };
  }
  
  // Validar rango máximo razonable (24 horas = 1440 minutos)
  const totalMinutes = durationToTotalMinutes(duration);
  if (totalMinutes > 1440) {
    return { valid: false, error: 'La duración no puede ser mayor a 24 horas' };
  }
  
  // Validar mínimo (al menos 1 segundo)
  if (totalMinutes < 0.0167) { // 1 segundo = 0.0167 minutos
    return { valid: false, error: 'La duración debe ser al menos 1 segundo' };
  }
  
  return { valid: true };
};

