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
    {
      id: 'skin_light',
      name: 'Piel Clara',
      description: 'Tono de piel claro',
      price: 0,
      assetUrl: null,
      colorValue: '#FFDBAC',
      default: true,
      featured: false,
      active: true,
    },
    {
      id: 'skin_medium_light',
      name: 'Piel Medio-Clara',
      description: 'Tono de piel medio-claro',
      price: 0,
      assetUrl: null,
      colorValue: '#E8A99B',
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
      colorValue: '#D99A8B',
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
      colorValue: '#C88A7B',
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
      colorValue: '#8B5A3C',
      default: true,
      featured: false,
      active: true,
    },
  ],

  // Categoría: Forma de cara
  face_shape: [
    {
      id: 'base_face_circle',
      name: 'Cara Base',
      description: 'Cara redonda base que puedes personalizar con color de piel',
      price: 0,
      assetUrl: null, // SVG embebido en svgContent
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="90" fill="currentColor" stroke="#E0E0E0" stroke-width="2"/></svg>',
      default: true,
      featured: true,
      active: true,
    },
  ],

  // Categoría: Ojos
  eyes: [
    {
      id: 'eyes_round',
      name: 'Ojos Redondos',
      description: 'Ojos redondos simples y expresivos',
      price: 0,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="75" r="8" fill="#333"/><circle cx="125" cy="75" r="8" fill="#333"/><circle cx="75" cy="75" r="4" fill="#fff"/><circle cx="125" cy="75" r="4" fill="#fff"/></svg>',
      default: true,
      featured: true,
      active: true,
    },
    {
      id: 'eyes_oval',
      name: 'Ojos Ovalados',
      description: 'Ojos en forma ovalada',
      price: 10,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="75" cy="75" rx="10" ry="8" fill="#333"/><ellipse cx="125" cy="75" rx="10" ry="8" fill="#333"/><ellipse cx="75" cy="75" rx="5" ry="4" fill="#fff"/><ellipse cx="125" cy="75" rx="5" ry="4" fill="#fff"/></svg>',
      default: false,
      featured: false,
      active: true,
    },
    {
      id: 'eyes_happy',
      name: 'Ojos Sonrientes',
      description: 'Ojos felices y alegres',
      price: 15,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 70 75 Q 75 70 80 75" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 120 75 Q 125 70 130 75" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="75" cy="72" r="3" fill="#333"/><circle cx="125" cy="72" r="3" fill="#333"/></svg>',
      default: false,
      featured: false,
      active: true,
    },
    {
      id: 'eyes_big',
      name: 'Ojos Grandes',
      description: 'Ojos grandes y expresivos',
      price: 20,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="75" r="12" fill="#333"/><circle cx="125" cy="75" r="12" fill="#333"/><circle cx="75" cy="75" r="6" fill="#fff"/><circle cx="125" cy="75" r="6" fill="#fff"/><circle cx="77" cy="73" r="2" fill="#333"/><circle cx="127" cy="73" r="2" fill="#333"/></svg>',
      default: false,
      featured: true,
      active: true,
    },
    {
      id: 'eyes_small',
      name: 'Ojos Pequeños',
      description: 'Ojos pequeños y discretos',
      price: 10,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="75" r="5" fill="#333"/><circle cx="125" cy="75" r="5" fill="#333"/><circle cx="75" cy="75" r="2" fill="#fff"/><circle cx="125" cy="75" r="2" fill="#fff"/></svg>',
      default: false,
      featured: false,
      active: true,
    },
    {
      id: 'eyes_wink',
      name: 'Ojo Guiño',
      description: 'Un ojo abierto y otro cerrado',
      price: 25,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="75" r="8" fill="#333"/><circle cx="75" cy="75" r="4" fill="#fff"/><path d="M 120 75 Q 125 70 130 75" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      default: false,
      featured: true,
      active: true,
    },
  ],

  // Categoría: Nariz
  nose: [],

  // Categoría: Boca
  mouth: [
    {
      id: 'mouth_smile',
      name: 'Sonrisa Simple',
      description: 'Sonrisa suave y amigable',
      price: 0,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 70 140 Q 100 160 130 140" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      default: true,
      featured: true,
      active: true,
    },
    {
      id: 'mouth_big_smile',
      name: 'Sonrisa Amplia',
      description: 'Sonrisa grande y alegre',
      price: 15,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 60 135 Q 100 165 140 135" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
      default: false,
      featured: true,
      active: true,
    },
    {
      id: 'mouth_straight',
      name: 'Boca Recta',
      description: 'Boca neutra y seria',
      price: 10,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><line x1="70" y1="140" x2="130" y2="140" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>',
      default: false,
      featured: false,
      active: true,
    },
    {
      id: 'mouth_small',
      name: 'Boca Pequeña',
      description: 'Boca pequeña y discreta',
      price: 10,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 85 145 Q 100 150 115 145" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
      default: false,
      featured: false,
      active: true,
    },
    {
      id: 'mouth_open',
      name: 'Boca Abierta',
      description: 'Boca abierta sonriendo',
      price: 20,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 70 140 Q 100 155 130 140" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="150" rx="15" ry="8" fill="#333" opacity="0.3"/></svg>',
      default: false,
      featured: true,
      active: true,
    },
    {
      id: 'mouth_sad',
      name: 'Boca Triste',
      description: 'Boca hacia abajo',
      price: 10,
      assetUrl: null,
      svgContent: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 70 140 Q 100 120 130 140" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      default: false,
      featured: false,
      active: true,
    },
  ],

  // Categoría: Orejas
  ears: [],

  // Categoría: Cabello
  hair: [],

  // Categoría: Alias/Apodos
  alias: [],
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

