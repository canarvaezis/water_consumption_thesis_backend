/**
 * Servicio de Tienda
 * 
 * Lógica de negocio para gestionar la tienda, compras e inventario
 */

import { StoreItemModel } from '../models/store-item.model.js';
import { StoreCategoryModel } from '../models/store-category.model.js';
import { InventoryModel } from '../models/inventory.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { WalletTransactionModel } from '../models/wallet-transaction.model.js';
import { UserModel } from '../models/user.model.js';
import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class StoreService {
  /**
   * Obtener todas las categorías de tienda
   */
  static async getCategories() {
    const categories = await StoreCategoryModel.findAll();
    return categories;
  }

  /**
   * Obtener categoría por ID
   */
  static async getCategoryById(categoryId) {
    const category = await StoreCategoryModel.findById(categoryId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }
    return category;
  }

  /**
   * Obtener todos los items de tienda con paginación
   * Incluye información de si el usuario los tiene en su inventario
   */
  static async getItems(userId, options = {}) {
    const { 
      limit = 50, 
      category = null, 
      activeOnly = true,
      startAfter = null 
    } = options;

    const items = await StoreItemModel.findAll({ 
      activeOnly, 
      limit, 
      category 
    });
    
    // Obtener inventario del usuario
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));

    return items.map(item => ({
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      svgContent: item.svgContent || null,
      colorValue: item.colorValue || null,
      default: item.default || false,
      featured: item.featured || false,
      active: item.active !== undefined ? item.active : true,
      createdAt: item.createdAt,
      owned: item.default || false || ownedItemIds.has(item.id),
    }));
  }

  /**
   * Obtener item por ID
   * Incluye información de si el usuario lo tiene en su inventario
   */
  static async getItemById(userId, itemId) {
    const item = await StoreItemModel.findById(itemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    let owned = item.default || false;

    owned = owned || await InventoryModel.hasItem(userId, itemId);

    return {
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      svgContent: item.svgContent || null,
      colorValue: item.colorValue || null,
      default: item.default || false,
      createdAt: item.createdAt,
      owned,
    };
  }

  /**
   * Obtener items por categoría
   * @param {string} userId - ID del usuario
   * @param {string} category - Categoría de personalización (skin_color, face_shape, eyes, etc.)
   */
  static async getItemsByCategory(userId, category) {
    // Validar categoría
    const validCategories = ['skin_color', 'face_shape', 'eyes', 'nose', 'mouth', 'ears', 'hair', 'alias'];
    if (!validCategories.includes(category)) {
      // Intentar buscar por storeCategoryId (compatibilidad)
      const categoryDoc = await StoreCategoryModel.findById(category);
      if (categoryDoc && categoryDoc.name) {
        const categoryName = categoryDoc.name.toLowerCase();
        if (validCategories.includes(categoryName)) {
          category = categoryName;
        } else {
          throw new Error(`Categoría inválida: ${category}`);
        }
      } else {
        throw new Error(`Categoría inválida: ${category}`);
      }
    }

    const items = await StoreItemModel.findByCategory(category, { activeOnly: true });
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));

    return items.map(item => ({
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      svgContent: item.svgContent || null,
      colorValue: item.colorValue || null,
      default: item.default || false,
      featured: item.featured || false,
      active: item.active !== undefined ? item.active : true,
      createdAt: item.createdAt,
      owned: item.default || false || ownedItemIds.has(item.id),
    }));
  }

  /**
   * Comprar un item de la tienda (TRANSACCIÓN ATÓMICA)
   * Verifica balance, descuenta puntos y agrega al inventario usando batch
   */
  static async purchaseItem(userId, storeItemId) {
    // Verificar que el item existe y está activo
    const item = await StoreItemModel.findById(storeItemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    if (!item.active) {
      throw new Error('Este item no está disponible para compra');
    }

    // Obtener o crear wallet
    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId, 0);
    }

    // Verificar si ya lo tiene
    const hasItem = await InventoryModel.hasItem(userId, storeItemId);
    if (hasItem) {
      throw new Error('Ya tienes este item en tu inventario');
    }

    // Si es un item por defecto (gratis), agregarlo directamente al inventario
    if (item.default || (item.price === 0 || !item.price)) {
      const inventoryItem = await InventoryModel.addItem(userId, wallet.id, storeItemId);
      
      return {
        item: {
          id: item.id,
          name: item.name,
          category: item.category,
        },
        inventory: inventoryItem,
        wallet: {
          balance: wallet.balance,
        },
        pointsSpent: 0,
      };
    }

    // Verificar que el item tiene precio válido
    if (!item.price || item.price <= 0) {
      throw new Error('Este item no está disponible para compra');
    }

    // Verificar balance suficiente
    if (wallet.balance < item.price) {
      throw new Error('Saldo insuficiente');
    }

    // TRANSACCIÓN ATÓMICA usando batch
    const batch = db.batch();
    const now = Timestamp.now();

    // 1. Actualizar balance del wallet
    const walletRef = db
      .collection('users')
      .doc(userId)
      .collection('wallet')
      .doc(wallet.id);
    
    const newBalance = wallet.balance - item.price;
    batch.update(walletRef, {
      balance: newBalance,
      updatedAt: now,
    });

    // 2. Agregar al inventario
    const inventoryRef = db
      .collection('users')
      .doc(userId)
      .collection('inventory')
      .doc();
    
    batch.set(inventoryRef, {
      inventoryId: inventoryRef.id,
      walletId: wallet.id,
      storeItemId: storeItemId,
      purchasedAt: now,
    });

    // 3. Registrar transacción
    const transactionRef = db
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .doc();
    
    batch.set(transactionRef, {
      transactionId: transactionRef.id,
      walletId: wallet.id,
      type: 'purchase',
      amount: -item.price,
      description: `Compra de ${item.name}`,
      storeItemId: storeItemId,
      createdAt: now,
    });

    // Ejecutar todas las operaciones atómicamente
    await batch.commit();

    // Obtener los documentos creados
    const inventoryDoc = await inventoryRef.get();
    const transactionDoc = await transactionRef.get();

    return {
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
      },
      inventory: {
        id: inventoryDoc.id,
        ...inventoryDoc.data(),
      },
      wallet: {
        id: wallet.id,
        balance: newBalance,
      },
      pointsSpent: item.price,
      transaction: {
        id: transactionDoc.id,
        ...transactionDoc.data(),
      },
    };
  }

  /**
   * Obtener inventario completo del usuario
   */
  static async getUserInventory(userId) {
    const wallet = await WalletModel.findByUserId(userId);
    
    if (!wallet) {
      return {
        inventory: [],
        items: [],
      };
    }

    const inventory = await InventoryModel.getInventoryByUserId(userId);
    
    // Obtener detalles de los items
    const items = await Promise.all(
      inventory.map(async (invItem) => {
        const item = await StoreItemModel.findById(invItem.storeItemId);
        if (!item) return null;
        
        return {
          inventoryId: invItem.id,
          storeItemId: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          assetUrl: item.assetUrl || item.asset_url,
          svgContent: item.svgContent || null,
          colorValue: item.colorValue || null,
          price: item.price || 0,
          purchasedAt: invItem.purchasedAt,
        };
      })
    );

    // Filtrar items nulos
    const validItems = items.filter(item => item !== null);

    return {
      inventory,
      items: validItems,
    };
  }

  /**
   * Verificar si el usuario tiene un item específico
   */
  static async hasItem(userId, storeItemId) {
    const wallet = await WalletModel.findByUserId(userId);
    
    if (!wallet) {
      // Verificar si es un item por defecto
      const item = await StoreItemModel.findById(storeItemId);
      return item ? (item.default || false) : false;
    }

    const hasItem = await InventoryModel.hasItem(userId, storeItemId);
    if (hasItem) {
      return true;
    }

    // Verificar si es un item por defecto
    const item = await StoreItemModel.findById(storeItemId);
    return item ? (item.default || false) : false;
  }

  /**
   * Obtener items destacados
   * Retorna items con featured: true o los más caros si no hay featured
   */
  static async getFeaturedItems(userId, limit = 10) {
    const items = await StoreItemModel.findAll({ activeOnly: true });
    
    // Filtrar items destacados (featured: true)
    let featuredItems = items.filter(item => item.featured === true);
    
    // Si no hay suficientes items destacados, agregar los más caros
    if (featuredItems.length < limit) {
      const expensiveItems = items
        .filter(item => !item.default && item.price > 0 && !item.featured)
        .sort((a, b) => (b.price || 0) - (a.price || 0))
        .slice(0, limit - featuredItems.length);
      
      featuredItems = [...featuredItems, ...expensiveItems];
    }
    
    // Limitar resultados
    featuredItems = featuredItems.slice(0, limit);
    
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));

    return featuredItems.map(item => ({
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      svgContent: item.svgContent || null,
      colorValue: item.colorValue || null,
      default: item.default || false,
      featured: item.featured || false,
      active: item.active !== undefined ? item.active : true,
      createdAt: item.createdAt,
      owned: item.default || false || ownedItemIds.has(item.id),
    }));
  }

  /**
   * Obtener historial de transacciones
   */
  static async getTransactions(userId, options = {}) {
    const wallet = await WalletModel.findByUserId(userId);
    
    if (!wallet) {
      return {
        transactions: [],
        summary: {
          totalEarned: 0,
          totalSpent: 0,
          netAmount: 0,
          transactionCount: 0,
          transactionsByType: {},
        },
      };
    }

    const transactions = await WalletTransactionModel.getTransactions(userId, options);
    const summary = await WalletTransactionModel.getTransactionSummary(userId);

    return {
      transactions,
      summary,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
      },
    };
  }

  /**
   * Agregar puntos a la billetera (admin/testing)
   */
  static async addPoints(userId, points, description = 'Puntos agregados por administrador') {
    if (points <= 0) {
      throw new Error('Los puntos deben ser un número positivo');
    }

    // Obtener o crear wallet
    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId, 0);
    }

    // Agregar puntos
    const updatedWallet = await WalletModel.addPoints(userId, wallet.id, points);

    // Registrar transacción
    const transaction = await WalletTransactionModel.create(userId, wallet.id, {
      type: 'admin_add',
      amount: points,
      description,
    });

    return {
      wallet: {
        id: updatedWallet.id,
        balance: updatedWallet.balance,
      },
      pointsAdded: points,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
      },
    };
  }
}

