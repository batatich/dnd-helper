import { prisma } from '../../lib/prisma'

import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

type CreateCharacterItemRepositoryInput = Omit<
  CreateItemInput,
  'nameSnapshot'
> & {
  nameSnapshot: string
}

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

  createItem(characterId: string, data: CreateCharacterItemRepositoryInput) {
    return prisma.characterItem.create({
      data: {
        characterId,

        itemTemplateId: data.itemTemplateId ?? null,

        /**
         * Если nameSnapshot не пришёл, service должен был подставить
         * имя из ItemTemplate до вызова repository.
         */
        nameSnapshot: data.nameSnapshot,

        quantity: data.quantity ?? 1,

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
}