/**
 * Controlador de Items de Consumo
 * 
 * Maneja las peticiones HTTP relacionadas con items de consumo
 */

import { ConsumptionItemModel } from '../models/consumption-item.model.js';
import { ConsumptionCategoryModel } from '../models/consumption-category.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class ConsumptionItemController {
  /**
   * Obtener todos los items de consumo
   * GET /api/consumption/items
   */
  static getItems = asyncHandler(async (req, res) => {
    const items = await ConsumptionItemModel.findAll();
    
    res.json({
      success: true,
      data: { items },
    });
  });

  /**
   * Obtener item por ID
   * GET /api/consumption/items/:itemId
   */
  static getItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    
    const item = await ConsumptionItemModel.findById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item de consumo no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: { item },
    });
  });

  /**
   * Obtener items por categoría
   * GET /api/consumption/items/category/:categoryId
   */
  static getItemsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    
    const items = await ConsumptionItemModel.findByCategory(categoryId);
    
    res.json({
      success: true,
      data: { items },
    });
  });
}

