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
import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

export const characterInventoryService = {
  async getItemTemplates() {
    return characterRepository.findAllItemTemplates()
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
      const template = await characterRepository.findItemTemplateById(
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
      const occupiedItem = await characterRepository.findEquippedItemBySlot(
        characterId,
        data.slot,
      )

      if (occupiedItem) {
        throw new ItemSlotAlreadyOccupiedError(data.slot, characterId)
      }
    }

    return characterRepository.addItem(characterId, {
      ...data,
      nameSnapshot: resolvedNameSnapshot,
    })
  },

  async updateItem(characterId: string, itemId: string, data: UpdateItemInput) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    return characterRepository.updateItem(itemId, data)
  },

  async deleteItem(characterId: string, itemId: string) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    await characterRepository.deleteItem(itemId)
  },

  async equipItem(characterId: string, itemId: string) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (item.isEquipped) {
      throw new ItemAlreadyEquippedError(itemId)
    }

    if (!item.slot) {
      throw new ItemSlotMissingError(itemId)
    }

    const occupiedItem = await characterRepository.findEquippedItemBySlot(
      characterId,
      item.slot,
    )

    if (occupiedItem && occupiedItem.id !== itemId) {
      throw new ItemSlotAlreadyOccupiedError(item.slot, characterId)
    }

    return characterRepository.equipItem(itemId)
  },

  async unequipItem(characterId: string, itemId: string) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (!item.isEquipped) {
      throw new ItemNotEquippedError(itemId)
    }

    return characterRepository.unequipItem(itemId)
  },
}