import { create } from 'zustand'
import type { EquipmentSlot } from '../types/items'

import {
  addItem as addItemRequest,
  updateItem as updateItemRequest,
  deleteItem as deleteItemRequest,
  equipItem as equipItemRequest,
  unequipItem as unequipItemRequest,
  type CreateItemInput,
  type UpdateItemInput,
} from '../api/characterInventoryApi'

import { useCharacterProfileStore } from './characterProfileStore'
import { getErrorMessage } from './characterStore.helpers'

interface CharacterInventoryStore {
  isLoading: boolean
  error: string | null

  addItem: (characterId: string, item: CreateItemInput) => Promise<void>
  updateItem: (
    characterId: string,
    itemId: string,
    item: UpdateItemInput
  ) => Promise<void>
  deleteItem: (characterId: string, itemId: string) => Promise<void>
  equipItem: (
    characterId: string,
    itemId: string,
    equippedSlot?: EquipmentSlot
  ) => Promise<void>
  unequipItem: (characterId: string, itemId: string) => Promise<void>
}

export const useCharacterInventoryStore = create<CharacterInventoryStore>(
  (set) => ({
    isLoading: false,
    error: null,

    addItem: async (characterId, item) => {
      set({ isLoading: true, error: null })

      try {
        await addItemRequest(characterId, item)
        await useCharacterProfileStore
          .getState()
          .refreshCharacterSheetAndProfile(characterId)

        set({ isLoading: false })
      } catch (error) {
        console.error('Failed to add item:', error)

        set({
          error: getErrorMessage('Не удалось добавить предмет', error),
          isLoading: false,
        })

        throw error
      }
    },

    updateItem: async (characterId, itemId, item) => {
      set({ isLoading: true, error: null })

      try {
        await updateItemRequest(characterId, itemId, item)
        await useCharacterProfileStore
          .getState()
          .refreshCharacterSheetAndProfile(characterId)

        set({ isLoading: false })
      } catch (error) {
        console.error('Failed to update item:', error)

        set({
          error: getErrorMessage('Не удалось обновить предмет', error),
          isLoading: false,
        })

        throw error
      }
    },

    deleteItem: async (characterId, itemId) => {
      set({ isLoading: true, error: null })

      try {
        await deleteItemRequest(characterId, itemId)
        await useCharacterProfileStore
          .getState()
          .refreshCharacterSheetAndProfile(characterId)

        set({ isLoading: false })
      } catch (error) {
        console.error('Failed to delete item:', error)

        set({
          error: getErrorMessage('Не удалось удалить предмет', error),
          isLoading: false,
        })

        throw error
      }
    },

    equipItem: async (characterId, itemId, equippedSlot) => {
      set({ isLoading: true, error: null })

      try {
        await equipItemRequest(characterId, itemId, equippedSlot)
        await useCharacterProfileStore
          .getState()
          .refreshCharacterSheetAndProfile(characterId)

        set({ isLoading: false })
      } catch (error) {
        console.error('Failed to equip item:', error)

        set({
          error: getErrorMessage('Не удалось экипировать предмет', error),
          isLoading: false,
        })

        throw error
      }
    },

    unequipItem: async (characterId, itemId) => {
      set({ isLoading: true, error: null })

      try {
        await unequipItemRequest(characterId, itemId)
        await useCharacterProfileStore
          .getState()
          .refreshCharacterSheetAndProfile(characterId)

        set({ isLoading: false })
      } catch (error) {
        console.error('Failed to unequip item:', error)

        set({
          error: getErrorMessage('Не удалось снять предмет', error),
          isLoading: false,
        })

        throw error
      }
    },
  })
)
