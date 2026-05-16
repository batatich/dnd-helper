import { create } from 'zustand'

import {
  damageCharacter as damageCharacterRequest,
  healCharacter as healCharacterRequest,
  setTemporaryHp as setTemporaryHpRequest,
  levelUpCharacter as levelUpCharacterRequest,
  useHitDie as useHitDieRequest,
  restoreHitDie as restoreHitDieRequest,
  setCharacterInspiration as setCharacterInspirationRequest,
  addDeathSaveSuccess as addDeathSaveSuccessRequest,
  addDeathSaveFailure as addDeathSaveFailureRequest,
  resetDeathSaves as resetDeathSavesRequest,
} from '../api/characterHpApi'

import { useCharacterProfileStore } from './characterProfileStore'
import { getErrorMessage } from './characterStore.helpers'

interface CharacterHpStore {
  isLoading: boolean
  error: string | null

  damageCharacter: (id: string, amount: number) => Promise<void>
  healCharacter: (id: string, amount: number) => Promise<void>
  setTemporaryHp: (id: string, amount: number) => Promise<void>
  levelUpCharacter: (id: string, hpMode: 'fixed' | 'roll') => Promise<void>

  useHitDie: (characterId: string) => Promise<void>
  restoreHitDie: (characterId: string) => Promise<void>

  setCharacterInspiration: (
    characterId: string,
    inspiration: boolean
  ) => Promise<void>

  addDeathSaveSuccess: (characterId: string) => Promise<void>
  addDeathSaveFailure: (characterId: string) => Promise<void>
  resetDeathSaves: (characterId: string) => Promise<void>
}

export const useCharacterHpStore = create<CharacterHpStore>((set) => ({
  isLoading: false,
  error: null,

  damageCharacter: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      await damageCharacterRequest(id, amount)
      await useCharacterProfileStore.getState().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to damage character:', error)

      set({
        error: getErrorMessage('Не удалось нанести урон персонажу', error),
        isLoading: false,
      })

      throw error
    }
  },

  healCharacter: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      await healCharacterRequest(id, amount)
      await useCharacterProfileStore.getState().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to heal character:', error)

      set({
        error: getErrorMessage('Не удалось исцелить персонажа', error),
        isLoading: false,
      })

      throw error
    }
  },

  setTemporaryHp: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      await setTemporaryHpRequest(id, amount)
      await useCharacterProfileStore.getState().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to set temporary HP:', error)

      set({
        error: getErrorMessage('Не удалось обновить временные HP', error),
        isLoading: false,
      })

      throw error
    }
  },

  levelUpCharacter: async (id, hpMode) => {
    set({ isLoading: true, error: null })

    try {
      await levelUpCharacterRequest(id, hpMode)
      await useCharacterProfileStore.getState().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to level up character:', error)

      set({
        error: getErrorMessage(
          'Не удалось повысить уровень персонажа',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  useHitDie: async (characterId) => {
    set({ isLoading: true, error: null })

    try {
      await useHitDieRequest(characterId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to use hit die:', error)

      set({
        error: getErrorMessage('Не удалось использовать кость хитов', error),
        isLoading: false,
      })

      throw error
    }
  },

  restoreHitDie: async (characterId) => {
    set({ isLoading: true, error: null })

    try {
      await restoreHitDieRequest(characterId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to restore hit die:', error)

      set({
        error: getErrorMessage('Не удалось восстановить кость хитов', error),
        isLoading: false,
      })

      throw error
    }
  },

  setCharacterInspiration: async (characterId, inspiration) => {
    set({ isLoading: true, error: null })

    try {
      await setCharacterInspirationRequest(characterId, inspiration)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update inspiration:', error)

      set({
        error: getErrorMessage(
          'Не удалось обновить вдохновение персонажа',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  addDeathSaveSuccess: async (characterId) => {
    set({ isLoading: true, error: null })

    try {
      await addDeathSaveSuccessRequest(characterId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to add death save success:', error)

      set({
        error: getErrorMessage(
          'Не удалось добавить успешный спасбросок от смерти',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  addDeathSaveFailure: async (characterId) => {
    set({ isLoading: true, error: null })

    try {
      await addDeathSaveFailureRequest(characterId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to add death save failure:', error)

      set({
        error: getErrorMessage(
          'Не удалось добавить проваленный спасбросок от смерти',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  resetDeathSaves: async (characterId) => {
    set({ isLoading: true, error: null })

    try {
      await resetDeathSavesRequest(characterId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to reset death saves:', error)

      set({
        error: getErrorMessage(
          'Не удалось сбросить спасброски от смерти',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },
}))
