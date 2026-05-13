import { create } from 'zustand'
import type { Character, Stats } from '../types/characters'

import {
  getCharacters as getCharactersRequest,
  getCharacterById as getCharacterByIdRequest,
  createCharacter as createCharacterRequest,
  updateCharacter as updateCharacterRequest,
  deleteCharacter as deleteCharacterRequest,
  type CreateCharacterInput,
  type UpdateCharacterInput,
} from '../api/characterProfileApi'

import { updateCharacterStats as updateCharacterStatsRequest } from '../api/characterStatsApi'

import { useCharacterSheetStore } from './characterSheetStore'
import { getErrorMessage } from './characterStore.helpers'

type AddCharacterInput = CreateCharacterInput & {
  baseStats?: Stats
}

interface CharacterProfileStore {
  characters: Character[]
  currentCharacter: Character | null
  isLoading: boolean
  error: string | null

  fetchCharacters: () => Promise<void>
  fetchCharacterById: (id: string) => Promise<void>

  addCharacter: (character: AddCharacterInput) => Promise<void>
  updateCharacter: (id: string, updated: UpdateCharacterInput) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>

  refreshCharacterProfile: (characterId: string) => Promise<void>
  refreshCharacterSheetAndProfile: (characterId: string) => Promise<void>

  setCurrentCharacter: (character: Character | null) => void
  clearCurrentCharacter: () => void
}

const mergeCharacterIntoList = (
  characters: Character[],
  character: Character
): Character[] => {
  const exists = characters.some((item) => item.id === character.id)

  if (!exists) {
    return [...characters, character]
  }

  return characters.map((item) =>
    item.id === character.id ? character : item
  )
}

export const useCharacterProfileStore = create<CharacterProfileStore>((set, get) => ({
  characters: [],
  currentCharacter: null,
  isLoading: false,
  error: null,

  fetchCharacters: async () => {
    set({ isLoading: true, error: null })

    try {
      const characters = await getCharactersRequest()

      set({
        characters,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch characters:', error)

      set({
        error: getErrorMessage('Не удалось загрузить персонажей', error),
        isLoading: false,
      })
    }
  },

  fetchCharacterById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const character = await getCharacterByIdRequest(id)

      set((state) => ({
        currentCharacter: character,
        characters: mergeCharacterIntoList(state.characters, character),
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to fetch character:', error)

      set({
        error: getErrorMessage('Не удалось загрузить персонажа', error),
        isLoading: false,
      })
    }
  },

  addCharacter: async (character) => {
    set({ isLoading: true, error: null })

    try {
      const { baseStats, ...characterPayload } = character

      const createdCharacter = await createCharacterRequest(characterPayload)

      set((state) => ({
        currentCharacter: createdCharacter,
        characters: mergeCharacterIntoList(state.characters, createdCharacter),
      }))

      /**
       * Переходный create-flow:
       * форма создания может передать baseStats,
       * но backend create-character пока принимает только профиль.
       *
       * Поэтому:
       * 1. создаём персонажа;
       * 2. если были baseStats — обновляем их отдельным stats action;
       * 3. обновляем готовый sheet.
       *
       * Создание персонажа сразу высокого уровня не трогаем:
       * это будущая фича.
       */
      if (baseStats) {
        await updateCharacterStatsRequest(createdCharacter.id, baseStats)
      }

      await get().refreshCharacterSheetAndProfile(createdCharacter.id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to create character:', error)

      set({
        error: getErrorMessage('Не удалось создать персонажа', error),
        isLoading: false,
      })
    }
  },

  updateCharacter: async (id, updated) => {
    set({ isLoading: true, error: null })

    try {
      const updatedCharacter = await updateCharacterRequest(id, updated)

      set((state) => ({
        currentCharacter:
          state.currentCharacter?.id === id
            ? updatedCharacter
            : state.currentCharacter,
        characters: mergeCharacterIntoList(state.characters, updatedCharacter),
      }))

      await get().refreshCharacterSheetAndProfile(id)

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update character:', error)

      set({
        error: getErrorMessage('Не удалось обновить персонажа', error),
        isLoading: false,
      })
    }
  },

  deleteCharacter: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await deleteCharacterRequest(id)

      const sheetStore = useCharacterSheetStore.getState()

      if (sheetStore.currentSheet?.character.id === id) {
        sheetStore.clearCurrentSheet()
      }

      set((state) => ({
        characters: state.characters.filter(
          (character) => character.id !== id
        ),
        currentCharacter:
          state.currentCharacter?.id === id ? null : state.currentCharacter,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to delete character:', error)

      set({
        error: getErrorMessage('Не удалось удалить персонажа', error),
        isLoading: false,
      })
    }
  },

  refreshCharacterProfile: async (characterId) => {
    const refreshedCharacter = await getCharacterByIdRequest(characterId)

    set((state) => ({
      currentCharacter:
        state.currentCharacter?.id === characterId
          ? refreshedCharacter
          : state.currentCharacter,
      characters: mergeCharacterIntoList(state.characters, refreshedCharacter),
    }))
  },

  refreshCharacterSheetAndProfile: async (characterId) => {
    await useCharacterSheetStore.getState().fetchCharacterSheet(characterId)
    await get().refreshCharacterProfile(characterId)
  },

  setCurrentCharacter: (character) => {
    set({ currentCharacter: character })
  },

  clearCurrentCharacter: () => {
    set({ currentCharacter: null })
  },
}))