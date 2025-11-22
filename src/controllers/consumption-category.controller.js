/**
 * Controlador de Categorías de Consumo
 * 
 * Maneja las peticiones HTTP relacionadas con categorías de consumo
 */

import { ConsumptionCategoryModel } from '../models/consumption-category.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class ConsumptionCategoryController {
  /**
   * Obtener todas las categorías
   * GET /api/consumption/categories
   */
  static getCategories = asyncHandler(async (req, res) => {
    const categories = await ConsumptionCategoryModel.findAll();
    
    res.json({
      success: true,
      data: { categories },
    });
  });

  /**
   * Obtener categoría por ID
   * GET /api/consumption/categories/:categoryId
   */
  static getCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    
    const category = await ConsumptionCategoryModel.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }
    
    res.json({
      success: true,
      data: { category },
    });
  });
}

