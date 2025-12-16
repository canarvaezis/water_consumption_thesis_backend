/**
 * Configuración estática de tipos de grifos
 * 
 * Define todos los tipos de grifos/dispositivos de agua disponibles
 */

export const FAUCET_TYPES = [
  // Baño
  {
    id: 'shower_standard',
    name: 'Ducha estándar',
    description: 'Ducha convencional',
    litersPerMinute: 9.5,
    isActive: true,
    area: 'bathroom',
  },
  {
    id: 'shower_low_flow',
    name: 'Ducha de bajo flujo',
    description: 'Ducha ahorradora de agua',
    litersPerMinute: 5.5,
    isActive: true,
    area: 'bathroom',
  },
  {
    id: 'bathtub',
    name: 'Tina',
    description: 'Bañera o tina',
    litersPerMinute: 12.0,
    isActive: true,
    area: 'bathroom',
  },
  {
    id: 'faucet_bathroom',
    name: 'Grifo de baño',
    description: 'Grifo del lavamanos del baño',
    litersPerMinute: 6.0,
    isActive: true,
    area: 'bathroom',
  },
  
  // Cocina
  {
    id: 'faucet_kitchen',
    name: 'Grifo de cocina',
    description: 'Grifo de la cocina',
    litersPerMinute: 8.0,
    isActive: true,
    area: 'kitchen',
  },
  {
    id: 'faucet_kitchen_low_flow',
    name: 'Grifo de cocina ahorrador',
    description: 'Grifo de cocina de bajo flujo',
    litersPerMinute: 5.5,
    isActive: true,
    area: 'kitchen',
  },
  
  // General
  {
    id: 'faucet_standard',
    name: 'Grifo estándar',
    description: 'Grifo convencional',
    litersPerMinute: 6.5,
    isActive: true,
    area: 'general',
  },
  {
    id: 'faucet_low_flow',
    name: 'Grifo ahorrador',
    description: 'Grifo de bajo flujo',
    litersPerMinute: 4.0,
    isActive: true,
    area: 'general',
  },
  
  // Lavandería
  {
    id: 'washing_machine',
    name: 'Lavadora',
    description: 'Lavadora automática',
    litersPerMinute: 15.0, // Promedio durante el ciclo
    isActive: true,
    area: 'laundry',
  },
  {
    id: 'hand_washing',
    name: 'Lavado manual',
    description: 'Lavado de ropa a mano',
    litersPerMinute: 8.0,
    isActive: true,
    area: 'laundry',
  },
  
  // Exterior
  {
    id: 'hose',
    name: 'Manguera',
    description: 'Manguera para riego',
    litersPerMinute: 20.0,
    isActive: true,
    area: 'outdoor',
  },
  {
    id: 'watering_can',
    name: 'Regadera',
    description: 'Regadera manual',
    litersPerMinute: 2.0,
    isActive: true,
    area: 'outdoor',
  },
];

/**
 * Obtener tipo de grifo por ID
 */
export const getFaucetTypeById = (faucetTypeId) => {
  return FAUCET_TYPES.find(faucet => faucet.id === faucetTypeId) || null;
};

/**
 * Obtener tipo de grifo por nombre
 */
export const getFaucetTypeByName = (name) => {
  const normalized = name.toLowerCase().trim();
  return FAUCET_TYPES.find(faucet => 
    faucet.name.toLowerCase() === normalized
  ) || null;
};

/**
 * Obtener tipos de grifo activos
 */
export const getActiveFaucetTypes = () => {
  return FAUCET_TYPES.filter(faucet => faucet.isActive);
};
