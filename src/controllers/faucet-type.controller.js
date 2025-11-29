/**
 * Controlador de Tipos de Grifos
 * 
 * Maneja las peticiones HTTP relacionadas con tipos de grifos
 */

import { FaucetTypeModel } from '../models/faucet-type.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class FaucetTypeController {
  /**
   * Obtener todos los tipos de grifos activos
   * GET /api/consumption/faucet-types
   */
  static getFaucetTypes = asyncHandler(async (req, res) => {
    const { includeInactive } = req.query;
    
    const faucetTypes = includeInactive === 'true' 
      ? await FaucetTypeModel.findAll()
      : await FaucetTypeModel.findAllActive();
    
    res.json({
      success: true,
      data: { faucetTypes },
    });
  });

  /**
   * Obtener tipo de grifo por ID
   * GET /api/consumption/faucet-types/:faucetTypeId
   */
  static getFaucetType = asyncHandler(async (req, res) => {
    const { faucetTypeId } = req.params;
    
    const faucetType = await FaucetTypeModel.findById(faucetTypeId);
    
    if (!faucetType) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de grifo no encontrado',
      });
    }
    
    res.json({
      success: true,
      data: { faucetType },
    });
  });
}

