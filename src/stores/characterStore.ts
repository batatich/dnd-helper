import { create } from 'zustand'
import type { Character } from '../types/characters'
import { initialCharacters } from '../data/characters'
import type { Item, EquipmentSlot } from '../types/items'

const STORAGE_KEY = 'dnd-characters'

const loadCharacters = (): Character[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return initialCharacters
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return initialCharacters
    }

    return parsed
  } catch (error) {
    console.error('Failed to load characters from localStorage:', error)
    return initialCharacters
  }
}

const saveCharacters = (characters: Character[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  } catch (error) {
    console.error('Failed to save characters to localStorage:', error)
  }
}

interface CharacterStore {
  characters: Character[]
  currentCharacter: Character | null
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, updated: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  setCurrentCharacter: (character: Character | null) => void
  clearCurrentCharacter: () => void
  equipItem: (characterId: string, item: Item, slot: EquipmentSlot) => void
  unequipItem: (characterId: string, slot: EquipmentSlot) => void
  toggleSkillProficiency: (characterId: string, skillName: string) => void
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  toggleSkillProficiency: (characterId, skillName) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            skills: (char.skills ?? []).map((skill) =>
              skill.name === skillName
                ? { ...skill, proficient: !skill.proficient }
                : skill
            ),
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            skills: (state.currentCharacter.skills ?? []).map((skill) =>
              skill.name === skillName
                ? { ...skill, proficient: !skill.proficient }
                : skill
            ),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  characters: loadCharacters(),
  currentCharacter: null,

  addCharacter: (character) =>
    set((state) => {
      const newCharacters = [...state.characters, character]
      saveCharacters(newCharacters)
      return { characters: newCharacters }
    }),

  updateCharacter: (id, updated) =>
    set((state) => {
      const updatedAt = new Date().toISOString()

      const newCharacters = state.characters.map((char) =>
        char.id === id
          ? {
              ...char,
              ...updated,
              updatedAt,
            }
          : char
      )

      saveCharacters(newCharacters)

      const updatedCurrentCharacter =
        state.currentCharacter?.id === id
          ? {
              ...state.currentCharacter,
              ...updated,
              updatedAt,
            }
          : state.currentCharacter

      return {
        characters: newCharacters,
        currentCharacter: updatedCurrentCharacter,
      }
    }),

  deleteCharacter: (id) =>
    set((state) => {
      const newCharacters = state.characters.filter((char) => char.id !== id)
      saveCharacters(newCharacters)

      return {
        characters: newCharacters,
        currentCharacter:
          state.currentCharacter?.id === id ? null : state.currentCharacter,
      }
    }),

  setCurrentCharacter: (character) => set({ currentCharacter: character }),

  clearCurrentCharacter: () => set({ currentCharacter: null }),
    equipItem: (characterId: string, item: Item, slot: EquipmentSlot) =>
  set((state) => {
    if (!item.allowedSlots.includes(slot)) {
      console.warn('Invalid slot for item:', slot)
      return state
    }

    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            equippedItems: {
              ...char.equippedItems,
              [slot]: item.id,
            },
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            equippedItems: {
              ...state.currentCharacter.equippedItems,
              [slot]: item.id,
            },
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
    
  }),
      unequipItem: (characterId, slot) =>
    set((state) => {
      const updatedAt = new Date().toISOString()

      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              equippedItems: {
                ...char.equippedItems,
                [slot]: null,
              },
              updatedAt,
            }
          : char
      )

      saveCharacters(newCharacters)

      const updatedCurrentCharacter =
        state.currentCharacter?.id === characterId
          ? {
              ...state.currentCharacter,
              equippedItems: {
                ...state.currentCharacter.equippedItems,
                [slot]: null,
              },
              updatedAt,
            }
          : state.currentCharacter

      return {
        characters: newCharacters,
        currentCharacter: updatedCurrentCharacter,
      }
    }),
}))