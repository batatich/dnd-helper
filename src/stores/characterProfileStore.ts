import { create } from 'zustand'
import type { Character } from '../types/characters'

import {
  getCharacters as getCharactersRequest,
  getCharacterById as getCharacterByIdRequest,
  createCharacter as createCharacterRequest,
  updateCharacter as updateCharacterRequest,
  deleteCharacter as deleteCharacterRequest,
  type CreateCharacterInput,
  type UpdateCharacterInput,
} from '../api/characterProfileApi'

import { useCharacterSheetStore } from './characterSheetStore'
import { getErrorMessage } from './characterStore.helpers'

interface CharacterProfileStore {
  characters: Character[]
  currentCharacter: Character | null
  isLoading: boolean
  error: string | null

  fetchCharacters: () => Promise<void>
  fetchCharacterById: (id: string) => Promise<void>

  addCharacter: (character: CreateCharacterInput) => Promise<void>
  updateCharacter: (id: string, updated: UpdateCharacterInput) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>

  refreshCharacterProfile: (characterId: string) => Promise<void>

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

export const useCharacterProfileStore = create<CharacterProfileStore>((set) => ({
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

      throw error
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

      throw error
    }
  },

  addCharacter: async (character) => {
    set({ isLoading: true, error: null })

    try {
      const createdCharacter = await createCharacterRequest(character)

      set((state) => ({
        currentCharacter: createdCharacter,
        characters: mergeCharacterIntoList(state.characters, createdCharacter),
      }))
      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to create character:', error)

      set({
        error: getErrorMessage('Не удалось создать персонажа', error),
        isLoading: false,
      })

      throw error
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

      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to update character:', error)

      set({
        error: getErrorMessage('Не удалось обновить персонажа', error),
        isLoading: false,
      })

      throw error
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

      throw error
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

  setCurrentCharacter: (character) => {
    set({ currentCharacter: character })
  },

  clearCurrentCharacter: () => {
    set({ currentCharacter: null })
  },
}))
