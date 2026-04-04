import { create } from 'zustand'
import {
  getCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  type Character,
  type CreateCharacterDto,
} from '../api/characters'

type CharacterStore = {
  characters: Character[]
  isLoading: boolean
  error: string | null

  fetchCharacters: () => Promise<void>
  addCharacter: (data: CreateCharacterDto) => Promise<void>
  editCharacter: (id: string, data: Partial<CreateCharacterDto>) => Promise<void>
  removeCharacter: (id: string) => Promise<void>
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  characters: [],
  isLoading: false,
  error: null,

  fetchCharacters: async () => {
    try {
      set({ isLoading: true, error: null })
      const characters = await getCharacters()
      set({ characters, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load characters', isLoading: false })
    }
  },

  addCharacter: async (data) => {
    try {
      set({ error: null })
      const newCharacter = await createCharacter(data)

      set((state) => ({
        characters: [newCharacter, ...state.characters],
      }))
    } catch (error) {
      set({ error: 'Failed to create character' })
    }
  },

  editCharacter: async (id, data) => {
    try {
      set({ error: null })
      const updatedCharacter = await updateCharacter(id, data)

      set((state) => ({
        characters: state.characters.map((character) =>
          character.id === id ? updatedCharacter : character,
        ),
      }))
    } catch (error) {
      set({ error: 'Failed to update character' })
    }
  },

  removeCharacter: async (id) => {
    try {
      set({ error: null })
      await deleteCharacter(id)

      set((state) => ({
        characters: state.characters.filter((character) => character.id !== id),
      }))
    } catch (error) {
      set({ error: 'Failed to delete character' })
    }
  },
}))