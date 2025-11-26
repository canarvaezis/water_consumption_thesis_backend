/**
 * Controlador de Tienda
 */

import { StoreService } from '../services/store.service.js';

export class StoreController {
  /**
   * Obtener todas las categorías de tienda
   */
  static async getCategories(req, res) {
    try {
      const categories = await StoreService.getCategories();
      
      res.json({
        success: true,
        data: {
          categories,
        },
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener categorías',
      });
    }
  }

  /**
   * Obtener categoría por ID
   */
  static async getCategoryById(req, res) {
    try {
      const { categoryId } = req.params;
      const category = await StoreService.getCategoryById(categoryId);
      
      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      const statusCode = error.message === 'Categoría no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener categoría',
      });
    }
  }

  /**
   * Obtener todos los items de tienda
   */
  static async getItems(req, res) {
    try {
      const userId = req.user.userId;
      const items = await StoreService.getItems(userId);
      
      res.json({
        success: true,
        data: {
          items,
        },
      });
    } catch (error) {
      console.error('Error al obtener items:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener items',
      });
    }
  }

  /**
   * Obtener item por ID
   */
  static async getItemById(req, res) {
    try {
      const userId = req.user.userId;
      const { itemId } = req.params;
      const item = await StoreService.getItemById(userId, itemId);
      
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error al obtener item:', error);
      const statusCode = error.message === 'Item no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener item',
      });
    }
  }

  /**
   * Obtener items por categoría
   */
  static async getItemsByCategory(req, res) {
    try {
      const userId = req.user.userId;
      const { categoryId } = req.params;
      const items = await StoreService.getItemsByCategory(userId, categoryId);
      
      res.json({
        success: true,
        data: {
          items,
        },
      });
    } catch (error) {
      console.error('Error al obtener items por categoría:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener items por categoría',
      });
    }
  }

  /**
   * Comprar un item de la tienda
   */
  static async purchaseItem(req, res) {
    try {
      const userId = req.user.userId;
      const { storeItemId } = req.body;

      if (!storeItemId) {
        return res.status(400).json({
          success: false,
          message: 'storeItemId es requerido',
        });
      }

      const purchase = await StoreService.purchaseItem(userId, storeItemId);
      
      res.status(201).json({
        success: true,
        message: 'Item comprado exitosamente',
        data: purchase,
      });
    } catch (error) {
      console.error('Error al comprar item:', error);
      
      let statusCode = 500;
      if (error.message === 'Item no encontrado') {
        statusCode = 404;
      } else if (
        error.message === 'Saldo insuficiente' ||
        error.message === 'Ya tienes este item en tu inventario'
      ) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al comprar item',
      });
    }
  }

  /**
   * Obtener inventario completo del usuario
   */
  static async getUserInventory(req, res) {
    try {
      const userId = req.user.userId;
      const inventory = await StoreService.getUserInventory(userId);
      
      res.json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener inventario',
      });
    }
  }

  /**
   * Verificar si el usuario tiene un item específico
   */
  static async hasItem(req, res) {
    try {
      const userId = req.user.userId;
      const { itemId } = req.params;
      const hasItem = await StoreService.hasItem(userId, itemId);
      
      res.json({
        success: true,
        data: {
          hasItem,
        },
      });
    } catch (error) {
      console.error('Error al verificar item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al verificar item',
      });
    }
  }

  /**
   * Obtener items destacados
   */
  static async getFeaturedItems(req, res) {
    try {
      const userId = req.user.userId;
      const items = await StoreService.getFeaturedItems(userId);
      
      res.json({
        success: true,
        data: {
          items,
        },
      });
    } catch (error) {
      console.error('Error al obtener items destacados:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener items destacados',
      });
    }
  }

  /**
   * Obtener historial de transacciones
   */
  static async getTransactions(req, res) {
    try {
      const userId = req.user.userId;
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
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener transacciones',
      });
    }
  }

  /**
   * Agregar puntos a la billetera (admin/testing)
   */
  static async addPoints(req, res) {
    try {
      const userId = req.user.userId;
      const { points, description } = req.body;

      if (!points || points <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Los puntos deben ser un número positivo',
        });
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
    } catch (error) {
      console.error('Error al agregar puntos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar puntos',
      });
    }
  }
}

