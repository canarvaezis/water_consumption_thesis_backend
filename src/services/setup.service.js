/**
 * Servicio de Setup Items
 * 
 * Lógica de negocio para gestión de items de configuración del usuario
 */

import { UserSetupItemModel } from '../models/user-setup-item.model.js';
import { ConsumptionItemModel } from '../models/consumption-item.model.js';

export class SetupService {
  /**
   * Obtener todos los items de configuración del usuario
   */
  static async getUserSetupItems(userId) {
    const setupItems = await UserSetupItemModel.getSetupItemsByUserId(userId);

    // Enriquecer con información del item de consumo
    const enrichedItems = await Promise.all(
      setupItems.map(async (setupItem) => {
        const consumptionItem = await ConsumptionItemModel.findById(
          setupItem.consumptionItemId
        );
        
        return {
          ...setupItem,
          consumptionItem: consumptionItem || null,
          createdAt: setupItem.createdAt?.toDate 
            ? setupItem.createdAt.toDate() 
            : setupItem.createdAt,
          updatedAt: setupItem.updatedAt?.toDate 
            ? setupItem.updatedAt.toDate() 
            : setupItem.updatedAt,
        };
      })
    );

    return {
      items: enrichedItems,
      count: enrichedItems.length,
    };
  }

  /**
   * Agregar o actualizar item de configuración
   */
  static async upsertSetupItem(userId, setupItemData) {
    const { consumptionItemId, hasItem } = setupItemData;

    // Validar que el consumptionItemId existe
    const consumptionItem = await ConsumptionItemModel.findById(consumptionItemId);
    if (!consumptionItem) {
      throw new Error('Item de consumo no encontrado');
    }

    // Validar hasItem es booleano
    if (typeof hasItem !== 'boolean') {
      throw new Error('hasItem debe ser un valor booleano');
    }

    // Crear o actualizar
    const setupItem = await UserSetupItemModel.upsert(userId, {
      consumptionItemId,
      hasItem,
    });

    return {
      ...setupItem,
      consumptionItem,
      createdAt: setupItem.createdAt?.toDate 
        ? setupItem.createdAt.toDate() 
        : setupItem.createdAt,
      updatedAt: setupItem.updatedAt?.toDate 
        ? setupItem.updatedAt.toDate() 
        : setupItem.updatedAt,
    };
  }

  /**
   * Actualizar item de configuración por ID
   */
  static async updateSetupItem(userId, setupItemId, updateData) {
    // Obtener el item actual
    const setupItems = await UserSetupItemModel.getSetupItemsByUserId(userId);
    const existingItem = setupItems.find(item => item.id === setupItemId);

    if (!existingItem) {
      throw new Error('Item de configuración no encontrado');
    }

    // Validar hasItem si se proporciona
    if (updateData.hasItem !== undefined && typeof updateData.hasItem !== 'boolean') {
      throw new Error('hasItem debe ser un valor booleano');
    }

    // Actualizar usando upsert con el consumptionItemId existente
    const updatedItem = await UserSetupItemModel.upsert(userId, {
      consumptionItemId: existingItem.consumptionItemId,
      hasItem: updateData.hasItem !== undefined ? updateData.hasItem : existingItem.hasItem,
    });

    // Obtener información del item de consumo
    const consumptionItem = await ConsumptionItemModel.findById(
      updatedItem.consumptionItemId
    );

    return {
      ...updatedItem,
      consumptionItem: consumptionItem || null,
      createdAt: updatedItem.createdAt?.toDate 
        ? updatedItem.createdAt.toDate() 
        : updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt?.toDate 
        ? updatedItem.updatedAt.toDate() 
        : updatedItem.updatedAt,
    };
  }

  /**
   * Eliminar item de configuración
   */
  static async deleteSetupItem(userId, setupItemId) {
    // Verificar que el item existe y pertenece al usuario
    const setupItems = await UserSetupItemModel.getSetupItemsByUserId(userId);
    const existingItem = setupItems.find(item => item.id === setupItemId);

    if (!existingItem) {
      throw new Error('Item de configuración no encontrado');
    }

    await UserSetupItemModel.delete(userId, setupItemId);
    return { success: true, message: 'Item de configuración eliminado exitosamente' };
  }
}

