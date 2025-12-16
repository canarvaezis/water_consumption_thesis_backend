/**
 * Configuración estática de categorías de consumo
 * 
 * Estas categorías agrupan las actividades de consumo de agua
 */

export const CONSUMPTION_CATEGORIES = [
  {
    id: 'bathroom',
    name: 'Baño',
    description: 'Actividades relacionadas con el baño y aseo personal',
  },
  {
    id: 'kitchen',
    name: 'Cocina',
    description: 'Actividades en la cocina',
  },
  {
    id: 'laundry',
    name: 'Lavandería',
    description: 'Lavado de ropa y textiles',
  },
  {
    id: 'cleaning',
    name: 'Limpieza',
    description: 'Limpieza del hogar',
  },
  {
    id: 'outdoor',
    name: 'Exterior',
    description: 'Actividades al aire libre como riego',
  },
  {
    id: 'other',
    name: 'Otros',
    description: 'Otras actividades de consumo',
  },
];

/**
 * Obtener categoría por ID
 */
export const getCategoryById = (categoryId) => {
  return CONSUMPTION_CATEGORIES.find(cat => cat.id === categoryId) || null;
};

/**
 * Obtener categoría por nombre
 */
export const getCategoryByName = (name) => {
  const normalized = name.toLowerCase().trim();
  return CONSUMPTION_CATEGORIES.find(cat => 
    cat.name.toLowerCase() === normalized
  ) || null;
};
