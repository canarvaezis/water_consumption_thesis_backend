/**
 * Servicio de Datos de Consumo
 * 
 * Maneja el cache en memoria de items, grifos y categorías
 * para evitar consultas a la base de datos
 */

import { CONSUMPTION_ITEMS } from '../config/consumption-items.js';
import { FAUCET_TYPES } from '../config/faucet-types.js';
import { CONSUMPTION_CATEGORIES } from '../config/consumption-categories.js';

class ConsumptionDataService {
  constructor() {
    this.items = new Map();
    this.faucetTypes = new Map();
    this.categories = new Map();
    this.itemFaucetRelations = new Map();
    
    this.initialize();
  }
  
  /**
   * Inicializar cache en memoria
   */
  initialize() {
    // Cargar items
    CONSUMPTION_ITEMS.forEach(item => {
      this.items.set(item.id, item);
    });
    
    // Cargar tipos de grifo
    FAUCET_TYPES.forEach(faucet => {
      this.faucetTypes.set(faucet.id, faucet);
    });
    
    // Cargar categorías
    CONSUMPTION_CATEGORIES.forEach(category => {
      this.categories.set(category.id, category);
    });
    
    // Pre-calcular relaciones item ↔ grifo
    CONSUMPTION_ITEMS.forEach(item => {
      const compatibleFaucets = item.compatibleFaucetTypeIds
        .map(id => this.faucetTypes.get(id))
        .filter(Boolean);
      this.itemFaucetRelations.set(item.id, compatibleFaucets);
    });
  }
  
  /**
   * Obtener item por ID
   */
  getItemById(id) {
    return this.items.get(id) || null;
  }
  
  /**
   * Obtener item por nombre (búsqueda flexible)
   */
  getItemByName(name) {
    const normalized = name.toLowerCase().trim();
    
    // Búsqueda exacta
    for (const item of this.items.values()) {
      if (item.name.toLowerCase() === normalized) {
        return item;
      }
    }
    
    // Búsqueda parcial
    const matches = [];
    for (const item of this.items.values()) {
      if (item.name.toLowerCase().includes(normalized) || 
          normalized.includes(item.name.toLowerCase())) {
        matches.push(item);
      }
    }
    
    // Si hay una sola coincidencia, devolverla
    if (matches.length === 1) {
      return matches[0];
    }
    
    // Si hay múltiples, devolver null (el llamador puede usar matches)
    return null;
  }
  
  /**
   * Buscar items por nombre (puede devolver múltiples)
   */
  searchItemsByName(name) {
    const normalized = name.toLowerCase().trim();
    const matches = [];
    
    for (const item of this.items.values()) {
      if (item.name.toLowerCase().includes(normalized) || 
          normalized.includes(item.name.toLowerCase())) {
        matches.push(item);
      }
    }
    
    return matches;
  }
  
  /**
   * Obtener tipo de grifo por ID
   */
  getFaucetTypeById(id) {
    return this.faucetTypes.get(id) || null;
  }
  
  /**
   * Obtener tipo de grifo por nombre
   */
  getFaucetTypeByName(name) {
    const normalized = name.toLowerCase().trim();
    
    // Búsqueda exacta
    for (const faucet of this.faucetTypes.values()) {
      if (faucet.name.toLowerCase() === normalized) {
        return faucet;
      }
    }
    
    // Búsqueda parcial
    for (const faucet of this.faucetTypes.values()) {
      if (faucet.name.toLowerCase().includes(normalized) || 
          normalized.includes(faucet.name.toLowerCase())) {
        return faucet;
      }
    }
    
    return null;
  }
  
  /**
   * Obtener grifos compatibles para un item
   */
  getCompatibleFaucetsForItem(itemId) {
    return this.itemFaucetRelations.get(itemId) || [];
  }
  
  /**
   * Validar compatibilidad entre item y grifo
   */
  validateItemFaucetCompatibility(itemId, faucetTypeId) {
    const item = this.getItemById(itemId);
    if (!item) {
      return { 
        valid: false, 
        reason: 'Item no encontrado',
        item: null,
        compatibleFaucets: []
      };
    }
    
    const isCompatible = item.compatibleFaucetTypeIds.includes(faucetTypeId);
    const compatibleFaucets = this.getCompatibleFaucetsForItem(itemId);
    const defaultFaucet = this.getFaucetTypeById(item.defaultFaucetTypeId);
    
    return {
      valid: isCompatible,
      item,
      compatibleFaucets,
      defaultFaucet,
      selectedFaucet: this.getFaucetTypeById(faucetTypeId)
    };
  }
  
  /**
   * Obtener categoría por ID
   */
  getCategoryById(categoryId) {
    return this.categories.get(categoryId) || null;
  }
  
  /**
   * Obtener todos los datos (para endpoint de datos)
   */
  getAllData() {
    return {
      items: Array.from(this.items.values()),
      faucetTypes: Array.from(this.faucetTypes.values()).filter(f => f.isActive),
      categories: Array.from(this.categories.values())
    };
  }
  
  /**
   * Obtener contexto completo de un item (para endpoint de contexto)
   */
  getItemContext(itemId) {
    const item = this.getItemById(itemId);
    if (!item) {
      return null;
    }
    
    const category = this.getCategoryById(item.categoryId);
    const compatibleFaucets = this.getCompatibleFaucetsForItem(itemId);
    const defaultFaucet = this.getFaucetTypeById(item.defaultFaucetTypeId);
    
    // Calcular litros estimados para cada preset
    const estimatedLiters = {};
    if (defaultFaucet) {
      Object.entries(item.durationPresets).forEach(([preset, duration]) => {
        const totalMinutes = duration.minutes + (duration.seconds / 60);
        estimatedLiters[preset] = totalMinutes * defaultFaucet.litersPerMinute;
      });
    }
    
    return {
      item: {
        ...item,
        category
      },
      compatibleFaucetTypes: compatibleFaucets.map(faucet => ({
        id: faucet.id,
        name: faucet.name,
        description: faucet.description,
        litersPerMinute: faucet.litersPerMinute,
        isRecommended: faucet.id === item.defaultFaucetTypeId
      })),
      defaultFaucetType: defaultFaucet ? {
        id: defaultFaucet.id,
        name: defaultFaucet.name
      } : null,
      durationPresets: item.durationPresets,
      estimatedLiters
    };
  }
}

// Singleton - una sola instancia en toda la app
export const consumptionDataService = new ConsumptionDataService();
