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
import { characterHpRepository } from '../character-hp/character-hp.repository'
import { calculateMaxHp } from '../calculation/hp.rules'
import {
  calculateEffectiveMaxHp,
  normalizeItemEffects,
} from '../calculation/item-effects.rules'

async function clampCurrentHpToEffectiveMaxHp(characterId: string) {
  const character = await characterHpRepository.findByIdWithHpData(characterId)

  if (!character) {
    throw new CharacterNotFoundError(characterId)
  }

  const baseMaxHp = calculateMaxHp(character)

  const items = await characterInventoryRepository.findByCharacterId(characterId)

  const equippedItems = items
    .filter((item) => item.isEquipped)
    .map((item) => ({
      effects: normalizeItemEffects(
        item.effects ?? item.itemTemplate?.effects ?? null,
      ),
    }))

  const maxHp = calculateEffectiveMaxHp(baseMaxHp, equippedItems)

  if (character.currentHp <= maxHp) {
    return
  }

  await characterHpRepository.updateHpState(characterId, {
    currentHp: maxHp,
    temporaryHp: character.temporaryHp,
  })
}

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
  if (value === null || value === undefined) {
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
  itemAllowedSlots?: unknown | null
  templateAllowedSlots?: unknown | null
  templateSlot?: string | null
}): EquipmentSlot[] {
  /**
   * Приоритет:
   * 1. CharacterItem.allowedSlots
   * 2. ItemTemplate.allowedSlots
   * 3. ItemTemplate.slot
   *
   * Важно:
   * [] считается осознанным значением: предмет не имеет доступных слотов.
   */
  if (input.itemAllowedSlots !== null && input.itemAllowedSlots !== undefined) {
    return normalizeAllowedSlotsFromValue(input.itemAllowedSlots)
  }

  if (
    input.templateAllowedSlots !== null &&
    input.templateAllowedSlots !== undefined
  ) {
    return normalizeAllowedSlotsFromValue(input.templateAllowedSlots)
  }

  return normalizeAllowedSlotsFromValue(input.templateSlot)
}

function resolveEquipSlot(input: {
  requestedSlot?: EquipmentSlot
  allowedSlots: EquipmentSlot[]
}): EquipmentSlot {
  const { requestedSlot, allowedSlots } = input

  if (allowedSlots.length === 0) {
    throw new ValidationError(
      'Item cannot be equipped because it has no equipment slot',
    )
  }

  if (requestedSlot) {
    if (!allowedSlots.includes(requestedSlot)) {
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

    if (
      item.isEquipped &&
      data.quantity !== undefined &&
      data.quantity !== 1
    ) {
      throw new ValidationError(
        'Equipped item quantity must be 1. Unequip item before changing quantity.',
      )
    }

    /**
     * Если предмет уже экипирован и мы меняем allowedSlots,
     * нельзя оставить его в слоте, который больше не разрешён.
     */
    if (item.isEquipped && item.equippedSlot && data.allowedSlots !== undefined) {
      const nextAllowedSlots = resolveAllowedSlots({
        itemAllowedSlots: data.allowedSlots,
        templateAllowedSlots: item.itemTemplate?.allowedSlots ?? null,
        templateSlot: item.itemTemplate?.slot ?? null,
      })

      if (!nextAllowedSlots.includes(item.equippedSlot as EquipmentSlot)) {
        throw new ValidationError(
          `Equipped item cannot stay in slot "${item.equippedSlot}" with provided allowedSlots`,
        )
      }
    }

    const updatedItem = await characterInventoryRepository.updateItem(itemId, data)

    if (item.isEquipped) {
      await clampCurrentHpToEffectiveMaxHp(characterId)
    }

    return updatedItem
  },

  async deleteItem(characterId: string, itemId: string) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    const deletedItem = await characterInventoryRepository.deleteItem(itemId)

    if (item.isEquipped) {
      await clampCurrentHpToEffectiveMaxHp(characterId)
    }

    return deletedItem
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

    if (item.quantity !== 1) {
      throw new ValidationError(
        'Only single items can be equipped. Split stacked equipment first.',
      )
    }

    const allowedSlots = resolveAllowedSlots({
      itemAllowedSlots: item.allowedSlots,
      templateAllowedSlots: item.itemTemplate?.allowedSlots ?? null,
      templateSlot: item.itemTemplate?.slot ?? null,
    })

    const equippedSlot = resolveEquipSlot({
      requestedSlot: data.equippedSlot,
      allowedSlots,
    })
    const occupiedItem =
      await characterInventoryRepository.findEquippedItemBySlot(
        characterId,
        equippedSlot,
      )

    if (occupiedItem && occupiedItem.id !== itemId) {
      throw new ItemSlotAlreadyOccupiedError(equippedSlot, characterId)
    }

    const equippedItem = await characterInventoryRepository.equipItem(
      characterId,
      itemId,
      equippedSlot,
    )

    await clampCurrentHpToEffectiveMaxHp(characterId)

    return equippedItem
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

    const unequippedItem = await characterInventoryRepository.unequipItem(itemId)

    await clampCurrentHpToEffectiveMaxHp(characterId)

    return unequippedItem
  },
}