import { prisma } from '../../lib/prisma'

import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

const characterItemInclude = {
  itemTemplate: true,
} as const

export const characterInventoryRepository = {
  findByCharacterId(characterId: string) {
    return prisma.characterItem.findMany({
      where: {
        characterId,
      },
      include: characterItemInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findItemById(itemId: string) {
    return prisma.characterItem.findUnique({
      where: {
        id: itemId,
      },
      include: characterItemInclude,
    })
  },

  findItemByCharacterId(characterId: string, itemId: string) {
    return prisma.characterItem.findFirst({
      where: {
        id: itemId,
        characterId,
      },
      include: characterItemInclude,
    })
  },

  findEquippedItemBySlot(characterId: string, slot: string) {
    return prisma.characterItem.findFirst({
      where: {
        characterId,
        isEquipped: true,
        slot,
      },
      include: characterItemInclude,
    })
  },

  findAllItemTemplates() {
    return prisma.itemTemplate.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  },

  findItemTemplateById(itemTemplateId: string) {
    return prisma.itemTemplate.findUnique({
      where: {
        id: itemTemplateId,
      },
    })
  },

  createItem(characterId: string, data: CreateItemInput) {
    return prisma.characterItem.create({
      data: {
        characterId,

        itemTemplateId: data.itemTemplateId ?? null,

        /**
         * Если nameSnapshot не пришёл, service должен был подставить
         * имя из ItemTemplate до вызова repository.
         */
        nameSnapshot: data.nameSnapshot ?? 'Предмет',

        quantity: data.quantity ?? 1,

        /**
         * Создание предмета лучше не использовать как основной способ экипировки.
         * Но поле оставлено для обратной совместимости.
         */
        isEquipped: data.isEquipped ?? false,

        slot: data.slot ?? null,

        notes: data.notes ?? null,
      },
      include: characterItemInclude,
    })
  },

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
      include: characterItemInclude,
    })
  },

  deleteItem(itemId: string) {
    return prisma.characterItem.delete({
      where: {
        id: itemId,
      },
      include: characterItemInclude,
    })
  },

  equipItem(itemId: string, slot: string) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        isEquipped: true,
        slot,
      },
      include: characterItemInclude,
    })
  },

  unequipItem(itemId: string) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        isEquipped: false,
        slot: null,
      },
      include: characterItemInclude,
    })
  },

  unequipItemInSlot(characterId: string, slot: string) {
    return prisma.characterItem.updateMany({
      where: {
        characterId,
        isEquipped: true,
        slot,
      },
      data: {
        isEquipped: false,
        slot: null,
      },
    })
  },
}