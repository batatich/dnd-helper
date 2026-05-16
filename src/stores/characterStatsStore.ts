import { create } from 'zustand'
import type { Stats } from '../types/characters'

import {
  updateCharacterStats as updateCharacterStatsRequest,
  rollCharacterStats as rollCharacterStatsRequest,
  type RollCharacterStatsResult,
} from '../api/characterStatsApi'

import { useCharacterProfileStore } from './characterProfileStore'
import { getErrorMessage } from './characterStore.helpers'

interface CharacterStatsStore {
  isLoading: boolean
  error: string | null

  updateCharacterStats: (id: string, stats: Stats) => Promise<void>
  rollCharacterStats: (id: string) => Promise<RollCharacterStatsResult>
}

export const useCharacterStatsStore = create<CharacterStatsStore>((set) => ({
  isLoading: false,
  error: null,

  updateCharacterStats: async (id, stats) => {
    set({ isLoading: true, error: null })

    try {
      await updateCharacterStatsRequest(id, stats)
      await useCharacterProfileStore.getState().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update character stats:', error)

      set({
        error: getErrorMessage(
          'Не удалось обновить характеристики персонажа',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },

  rollCharacterStats: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const result = await rollCharacterStatsRequest(id)

      await useCharacterProfileStore.getState().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })

      return result
    } catch (error) {
      console.error('Failed to roll character stats:', error)

      set({
        error: getErrorMessage(
          'Не удалось сгенерировать характеристики персонажа',
          error
        ),
        isLoading: false,
      })

      throw error
    }
  },
}))
