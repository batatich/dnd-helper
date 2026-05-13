import { create } from 'zustand'
import type { NewSpell } from '../types/spells'
import type { Stats } from '../types/characters'

import { updateSpellcastingAbility as updateSpellcastingAbilityRequest } from '../api/characterProfileApi'

import {
  addSpell as addSpellRequest,
  updateSpell as updateSpellRequest,
  deleteSpell as deleteSpellRequest,
  setSpellSlotTotal as setSpellSlotTotalRequest,
  useSpellSlot as useSpellSlotRequest,
  restoreSpellSlot as restoreSpellSlotRequest,
} from '../api/characterSpellsApi'

import { useCharacterProfileStore } from './characterProfileStore'
import { getErrorMessage } from './characterStore.helpers'

interface CharacterSpellsStore {
  isLoading: boolean
  error: string | null

  addSpell: (characterId: string, spell: NewSpell) => Promise<void>
  updateSpell: (
    characterId: string,
    spellId: string,
    spell: Partial<NewSpell>
  ) => Promise<void>
  deleteSpell: (characterId: string, spellId: string) => Promise<void>

  updateSpellcastingAbility: (
    characterId: string,
    ability: keyof Stats | null
  ) => Promise<void>

  setSpellSlotTotal: (
    characterId: string,
    level: number,
    total: number
  ) => Promise<void>
  useSpellSlot: (characterId: string, level: number) => Promise<void>
  restoreSpellSlot: (characterId: string, level: number) => Promise<void>
}

export const useCharacterSpellsStore = create<CharacterSpellsStore>((set) => ({
  isLoading: false,
  error: null,

  addSpell: async (characterId, spell) => {
    set({ isLoading: true, error: null })

    try {
      await addSpellRequest(characterId, spell)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to add spell:', error)

      set({
        error: getErrorMessage('Не удалось добавить заклинание', error),
        isLoading: false,
      })

      throw error
    }
  },

  updateSpell: async (characterId, spellId, spell) => {
    set({ isLoading: true, error: null })

    try {
      await updateSpellRequest(characterId, spellId, spell)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update spell:', error)

      set({
        error: getErrorMessage('Не удалось обновить заклинание', error),
        isLoading: false,
      })

      throw error
    }
  },

  deleteSpell: async (characterId, spellId) => {
    set({ isLoading: true, error: null })

    try {
      await deleteSpellRequest(characterId, spellId)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to delete spell:', error)

      set({
        error: getErrorMessage('Не удалось удалить заклинание', error),
        isLoading: false,
      })

      throw error
    }
  },

  updateSpellcastingAbility: async (characterId, ability) => {
    set({ isLoading: true, error: null })

    try {
      await updateSpellcastingAbilityRequest(characterId, ability)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update spellcasting ability:', error)

      set({
        error: getErrorMessage(
          'Не удалось обновить характеристику заклинаний',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  setSpellSlotTotal: async (characterId, level, total) => {
    set({ isLoading: true, error: null })

    try {
      await setSpellSlotTotalRequest(characterId, level, total)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to set spell slot total:', error)

      set({
        error: getErrorMessage(
          'Не удалось изменить количество ячеек заклинаний',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  useSpellSlot: async (characterId, level) => {
    set({ isLoading: true, error: null })

    try {
      await useSpellSlotRequest(characterId, level)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to use spell slot:', error)

      set({
        error: getErrorMessage(
          'Не удалось использовать ячейку заклинания',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  restoreSpellSlot: async (characterId, level) => {
    set({ isLoading: true, error: null })

    try {
      await restoreSpellSlotRequest(characterId, level)
      await useCharacterProfileStore
        .getState()
        .refreshCharacterSheetAndProfile(characterId)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to restore spell slot:', error)

      set({
        error: getErrorMessage(
          'Не удалось восстановить ячейку заклинания',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },
}))
