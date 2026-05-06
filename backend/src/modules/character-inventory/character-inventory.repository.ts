import { prisma } from '../../lib/prisma'
import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

export const characterInventoryRepository = {
  // =========================================================
  // Item templates
  // =========================================================

  // Получить все шаблоны предметов
  findAllItemTemplates() {
    return prisma.itemTemplate.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  },

  // Найти шаблон предмета по ID
  findItemTemplateById(itemTemplateId: string) {
    return prisma.itemTemplate.findUnique({
      where: {
        id: itemTemplateId,
      },
    })
  },

  // =========================================================
  // Character items
  // =========================================================

  // Найти предмет персонажа по ID
  findItemById(itemId: string) {
    return prisma.characterItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Получить все предметы конкретного персонажа
  findItemsByCharacterId(characterId: string) {
    return prisma.characterItem.findMany({
      where: {
        characterId,
      },
      include: {
        itemTemplate: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  // Найти экипированный предмет в конкретном слоте
  findEquippedItemBySlot(characterId: string, slot: string) {
    return prisma.characterItem.findFirst({
      where: {
        characterId,
        slot,
        isEquipped: true,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Добавить предмет в инвентарь персонажа
  addItem(characterId: string, data: CreateItemInput & { nameSnapshot: string }) {
    return prisma.characterItem.create({
      data: {
        characterId,
        itemTemplateId: data.itemTemplateId ?? null,
        nameSnapshot: data.nameSnapshot,
        quantity: data.quantity ?? 1,
        isEquipped: data.isEquipped ?? false,
        slot: data.slot ?? null,
        notes: data.notes ?? null,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Обновить предмет персонажа
  updateItem(itemId: string, data: UpdateItemInput) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        ...(data.nameSnapshot !== undefined && {
          nameSnapshot: data.nameSnapshot,
        }),
        ...(data.quantity !== undefined && {
          quantity: data.quantity,
        }),
        ...(data.isEquipped !== undefined && {
          isEquipped: data.isEquipped,
        }),
        ...(data.slot !== undefined && {
          slot: data.slot,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Удалить предмет персонажа
  deleteItem(itemId: string) {
    return prisma.characterItem.delete({
      where: {
        id: itemId,
      },
    })
  },

  // Экипировать предмет
  equipItem(itemId: string) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        isEquipped: true,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Снять предмет
  unequipItem(itemId: string) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        isEquipped: false,
      },
      include: {
        itemTemplate: true,
      },
    })
  },
}