/**
 * Servicio de Hogar/Familia
 * 
 * Lógica de negocio para gestionar familias y sus miembros
 */

import { HouseholdModel } from '../models/household.model.js';
import { UserHouseholdModel } from '../models/user-household.model.js';
import { UserModel } from '../models/user.model.js';
import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { PointsService } from './points.service.js';
import { NotificationAlertsService } from './notification-alerts.service.js';

export class HouseholdService {
  /**
   * Crear una nueva familia
   * El usuario creador se convierte automáticamente en admin
   */
  static async createHousehold(userId, householdData) {
    // Verificar que el usuario no esté ya en una familia
    const existingHouseholds = await UserHouseholdModel.getHouseholdsByUserId(userId);
    if (existingHouseholds.length > 0) {
      throw new Error('Ya perteneces a una familia. Debes salir de tu familia actual antes de crear una nueva.');
    }

    // Crear el hogar
    const household = await HouseholdModel.create({
      householdName: householdData.householdName,
      memberLimit: householdData.memberLimit || null,
    });

    // Agregar al creador como admin
    await UserHouseholdModel.addUserToHousehold(userId, household.id, 'admin');

    // Otorgar puntos por crear familia
    await PointsService.awardHouseholdCreatePoints(userId, household.id);

    return household;
  }

  /**
   * Unirse a una familia usando código de invitación
   */
  static async joinHousehold(userId, inviteCode) {
    // Verificar que el usuario no esté ya en una familia
    const existingHouseholds = await UserHouseholdModel.getHouseholdsByUserId(userId);
    if (existingHouseholds.length > 0) {
      throw new Error('Ya perteneces a una familia. Debes salir de tu familia actual antes de unirte a otra.');
    }

    // Buscar familia por código de invitación
    const household = await HouseholdModel.findByInviteCode(inviteCode);
    if (!household) {
      throw new Error('Código de invitación inválido');
    }

    // Verificar límite de miembros si existe
    const members = await UserHouseholdModel.getUsersByHouseholdId(household.id);
    if (household.memberLimit && members.length >= household.memberLimit) {
      throw new Error('La familia ha alcanzado el límite de miembros');
    }

    // Agregar usuario como miembro
    await UserHouseholdModel.addUserToHousehold(userId, household.id, 'member');

    // Otorgar puntos por unirse a familia
    await PointsService.awardHouseholdJoinPoints(userId, household.id);

    // Obtener nombre del usuario que se unió
    const newMember = await UserModel.findById(userId);
    const memberName = newMember?.name || newMember?.nickname || 'Un nuevo miembro';

    // Notificar a todos los miembros de la familia (excepto al que se unió)
    const existingMembers = await UserHouseholdModel.getUsersByHouseholdId(household.id);
    const membersToNotify = existingMembers.filter(m => m.userId !== userId);
    
    await Promise.allSettled(
      membersToNotify.map(member => 
        NotificationAlertsService.sendFamilyMemberJoined(member.userId, memberName)
      )
    );

    return household;
  }

