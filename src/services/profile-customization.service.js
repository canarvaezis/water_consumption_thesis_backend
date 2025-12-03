/**
 * Servicio de Personalización de Perfil
 * 
 * Lógica de negocio para gestionar avatares y nicknames del usuario
 */

import { StoreItemModel } from '../models/store-item.model.js';
import { InventoryModel } from '../models/inventory.model.js';
import { UserModel } from '../models/user.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { PointsService } from './points.service.js';

export class ProfileCustomizationService {
  /**
   * Obtener todos los avatares disponibles
   * Incluye información de si el usuario los tiene en su inventario
   */
  static async getAvailableAvatars(userId) {
    const avatars = await StoreItemModel.findByCategory('avatar');
    const wallet = await WalletModel.findByUserId(userId);
    
    // Si el usuario no tiene wallet, solo retornar avatares sin info de inventario
    if (!wallet) {
      return avatars.map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        description: avatar.description,
        asset_url: avatar.asset_url || avatar.assetUrl,
        price: avatar.price || 0,
        default: avatar.default || false,
        category: avatar.category,
        owned: avatar.default || false, // Los items por defecto se consideran "owned"
      }));
    }

    // Obtener inventario del usuario
    const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));

    return avatars.map(avatar => ({
      id: avatar.id,
      name: avatar.name,
      description: avatar.description,
      asset_url: avatar.asset_url || avatar.assetUrl,
      price: avatar.price || 0,
      default: avatar.default || false,
      category: avatar.category,
      owned: avatar.default || false || ownedItemIds.has(avatar.id),
    }));
  }

  /**
   * Obtener todos los nicknames disponibles
   * Incluye información de si el usuario los tiene en su inventario
   */
  static async getAvailableNicknames(userId) {
    const nicknames = await StoreItemModel.findByCategory('nickname');
    const wallet = await WalletModel.findByUserId(userId);
    
    // Si el usuario no tiene wallet, solo retornar nicknames sin info de inventario
    if (!wallet) {
      return nicknames.map(nickname => ({
        id: nickname.id,
        name: nickname.name,
        description: nickname.description,
        price: nickname.price || 0,
        default: nickname.default || false,
        category: nickname.category,
        owned: nickname.default || false,
      }));
    }

    // Obtener inventario del usuario
    const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));

    return nicknames.map(nickname => ({
      id: nickname.id,
      name: nickname.name,
      description: nickname.description,
      price: nickname.price || 0,
      default: nickname.default || false,
      category: nickname.category,
      owned: nickname.default || false || ownedItemIds.has(nickname.id),
    }));
  }

  /**
   * Aplicar avatar al perfil del usuario
   * Verifica que el usuario tenga el item en su inventario o que sea un item por defecto
   */
  static async applyAvatar(userId, storeItemId) {
    // Verificar que el item existe y es un avatar
    const item = await StoreItemModel.findById(storeItemId);
    
    if (!item) {
      throw new Error('Item no encontrado');
    }

    if (item.category !== 'avatar') {
      throw new Error('El item no es un avatar');
    }

    // Verificar que el usuario tiene el item o es un item por defecto
    const wallet = await WalletModel.findByUserId(userId);
    
    if (!item.default && wallet) {
      const hasItem = await InventoryModel.hasItem(userId, wallet.id, storeItemId);
      if (!hasItem) {
        throw new Error('No tienes este avatar en tu inventario');
      }
    }

    // Obtener usuario actual para verificar si es primera vez
    const currentUser = await UserModel.findById(userId);
    
    // Aplicar avatar al perfil
    const avatarUrl = item.asset_url || item.assetUrl;
    const updatedUser = await UserModel.update(userId, {
      avatarUrl,
    });

    // Verificar si es la primera vez que se configura un avatar (antes era null)
    if (!currentUser.avatarUrl) {
      // Otorgar puntos por configurar avatar (solo una vez)
      await PointsService.awardAvatarSetPoints(userId);
    }

    return {
      user: updatedUser,
      avatar: {
        id: item.id,
        name: item.name,
        asset_url: avatarUrl,
      },
    };
  }

  /**
   * Aplicar nickname al perfil del usuario
   * Verifica que el usuario tenga el item en su inventario o que sea un item por defecto
   */
  static async applyNickname(userId, storeItemId) {
    // Verificar que el item existe y es un nickname
    const item = await StoreItemModel.findById(storeItemId);
    
    if (!item) {
      throw new Error('Item no encontrado');
    }

    if (item.category !== 'nickname') {
      throw new Error('El item no es un nickname');
    }

    // Verificar que el usuario tiene el item o es un item por defecto
    const wallet = await WalletModel.findByUserId(userId);
    
    if (!item.default && wallet) {
      const hasItem = await InventoryModel.hasItem(userId, wallet.id, storeItemId);
      if (!hasItem) {
        throw new Error('No tienes este nickname en tu inventario');
      }
    }

    // Obtener usuario actual para verificar si es primera vez
    const currentUser = await UserModel.findById(userId);
    
    // Aplicar nickname al perfil
    const nickname = item.name;
    const updatedUser = await UserModel.update(userId, {
      nickname,
    });

    // Verificar si es la primera vez que se configura un nickname (antes era null)
    if (!currentUser.nickname) {
      // Otorgar puntos por configurar nickname (solo una vez)
      await PointsService.awardNicknameSetPoints(userId);
    }

    return {
      user: updatedUser,
      nickname: {
        id: item.id,
        name: item.name,
      },
    };
  }

  /**
   * Obtener inventario del usuario (avatares y nicknames que posee)
   */
  static async getUserInventory(userId) {
    const wallet = await WalletModel.findByUserId(userId);
    
    if (!wallet) {
      return {
        avatars: [],
        nicknames: [],
      };
    }

    const inventory = await InventoryModel.getInventoryByWalletId(userId, wallet.id);
    
    // Obtener todos los items por defecto
    const allAvatars = await StoreItemModel.findByCategory('avatar');
    const allNicknames = await StoreItemModel.findByCategory('nickname');
    
    const defaultAvatars = allAvatars.filter(a => a.default).map(a => a.id);
    const defaultNicknames = allNicknames.filter(n => n.default).map(n => n.id);
    
    // Combinar items del inventario con items por defecto
    const ownedItemIds = new Set([
      ...inventory.map(item => item.storeItemId),
      ...defaultAvatars,
      ...defaultNicknames,
    ]);

    // Obtener detalles de los items
    const ownedItems = await Promise.all(
      Array.from(ownedItemIds).map(id => StoreItemModel.findById(id))
    );

    const avatars = ownedItems
      .filter(item => item && item.category === 'avatar')
      .map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        asset_url: item.asset_url || item.assetUrl,
        price: item.price || 0,
        default: item.default || false,
      }));

    const nicknames = ownedItems
      .filter(item => item && item.category === 'nickname')
      .map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price || 0,
        default: item.default || false,
      }));

    return {
      avatars,
      nicknames,
    };
  }
}

