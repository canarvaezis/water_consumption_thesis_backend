/**
 * Controlador de Personalización de Perfil
 * 
 * Maneja las peticiones HTTP relacionadas con avatares y nicknames
 */

import { ProfileCustomizationService } from '../services/profile-customization.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class ProfileCustomizationController {
  /**
   * Obtener avatares disponibles
   * GET /api/profile/avatars
   */
  static getAvatars = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const avatars = await ProfileCustomizationService.getAvailableAvatars(userId);
    
    res.json({
      success: true,
      data: { avatars },
    });
  });

  /**
   * Obtener nicknames disponibles
   * GET /api/profile/nicknames
   */
  static getNicknames = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const nicknames = await ProfileCustomizationService.getAvailableNicknames(userId);
    
    res.json({
      success: true,
      data: { nicknames },
    });
  });

  /**
   * Aplicar avatar al perfil
   * PUT /api/profile/avatar
   */
  static applyAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { storeItemId } = req.body;
    
    if (!storeItemId) {
      return res.status(400).json({
        success: false,
        message: 'storeItemId es requerido',
      });
    }
    
    const result = await ProfileCustomizationService.applyAvatar(userId, storeItemId);
    
    // Convertir Timestamps a fechas legibles
    const userData = {
      ...result.user,
      createdAt: result.user.createdAt?.toDate 
        ? result.user.createdAt.toDate() 
        : result.user.createdAt,
      updatedAt: result.user.updatedAt?.toDate 
        ? result.user.updatedAt.toDate() 
        : result.user.updatedAt,
    };
    
    res.json({
      success: true,
      message: 'Avatar aplicado exitosamente',
      data: {
        user: userData,
        avatar: result.avatar,
      },
    });
  });

  /**
   * Aplicar nickname al perfil
   * PUT /api/profile/nickname
   */
  static applyNickname = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { storeItemId } = req.body;
    
    if (!storeItemId) {
      return res.status(400).json({
        success: false,
        message: 'storeItemId es requerido',
      });
    }
    
    const result = await ProfileCustomizationService.applyNickname(userId, storeItemId);
    
    // Convertir Timestamps a fechas legibles
    const userData = {
      ...result.user,
      createdAt: result.user.createdAt?.toDate 
        ? result.user.createdAt.toDate() 
        : result.user.createdAt,
      updatedAt: result.user.updatedAt?.toDate 
        ? result.user.updatedAt.toDate() 
        : result.user.updatedAt,
    };
    
    res.json({
      success: true,
      message: 'Nickname aplicado exitosamente',
      data: {
        user: userData,
        nickname: result.nickname,
      },
    });
  });

  /**
   * Obtener inventario del usuario
   * GET /api/profile/inventory
   */
  static getInventory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const inventory = await ProfileCustomizationService.getUserInventory(userId);
    
    res.json({
      success: true,
      data: inventory,
    });
  });

  /**
   * Obtener personalización actual del usuario
   * GET /api/user/profile/customization
   */
  static getCustomization = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const customization = await ProfileCustomizationService.getCurrentCustomization(userId);
    
    res.json({
      success: true,
      data: customization,
    });
  });

  /**
   * Obtener items de una categoría de personalización
   * GET /api/user/profile/customization/items/:category
   */
  static getCustomizationItems = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { category } = req.params;
    
    const items = await ProfileCustomizationService.getItemsByCategory(userId, category);
    
    res.json({
      success: true,
      data: { items },
    });
  });

  /**
   * Aplicar un item de personalización
   * PUT /api/user/profile/customization/apply
   */
  static applyCustomization = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { category, storeItemId } = req.body;
    
    if (!category || !storeItemId) {
      return res.status(400).json({
        success: false,
        message: 'category y storeItemId son requeridos',
      });
    }
    
    const result = await ProfileCustomizationService.applyItem(userId, category, storeItemId);
    
    res.json({
      success: true,
      message: 'Personalización aplicada exitosamente',
      data: result,
    });
  });
}