  /**
   * Obtener información completa de la familia del usuario
   */
  static async getMyHousehold(userId) {
    const userHouseholds = await UserHouseholdModel.getHouseholdsByUserId(userId);
    
    if (userHouseholds.length === 0) {
      return null;
    }

    const userHousehold = userHouseholds[0];
    const household = await HouseholdModel.findById(userHousehold.householdId);
    
    if (!household) {
      return null;
    }

    // Obtener todos los miembros con sus datos de usuario
    const members = await UserHouseholdModel.getUsersByHouseholdId(household.id);
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await UserModel.findById(member.userId);
        return {
          userId: member.userId,
          userHouseholdId: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          name: user?.name || 'Usuario desconocido',
          email: user?.email || '',
          avatarUrl: user?.avatarUrl || null,
          nickname: user?.nickname || null,
        };
      })
    );

    return {
      ...household,
      myRole: userHousehold.role,
      members: membersWithDetails,
    };
  }

  /**
   * Salir de una familia
   * Si el usuario es admin y es el único admin, se asigna el miembro más antiguo como admin
   */
  static async leaveHousehold(userId, householdId) {
    const userHousehold = await UserHouseholdModel.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('No perteneces a esta familia');
    }

    const isAdmin = userHousehold.role === 'admin';

    // Remover usuario de la familia
    await UserHouseholdModel.removeUserFromHousehold(userId, householdId);

    // Si era admin, verificar si hay más admins
    if (isAdmin) {
      const remainingMembers = await UserHouseholdModel.getUsersByHouseholdId(householdId);
      const admins = remainingMembers.filter(m => m.role === 'admin');
      
      // Si no hay más admins, asignar el miembro más antiguo como admin
      if (admins.length === 0 && remainingMembers.length > 0) {
        // Ordenar por fecha de unión (más antiguo primero)
        remainingMembers.sort((a, b) => {
          const dateA = a.joinedAt?.toDate?.() || new Date(0);
          const dateB = b.joinedAt?.toDate?.() || new Date(0);
          return dateA - dateB;
        });
        
        const oldestMember = remainingMembers[0];
        await UserHouseholdModel.updateRole(oldestMember.userId, householdId, 'admin');
      }
    }

    return { success: true };
  }

  /**
   * Eliminar una familia (solo admin)
   */
  static async deleteHousehold(userId, householdId) {
    const userHousehold = await UserHouseholdModel.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('No perteneces a esta familia');
    }

    if (userHousehold.role !== 'admin') {
      throw new Error('Solo los administradores pueden eliminar la familia');
    }

    // Obtener todos los miembros para removerlos
    const members = await UserHouseholdModel.getUsersByHouseholdId(householdId);
    
    // Remover todas las relaciones usuario-hogar
    await Promise.all(
      members.map(member => 
        UserHouseholdModel.removeUserFromHousehold(member.userId, householdId)
      )
    );

    // Eliminar el hogar
    await HouseholdModel.delete(householdId);

    return { success: true };
  }

  /**
   * Asignar rol a un miembro (solo admin)
   */
  static async assignRole(userId, householdId, targetUserId, newRole) {
    // Verificar que el usuario que hace la petición sea admin
    const userHousehold = await UserHouseholdModel.getUserHousehold(userId, householdId);
    if (!userHousehold || userHousehold.role !== 'admin') {
      throw new Error('Solo los administradores pueden asignar roles');
    }

    // Verificar que el rol sea válido
    if (!['admin', 'member'].includes(newRole)) {
      throw new Error('Rol inválido. Debe ser "admin" o "member"');
    }

    // Verificar que el usuario objetivo pertenezca a la familia
    const targetUserHousehold = await UserHouseholdModel.getUserHousehold(targetUserId, householdId);
    if (!targetUserHousehold) {
      throw new Error('El usuario no pertenece a esta familia');
    }

    // Actualizar rol
    await UserHouseholdModel.updateRole(targetUserId, householdId, newRole);

    return { success: true };
  }

  /**
   * Remover miembro de la familia (solo admin)
   */
  static async removeMember(userId, householdId, targetUserId) {
    // Verificar que el usuario que hace la petición sea admin
    const userHousehold = await UserHouseholdModel.getUserHousehold(userId, householdId);
    if (!userHousehold || userHousehold.role !== 'admin') {
      throw new Error('Solo los administradores pueden remover miembros');
    }

    // No permitir que se remueva a sí mismo (debe usar leaveHousehold)
    if (userId === targetUserId) {
      throw new Error('No puedes removerte a ti mismo. Usa la opción de salir de la familia.');
    }

    // Verificar que el usuario objetivo pertenezca a la familia
    const targetUserHousehold = await UserHouseholdModel.getUserHousehold(targetUserId, householdId);
    if (!targetUserHousehold) {
      throw new Error('El usuario no pertenece a esta familia');
    }

    // Remover usuario
    await UserHouseholdModel.removeUserFromHousehold(targetUserId, householdId);

    return { success: true };
  }

  /**
   * Actualizar información de la familia (solo admin)
   */
  static async updateHousehold(userId, householdId, updateData) {
    // Verificar que el usuario sea admin
    const userHousehold = await UserHouseholdModel.getUserHousehold(userId, householdId);
    if (!userHousehold || userHousehold.role !== 'admin') {
      throw new Error('Solo los administradores pueden actualizar la familia');
    }

    // Actualizar hogar
    const updatedHousehold = await HouseholdModel.update(householdId, updateData);

    return updatedHousehold;
  }

  /**
   * Obtener código de invitación de la familia (solo miembros)
   */
  static async getInviteCode(userId, householdId) {
    const userHousehold = await UserHouseholdModel.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('No perteneces a esta familia');
    }

    const household = await HouseholdModel.findById(householdId);
    if (!household) {
      throw new Error('Familia no encontrada');
    }

    return {
      inviteCode: household.inviteCode,
      householdName: household.householdName,
    };
  }
}

