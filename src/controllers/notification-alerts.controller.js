/**
 * Controlador de Alertas y Recordatorios
 * 
 * Endpoints para enviar recordatorios programados (llamados por cron jobs o Cloud Functions)
 */

import { NotificationAlertsService } from '../services/notification-alerts.service.js';
import { UserModel } from '../models/user.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import logger from '../utils/logger.js';

export class NotificationAlertsController {
  /**
   * Enviar recordatorios de consumo a todos los usuarios que no han registrado hoy
   * Este endpoint debe ser llamado por un cron job cada 4 horas
   */
  static sendConsumptionReminders = asyncHandler(async (req, res) => {
    // Verificar que viene de un servicio autorizado (puedes agregar autenticación aquí)
    const authHeader = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET || 'change-this-secret';
    
    if (authHeader !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    try {
      // Obtener todos los usuarios (esto puede ser costoso, considera usar paginación)
      // Por ahora, asumimos que hay un método para obtener usuarios activos
      // En producción, deberías usar un índice o Cloud Function que itere sobre usuarios
      
      logger.info('Iniciando envío de recordatorios de consumo');
      
      // Nota: En producción, esto debería ser manejado por Cloud Functions
      // que itere sobre usuarios de forma eficiente
      // Por ahora, este endpoint está preparado para ser llamado por un cron job
      
      res.json({
        success: true,
        message: 'Recordatorios enviados (implementación pendiente para producción)',
        note: 'En producción, usar Cloud Functions para iterar sobre usuarios eficientemente',
      });
    } catch (error) {
      logger.error('Error enviando recordatorios de consumo:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  });
}

