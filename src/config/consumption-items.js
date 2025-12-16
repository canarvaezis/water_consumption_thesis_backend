/**
 * Configuración estática de items de consumo
 * 
 * Define todas las actividades de consumo de agua disponibles
 * Cada item tiene tipos de grifo compatibles y presets de duración
 */

export const CONSUMPTION_ITEMS = [
  // Baño
  {
    id: 'bath',
    name: 'Baño',
    categoryId: 'bathroom',
    description: 'Baño o ducha',
    compatibleFaucetTypeIds: ['shower_standard', 'shower_low_flow', 'bathtub'],
    defaultFaucetTypeId: 'shower_standard',
    durationPresets: {
      quick: { minutes: 0, seconds: 30 },
      normal: { minutes: 5, seconds: 0 },
      long: { minutes: 10, seconds: 0 },
    },
  },
  {
    id: 'hand_washing',
    name: 'Lavado de manos',
    categoryId: 'bathroom',
    description: 'Lavado de manos',
    compatibleFaucetTypeIds: ['faucet_bathroom', 'faucet_standard', 'faucet_low_flow'],
    defaultFaucetTypeId: 'faucet_bathroom',
    durationPresets: {
      quick: { minutes: 0, seconds: 20 },
      normal: { minutes: 0, seconds: 40 },
      long: { minutes: 1, seconds: 0 },
    },
  },
  {
    id: 'teeth_brushing',
    name: 'Cepillado de dientes',
    categoryId: 'bathroom',
    description: 'Cepillado de dientes',
    compatibleFaucetTypeIds: ['faucet_bathroom', 'faucet_standard', 'faucet_low_flow'],
    defaultFaucetTypeId: 'faucet_bathroom',
    durationPresets: {
      quick: { minutes: 0, seconds: 15 },
      normal: { minutes: 0, seconds: 30 },
      long: { minutes: 1, seconds: 0 },
    },
  },
  {
    id: 'face_washing',
    name: 'Lavado de cara',
    categoryId: 'bathroom',
    description: 'Lavado de cara',
    compatibleFaucetTypeIds: ['faucet_bathroom', 'faucet_standard', 'faucet_low_flow'],
    defaultFaucetTypeId: 'faucet_bathroom',
    durationPresets: {
      quick: { minutes: 0, seconds: 30 },
      normal: { minutes: 1, seconds: 0 },
      long: { minutes: 2, seconds: 0 },
    },
  },
  
  // Cocina
  {
    id: 'dish_washing',
    name: 'Lavado de platos',
    categoryId: 'kitchen',
    description: 'Lavado de platos y utensilios',
    compatibleFaucetTypeIds: ['faucet_kitchen', 'faucet_kitchen_low_flow'],
    defaultFaucetTypeId: 'faucet_kitchen',
    durationPresets: {
      quick: { minutes: 2, seconds: 0 },
      normal: { minutes: 5, seconds: 0 },
      long: { minutes: 10, seconds: 0 },
    },
  },
  {
    id: 'food_preparation',
    name: 'Preparación de alimentos',
    categoryId: 'kitchen',
    description: 'Lavado de frutas, verduras, etc.',
    compatibleFaucetTypeIds: ['faucet_kitchen', 'faucet_kitchen_low_flow'],
    defaultFaucetTypeId: 'faucet_kitchen',
    durationPresets: {
      quick: { minutes: 1, seconds: 0 },
      normal: { minutes: 3, seconds: 0 },
      long: { minutes: 5, seconds: 0 },
    },
  },
  {
    id: 'cooking',
    name: 'Cocinar',
    categoryId: 'kitchen',
    description: 'Uso de agua para cocinar',
    compatibleFaucetTypeIds: ['faucet_kitchen', 'faucet_kitchen_low_flow'],
    defaultFaucetTypeId: 'faucet_kitchen',
    durationPresets: {
      quick: { minutes: 1, seconds: 0 },
      normal: { minutes: 2, seconds: 0 },
      long: { minutes: 5, seconds: 0 },
    },
  },
  
  // Lavandería
  {
    id: 'laundry_machine',
    name: 'Lavado de ropa (máquina)',
    categoryId: 'laundry',
    description: 'Lavado de ropa en lavadora',
    compatibleFaucetTypeIds: ['washing_machine'],
    defaultFaucetTypeId: 'washing_machine',
    durationPresets: {
      quick: { minutes: 30, seconds: 0 },
      normal: { minutes: 45, seconds: 0 },
      long: { minutes: 60, seconds: 0 },
    },
  },
  {
    id: 'laundry_hand',
    name: 'Lavado de ropa (manual)',
    categoryId: 'laundry',
    description: 'Lavado de ropa a mano',
    compatibleFaucetTypeIds: ['hand_washing', 'faucet_standard'],
    defaultFaucetTypeId: 'hand_washing',
    durationPresets: {
      quick: { minutes: 5, seconds: 0 },
      normal: { minutes: 10, seconds: 0 },
      long: { minutes: 15, seconds: 0 },
    },
  },
  
  // Limpieza
  {
    id: 'floor_cleaning',
    name: 'Limpieza de pisos',
    categoryId: 'cleaning',
    description: 'Limpieza de pisos y superficies',
    compatibleFaucetTypeIds: ['faucet_standard', 'faucet_kitchen'],
    defaultFaucetTypeId: 'faucet_standard',
    durationPresets: {
      quick: { minutes: 2, seconds: 0 },
      normal: { minutes: 5, seconds: 0 },
      long: { minutes: 10, seconds: 0 },
    },
  },
  
  // Exterior
  {
    id: 'plant_watering',
    name: 'Riego de plantas',
    categoryId: 'outdoor',
    description: 'Riego de plantas y jardín',
    compatibleFaucetTypeIds: ['hose', 'watering_can'],
    defaultFaucetTypeId: 'hose',
    durationPresets: {
      quick: { minutes: 2, seconds: 0 },
      normal: { minutes: 5, seconds: 0 },
      long: { minutes: 10, seconds: 0 },
    },
  },
  
  // Otros
  {
    id: 'other',
    name: 'Otro',
    categoryId: 'other',
    description: 'Otra actividad de consumo',
    compatibleFaucetTypeIds: ['faucet_standard', 'faucet_low_flow'],
    defaultFaucetTypeId: 'faucet_standard',
    durationPresets: {
      quick: { minutes: 1, seconds: 0 },
      normal: { minutes: 2, seconds: 0 },
      long: { minutes: 5, seconds: 0 },
    },
  },
];

/**
 * Obtener item por ID
 */
export const getItemById = (itemId) => {
  return CONSUMPTION_ITEMS.find(item => item.id === itemId) || null;
};

/**
 * Obtener item por nombre
 */
export const getItemByName = (name) => {
  const normalized = name.toLowerCase().trim();
  return CONSUMPTION_ITEMS.find(item => 
    item.name.toLowerCase() === normalized
  ) || null;
};

/**
 * Obtener items por categoría
 */
export const getItemsByCategory = (categoryId) => {
  return CONSUMPTION_ITEMS.filter(item => item.categoryId === categoryId);
};
