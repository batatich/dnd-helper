import { Prisma } from '@prisma/client'

import { prisma } from '../../lib/prisma'

import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'
import { ItemSlotAlreadyOccupiedError } from '../characters/errors'

type CreateCharacterItemRepositoryInput = Omit<
  CreateItemInput,
  'nameSnapshot'
> & {
  nameSnapshot: string
}

const characterItemInclude = {
  itemTemplate: true,
} as const

function toNullableJsonInput(
  value: unknown | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return Prisma.DbNull
  }

  return value as Prisma.InputJsonValue
}

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

  findEquippedItemBySlot(characterId: string, equippedSlot: string) {
    return prisma.characterItem.findFirst({
      where: {
        characterId,
        isEquipped: true,
        equippedSlot,
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

        /**
         * Игровые поля конкретного CharacterItem.
         *
         * Они нужны для кастомных предметов без ItemTemplate:
         * - кастомный меч
         * - кастомное кольцо
         * - кастомная броня
         * - предмет с собственными эффектами
         */
        type: data.type ?? null,

        allowedSlots: toNullableJsonInput(data.allowedSlots),

        effects: toNullableJsonInput(data.effects),

        weaponConfig: toNullableJsonInput(data.weaponConfig),
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

        ...(data.type !== undefined && {
          type: data.type,
        }),

        ...(data.allowedSlots !== undefined && {
          allowedSlots: toNullableJsonInput(data.allowedSlots),
        }),

        ...(data.effects !== undefined && {
          effects: toNullableJsonInput(data.effects),
        }),

        ...(data.weaponConfig !== undefined && {
          weaponConfig: toNullableJsonInput(data.weaponConfig),
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

  async equipItem(
    characterId: string,
    itemId: string,
    equippedSlot: string,
  ) {
    try {
      return await prisma.characterItem.update({
        where: {
          id: itemId,
        },
        data: {
          isEquipped: true,
          equippedSlot,
        },
        include: characterItemInclude,
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ItemSlotAlreadyOccupiedError(equippedSlot, characterId)
      }

      throw error
    }
  },

  unequipItem(itemId: string) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        isEquipped: false,
        equippedSlot: null,
      },
      include: characterItemInclude,
    })
  },
}