/**
 * Configuración estática de items de la tienda
 * 
 * Esta configuración contiene las definiciones base de todos los items disponibles.
 * Los inventarios de usuarios y personalizaciones activas se mantienen en Firestore.
 * 
 * Estructura:
 * - Cada categoría es una key del objeto
 * - Cada categoría contiene un array de items
 * - Cada item debe tener: id, name, description, price, assetUrl, default, featured, active
 */

export const STORE_ITEMS = {
  // Categoría: Color de piel (todos desbloqueados)
  // Nota: Los colores de piel no usan assetUrl porque son valores de color (hex/RGB),
  // no imágenes. El frontend aplicará el color basándose en el id o colorValue.
  skin_color: [
    {
      id: 'skin_light',
      name: 'Piel Clara',
      description: 'Tono de piel claro',
      price: 0,
      assetUrl: null, // Los colores de piel no necesitan imagen
      colorValue: '#FFDBAC', // Valor de color en hex (opcional, para referencia del frontend)
      default: true,
      featured: false,
      active: true,
    },
    {
      id: 'skin_medium_light',
      name: 'Piel Claro-Medio',
      description: 'Tono de piel claro-medio',
      price: 0,
      assetUrl: null,
      colorValue: '#F1C27D',
      default: true,
      featured: false,
      active: true,
    },
    {
      id: 'skin_medium',
      name: 'Piel Media',
      description: 'Tono de piel medio',
      price: 0,
      assetUrl: null,
      colorValue: '#E0AC69',
      default: true,
      featured: false,
      active: true,
    },
    {
      id: 'skin_medium_dark',
      name: 'Piel Medio-Oscuro',
      description: 'Tono de piel medio-oscuro',
      price: 0,
      assetUrl: null,
      colorValue: '#C68642',
      default: true,
      featured: false,
      active: true,
    },
    {
      id: 'skin_dark',
      name: 'Piel Oscura',
      description: 'Tono de piel oscuro',
      price: 0,
      assetUrl: null,
      colorValue: '#8D5524',
      default: true,
      featured: false,
      active: true,
    },
  ],

  // Categoría: Forma de cara
  face_shape: [
    // Agregar items aquí
  ],

  // Categoría: Ojos
  eyes: [
    // Agregar items aquí
  ],

  // Categoría: Nariz
  nose: [
    // Agregar items aquí
  ],

  // Categoría: Boca
  mouth: [
    // Agregar items aquí
  ],

  // Categoría: Orejas
  ears: [
    // Agregar items aquí
  ],

  // Categoría: Cabello
  hair: [
    // Agregar items aquí
  ],

  // Categoría: Alias/Apodos
  alias: [
    {
      id: 'alias_water_warrior',
      name: 'Guerrero del Agua',
      description: 'Apodo épico para los defensores del agua',
      price: 15,
      assetUrl: null, // Los aliases no tienen imagen
      default: false,
      featured: false,
      active: true,
    },
    {
      id: 'alias_hydration_hero',
      name: 'Héroe de la Hidratación',
      description: 'Para los que siempre se mantienen hidratados',
      price: 15,
      assetUrl: null, // Los aliases no tienen imagen
      default: false,
      featured: false,
      active: true,
    },
  ],
};

/**
 * Categorías válidas de la tienda
 */
export const VALID_CATEGORIES = Object.keys(STORE_ITEMS);

/**
 * Obtener todos los items aplanados (con categoría incluida)
 */
export const getAllItems = () => {
  const items = [];
  for (const [category, categoryItems] of Object.entries(STORE_ITEMS)) {
    for (const item of categoryItems) {
      items.push({
        ...item,
        category,
        storeItemId: item.id, // Para compatibilidad
      });
    }
  }
  return items;
};

/**
 * Obtener items por categoría
 */
export const getItemsByCategory = (category) => {
  return STORE_ITEMS[category] || [];
};

/**
 * Obtener item por ID (busca en todas las categorías)
 */
export const getItemById = (itemId) => {
  for (const [category, categoryItems] of Object.entries(STORE_ITEMS)) {
    const item = categoryItems.find(item => item.id === itemId);
    if (item) {
      return {
        ...item,
        category,
        storeItemId: item.id,
      };
    }
  }
  return null;
};

