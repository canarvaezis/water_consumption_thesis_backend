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
  // Categoría: Color de piel
  skin_color: [
    // Ejemplo de estructura (eliminar cuando agregues los reales):
    // {
    //   id: 'skin_light',
    //   name: 'Piel Clara',
    //   description: 'Tono de piel claro',
    //   price: 0,
    //   assetUrl: 'https://firebasestorage.googleapis.com/.../skin_light.png',
    //   default: true,
    //   featured: false,
    //   active: true,
    // },
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
    // Agregar items aquí
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

