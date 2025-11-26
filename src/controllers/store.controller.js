/**
 * Controlador de Tienda
 */

import { StoreService } from '../services/store.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class StoreController {
  /**
   * Obtener todas las categorías de tienda
   */
  static getCategories = asyncHandler(async (req, res) => {
    const categories = await StoreService.getCategories();
    
    res.json({
      success: true,
      data: {
        categories,
      },
    });
  });

  /**
   * Obtener categoría por ID
   */
  static getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const category = await StoreService.getCategoryById(categoryId);
    
    res.json({
      success: true,
      data: category,
    });
  });

  /**
   * Obtener todos los items de tienda
   */
  static getItems = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const items = await StoreService.getItems(userId);
    
    res.json({
      success: true,
      data: {
        items,
      },
    });
  });

  /**
   * Obtener item por ID
   */
  static getItemById = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { itemId } = req.params;
    const item = await StoreService.getItemById(userId, itemId);
    
    res.json({
      success: true,
      data: item,
    });
  });

  /**
   * Obtener items por categoría
   */
  static getItemsByCategory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { categoryId } = req.params;
    const items = await StoreService.getItemsByCategory(userId, categoryId);
    
    res.json({
      success: true,
      data: {
        items,
      },
    });
  });

  /**
   * Comprar un item de la tienda
   */
  static purchaseItem = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { storeItemId } = req.body;

    if (!storeItemId) {
      throw new BadRequestError('storeItemId es requerido');
    }

    try {
      const purchase = await StoreService.purchaseItem(userId, storeItemId);
      
      res.status(201).json({
        success: true,
        message: 'Item comprado exitosamente',
        data: purchase,
      });
    } catch (error) {
      // Manejar errores específicos del servicio
      if (error.message === 'Item no encontrado') {
        throw new NotFoundError(error.message);
      } else if (
        error.message === 'Saldo insuficiente' ||
        error.message === 'Ya tienes este item en tu inventario'
      ) {
        throw new BadRequestError(error.message);
      }
      // Re-lanzar otros errores para que sean manejados por el middleware
      throw error;
    }
  });

  /**
   * Obtener inventario completo del usuario
   */
  static getUserInventory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const inventory = await StoreService.getUserInventory(userId);
    
    res.json({
      success: true,
      data: inventory,
    });
  });

  /**
   * Verificar si el usuario tiene un item específico
   */
  static hasItem = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { itemId } = req.params;
    const hasItem = await StoreService.hasItem(userId, itemId);
    
    res.json({
      success: true,
      data: {
        hasItem,
      },
    });
  });

  /**
   * Obtener items destacados
   */
  static getFeaturedItems = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const items = await StoreService.getFeaturedItems(userId);
    
    res.json({
      success: true,
      data: {
        items,
      },
    });
  });

  /**
   * Obtener historial de transacciones
   */
  static getTransactions = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { limit, type, startAfter } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : 50,
      type: type || null,
      startAfter: startAfter || null,
    };
    
    const result = await StoreService.getTransactions(userId, options);
    
    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Agregar puntos a la billetera (admin/testing)
   */
  static addPoints = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { points, description } = req.body;

    if (!points || points <= 0) {
      throw new BadRequestError('Los puntos deben ser un número positivo');
    }

    const result = await StoreService.addPoints(
      userId,
      points,
      description || 'Puntos agregados por administrador'
    );
    
    res.status(201).json({
      success: true,
      message: 'Puntos agregados exitosamente',
      data: result,
    });
  });
}
