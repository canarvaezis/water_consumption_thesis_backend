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
   * Obtener todos los items de tienda
   * Incluye información de si el usuario los tiene en su inventario
   */
  static async getItems(userId) {
    const items = await StoreItemModel.findAll();
    const wallet = await WalletModel.findByUserId(userId);
    
    // Si el usuario no tiene wallet, solo retornar items sin info de inventario
    if (!wallet) {
      return items.map(item => ({
        id: item.id,
        storeItemId: item.storeItemId || item.id,
        storeCategoryId: item.storeCategoryId,
        category: item.category,
        name: item.name,
        description: item.description,
        price: item.price || 0,
        assetUrl: item.assetUrl || item.asset_url,
        default: item.default || false,
        createdAt: item.createdAt,
        owned: item.default || false,
      }));
    }

    // Obtener inventario del usuario
    const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
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
      default: item.default || false,
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

    const wallet = await WalletModel.findByUserId(userId);
    let owned = item.default || false;

    if (wallet) {
      owned = owned || await InventoryModel.hasItem(userId, wallet.id, itemId);
    }

    return {
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      default: item.default || false,
      createdAt: item.createdAt,
      owned,
    };
  }

  /**
   * Obtener items por categoría
   */
  static async getItemsByCategory(userId, categoryId) {
    // Primero intentar buscar por storeCategoryId
    let items = await StoreItemModel.findByCategoryId(categoryId);
    
    // Si no hay resultados, buscar por category (avatar/nickname)
    if (items.length === 0) {
      const category = await StoreCategoryModel.findById(categoryId);
      if (category && category.name) {
        // Asumir que el nombre de la categoría puede ser "avatar" o "nickname"
        const categoryName = category.name.toLowerCase();
        if (categoryName === 'avatar' || categoryName === 'nickname') {
          items = await StoreItemModel.findByCategory(categoryName);
        }
      }
    }

    const wallet = await WalletModel.findByUserId(userId);
    let ownedItemIds = new Set();

    if (wallet) {
      const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
      ownedItemIds = new Set(inventory.map(item => item.storeItemId));
    }

    return items.map(item => ({
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      default: item.default || false,
      createdAt: item.createdAt,
      owned: item.default || false || ownedItemIds.has(item.id),
    }));
  }

  /**
   * Comprar un item de la tienda
   * Verifica balance, descuenta puntos y agrega al inventario
   */
  static async purchaseItem(userId, storeItemId) {
    // Verificar que el item existe
    const item = await StoreItemModel.findById(storeItemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    // Si es un item por defecto (gratis), agregarlo directamente al inventario
    if (item.default || (item.price === 0 || !item.price)) {
      // Obtener o crear wallet
      let wallet = await WalletModel.findByUserId(userId);
      if (!wallet) {
        wallet = await WalletModel.create(userId, 0);
      }

      // Verificar si ya lo tiene
      const hasItem = await InventoryModel.hasItem(userId, wallet.id, storeItemId);
      if (hasItem) {
        throw new Error('Ya tienes este item en tu inventario');
      }

      // Agregar al inventario
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

    // Verificar que el item tiene precio
    if (!item.price || item.price <= 0) {
      throw new Error('Este item no está disponible para compra');
    }

    // Obtener o crear wallet
    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId, 0);
    }

    // Verificar balance suficiente
    if (wallet.balance < item.price) {
      throw new Error('Saldo insuficiente');
    }

    // Verificar si ya lo tiene
    const hasItem = await InventoryModel.hasItem(userId, wallet.id, storeItemId);
    if (hasItem) {
      throw new Error('Ya tienes este item en tu inventario');
    }

    // Descontar puntos
    const updatedWallet = await WalletModel.subtractPoints(userId, wallet.id, item.price);

    // Agregar al inventario
    const inventoryItem = await InventoryModel.addItem(userId, wallet.id, storeItemId);

    // Registrar transacción
    const transaction = await WalletTransactionModel.create(userId, wallet.id, {
      type: 'purchase',
      amount: -item.price, // Negativo porque es un gasto
      description: `Compra de ${item.name}`,
      storeItemId: storeItemId,
    });

    return {
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
      },
      inventory: inventoryItem,
      wallet: {
        balance: updatedWallet.balance,
      },
      pointsSpent: item.price,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
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

    const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
    
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

    const hasItem = await InventoryModel.hasItem(userId, wallet.id, storeItemId);
    if (hasItem) {
      return true;
    }

    // Verificar si es un item por defecto
    const item = await StoreItemModel.findById(storeItemId);
    return item ? (item.default || false) : false;
  }

  /**
   * Obtener items destacados
   * Por ahora retorna items con precio > 0 ordenados por precio (más caros primero)
   * O se puede usar un campo "featured" en el futuro
   */
  static async getFeaturedItems(userId) {
    const items = await StoreItemModel.findAll();
    const wallet = await WalletModel.findByUserId(userId);
    
    // Filtrar items destacados (por ahora: precio > 0, no default)
    // En el futuro se puede agregar un campo "featured: true" en el modelo
    const featuredItems = items
      .filter(item => !item.default && item.price > 0)
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 10); // Top 10 items más caros como destacados
    
    let ownedItemIds = new Set();
    if (wallet) {
      const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
      ownedItemIds = new Set(inventory.map(item => item.storeItemId));
    }

    return featuredItems.map(item => ({
      id: item.id,
      storeItemId: item.storeItemId || item.id,
      storeCategoryId: item.storeCategoryId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      assetUrl: item.assetUrl || item.asset_url,
      default: item.default || false,
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

    const transactions = await WalletTransactionModel.getTransactions(userId, wallet.id, options);
    const summary = await WalletTransactionModel.getTransactionSummary(userId, wallet.id);

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

