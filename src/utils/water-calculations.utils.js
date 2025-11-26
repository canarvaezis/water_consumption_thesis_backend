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
 * Nota: Estos valores deben actualizarse según las tarifas vigentes
 */
export const EMCALI_RATES = {
  1: { // Estrato 1
    block1: { max: 20, price: 0 }, // Primeros 20 m³ son gratuitos
    block2: { max: 40, price: 2000 }, // 21-40 m³
    block3: { price: 3000 }, // Más de 40 m³
    fixedCharge: 5000,
  },
  2: {
    block1: { max: 20, price: 1500 },
    block2: { max: 40, price: 2500 },
    block3: { price: 3500 },
    fixedCharge: 8000,
  },
  3: {
    block1: { max: 20, price: 2000 },
    block2: { max: 40, price: 3000 },
    block3: { price: 4000 },
    fixedCharge: 12000,
  },
  4: {
    block1: { max: 20, price: 2500 },
    block2: { max: 40, price: 3500 },
    block3: { price: 4500 },
    fixedCharge: 15000,
  },
  5: {
    block1: { max: 20, price: 3000 },
    block2: { max: 40, price: 4000 },
    block3: { price: 5000 },
    fixedCharge: 18000,
  },
  6: {
    block1: { max: 20, price: 3500 },
    block2: { max: 40, price: 4500 },
    block3: { price: 5500 },
    fixedCharge: 20000,
  },
};

/**
 * Calcular costo del consumo según estrato y volumen
 */
export const calculateWaterCost = (liters, stratum) => {
  const cubicMeters = litersToCubicMeters(liters);
  const rates = EMCALI_RATES[stratum];
  
  if (!rates) {
    throw new Error(`Estrato ${stratum} no válido`);
  }

  let cost = rates.fixedCharge; // Cargo fijo
  
  if (cubicMeters <= rates.block1.max) {
    cost += cubicMeters * rates.block1.price;
  } else if (cubicMeters <= rates.block2.max) {
    cost += rates.block1.max * rates.block1.price;
    cost += (cubicMeters - rates.block1.max) * rates.block2.price;
  } else {
    cost += rates.block1.max * rates.block1.price;
    cost += (rates.block2.max - rates.block1.max) * rates.block2.price;
    cost += (cubicMeters - rates.block2.max) * rates.block3.price;
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

