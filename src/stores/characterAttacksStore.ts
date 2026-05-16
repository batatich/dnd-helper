import { create } from 'zustand'
import type { NewAttack } from '../types/attacks'

import {
  addAttack as addAttackRequest,
  updateAttack as updateAttackRequest,
  deleteAttack as deleteAttackRequest,
} from '../api/characterAttacksApi'

import { useCharacterProfileStore } from './characterProfileStore'
import { getErrorMessage } from './characterStore.helpers'

interface CharacterAttacksStore {
  isLoading: boolean
  error: string | null

  addAttack: (characterId: string, attack: NewAttack) => Promise<void>
  updateAttack: (
    characterId: string,
    attackId: string,
    attack: Partial<NewAttack>
  ) => Promise<void>
  deleteAttack: (characterId: string, attackId: string) => Promise<void>
}

export const useCharacterAttacksStore = create<CharacterAttacksStore>((set) => ({
  isLoading: false,
  error: null,

  addAttack: async (characterId, attack) => {
    set({ isLoading: true, error: null })

    try {
      await addAttackRequest(characterId, attack)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to add attack:', error)

      set({
        error: getErrorMessage('Не удалось добавить атаку', error),
        isLoading: false,
      })

      throw error
    }
  },

  updateAttack: async (characterId, attackId, attack) => {
    set({ isLoading: true, error: null })

    try {
      await updateAttackRequest(characterId, attackId, attack)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update attack:', error)

      set({
        error: getErrorMessage('Не удалось обновить атаку', error),
        isLoading: false,
      })

      throw error
    }
  },

  deleteAttack: async (characterId, attackId) => {
    set({ isLoading: true, error: null })

    try {
      await deleteAttackRequest(characterId, attackId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to delete attack:', error)

      set({
        error: getErrorMessage('Не удалось удалить атаку', error),
        isLoading: false,
      })

      throw error
    }
  },
}))
