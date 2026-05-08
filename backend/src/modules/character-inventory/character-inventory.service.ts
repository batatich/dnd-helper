import { ValidationError } from '../../shared/errors'
import { characterRepository } from '../characters/character.repository'
import {
  CharacterNotFoundError,
  InvalidItemQuantityError,
  ItemAlreadyEquippedError,
  ItemNotEquippedError,
  ItemNotFoundError,
  ItemOwnershipError,
  ItemSlotAlreadyOccupiedError,
  ItemSlotMissingError,
  ItemTemplateNotFoundError,
} from '../characters/errors'
import { characterInventoryRepository } from './character-inventory.repository'
import type {
  CreateItemInput,
  EquipItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

const equipmentSlots: EquipmentSlot[] = [
  'mainHand',
  'offHand',
  'head',
  'body',
  'ring1',
  'ring2',
  'amulet',
  'boots',
]

function isEquipmentSlot(value: unknown): value is EquipmentSlot {
  return (
    typeof value === 'string' &&
    equipmentSlots.includes(value as EquipmentSlot)
  )
}

function normalizeAllowedSlotsFromValue(value: unknown): EquipmentSlot[] {
  if (!value) {
    return []
  }

  if (isEquipmentSlot(value)) {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.filter(isEquipmentSlot)
  }

  return []
}

function resolveAllowedSlots(input: {
  templateSlot?: string | null
}): EquipmentSlot[] {
  return normalizeAllowedSlotsFromValue(input.templateSlot)
}

function resolveEquipSlot(input: {
  requestedSlot?: EquipmentSlot
  allowedSlots: EquipmentSlot[]
}): EquipmentSlot {
  const { requestedSlot, allowedSlots } = input

  if (requestedSlot) {
    if (allowedSlots.length > 0 && !allowedSlots.includes(requestedSlot)) {
      throw new ValidationError(
        `Item cannot be equipped in slot "${requestedSlot}"`,
      )
    }

    return requestedSlot
  }

  if (allowedSlots.length === 1) {
    return allowedSlots[0]
  }

  throw new ItemSlotMissingError()
}

export const characterInventoryService = {
  async getItemTemplates() {
    return characterInventoryRepository.findAllItemTemplates()
  },

  async addItem(characterId: string, data: CreateItemInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    let resolvedNameSnapshot = data.nameSnapshot

    if (data.itemTemplateId) {
      const template = await characterInventoryRepository.findItemTemplateById(
        data.itemTemplateId,
      )

      if (!template) {
        throw new ItemTemplateNotFoundError(data.itemTemplateId)
      }

      if (!resolvedNameSnapshot) {
        resolvedNameSnapshot = template.name
      }
    }

    if (!resolvedNameSnapshot) {
      throw new ValidationError(
        'nameSnapshot is required when itemTemplateId is not provided',
      )
    }

    if (data.isEquipped && !data.slot) {
      throw new ItemSlotMissingError()
    }

    if (data.isEquipped && data.slot) {
      const occupiedItem =
        await characterInventoryRepository.findEquippedItemBySlot(
          characterId,
          data.slot,
        )

      if (occupiedItem) {
        throw new ItemSlotAlreadyOccupiedError(data.slot, characterId)
      }
    }

    return characterInventoryRepository.createItem(characterId, {
      ...data,
      nameSnapshot: resolvedNameSnapshot,
    })
  },

  async updateItem(characterId: string, itemId: string, data: UpdateItemInput) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    return characterInventoryRepository.updateItem(itemId, data)
  },

  async deleteItem(characterId: string, itemId: string) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    return characterInventoryRepository.deleteItem(itemId)
  },

  async equipItem(
    characterId: string,
    itemId: string,
    data: EquipItemInput = {},
  ) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (item.isEquipped) {
      throw new ItemAlreadyEquippedError(itemId)
    }

    const allowedSlots = resolveAllowedSlots({
      templateSlot: item.itemTemplate?.slot ?? null,
    })

    const slot = resolveEquipSlot({
      requestedSlot: data.slot,
      allowedSlots,
    })

    const occupiedItem =
      await characterInventoryRepository.findEquippedItemBySlot(
        characterId,
        slot,
      )

    if (occupiedItem && occupiedItem.id !== itemId) {
      throw new ItemSlotAlreadyOccupiedError(slot, characterId)
    }

    return characterInventoryRepository.equipItem(itemId, slot)
  },

  async unequipItem(characterId: string, itemId: string) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (!item.isEquipped) {
      throw new ItemNotEquippedError(itemId)
    }

    return characterInventoryRepository.unequipItem(itemId)
  },
}