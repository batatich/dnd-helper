import { create } from 'zustand'
import type { Character, Stats } from '../types/characters'
import { initialCharacters } from '../data/characters'
import type { Item, EquipmentSlot } from '../types/items'
import { useItemsStore } from './itemsStore'
import { calculateCharacter } from '../utils/calculateCharacter'

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
  toggleSavingThrowProficiency: (characterId: string, stat: keyof Stats) => void
  changeCurrentHp: (characterId: string, amount: number) => void
  setTemporaryHp: (characterId: string, amount: number) => void
  applyDamage: (characterId: string, damage: number) => void
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

    const items = useItemsStore.getState().items

const newCharacters = state.characters.map((char) => {
  if (char.id !== characterId) return char

  const updatedCharacter = {
    ...char,
    equippedItems: {
      ...char.equippedItems,
      [slot]: item.id,
    },
    updatedAt,
  }

  const recalculatedCharacter = calculateCharacter(updatedCharacter, items)
  const newMaxHp = recalculatedCharacter.finalDerivedStats.maxHp
  const currentHp = updatedCharacter.currentHp ?? newMaxHp

  return {
    ...updatedCharacter,
    currentHp: Math.min(currentHp, newMaxHp),
  }
})

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

      const items = useItemsStore.getState().items

const newCharacters = state.characters.map((char) => {
  if (char.id !== characterId) return char

  const updatedCharacter = {
    ...char,
    equippedItems: {
      ...char.equippedItems,
      [slot]: null,
    },
    updatedAt,
  }

  const recalculatedCharacter = calculateCharacter(updatedCharacter, items)
  const newMaxHp = recalculatedCharacter.finalDerivedStats.maxHp
  const currentHp = updatedCharacter.currentHp ?? newMaxHp

  return {
    ...updatedCharacter,
    currentHp: Math.min(currentHp, newMaxHp),
  }
})

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
    toggleSavingThrowProficiency: (characterId: string, stat: keyof Stats) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) => {
      if (char.id !== characterId) {
        return char
      }

      const currentProficiencies = char.savingThrowProficiencies ?? []

      const newSavingThrowProficiencies: (keyof Stats)[] =
        currentProficiencies.includes(stat)
          ? currentProficiencies.filter((s): s is keyof Stats => s !== stat)
          : [...currentProficiencies, stat]

      return {
        ...char,
        savingThrowProficiencies: newSavingThrowProficiencies,
        updatedAt,
      }
    })

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            savingThrowProficiencies: (
              state.currentCharacter.savingThrowProficiencies ?? []
            ).includes(stat)
              ? (state.currentCharacter.savingThrowProficiencies ?? []).filter(
                  (s): s is keyof Stats => s !== stat
                )
              : [...(state.currentCharacter.savingThrowProficiencies ?? []), stat],
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
changeCurrentHp: (characterId, amount) =>
  set((state) => {
    const updatedAt = new Date().toISOString()
    const items = useItemsStore.getState().items

    const newCharacters = state.characters.map((char) => {
      if (char.id !== characterId) return char

      const calculatedCharacter = calculateCharacter(char, items)
      const maxHp = calculatedCharacter.finalDerivedStats.maxHp

      const currentHp = char.currentHp ?? maxHp
      const newCurrentHp = Math.max(0, Math.min(maxHp, currentHp + amount))

      return {
        ...char,
        currentHp: newCurrentHp,
        updatedAt,
      }
    })

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? (() => {
            const calculatedCharacter = calculateCharacter(
              state.currentCharacter,
              items
            )
            const maxHp = calculatedCharacter.finalDerivedStats.maxHp

            const currentHp = state.currentCharacter.currentHp ?? maxHp
            const newCurrentHp = Math.max(
              0,
              Math.min(maxHp, currentHp + amount)
            )

            return {
              ...state.currentCharacter,
              currentHp: newCurrentHp,
              updatedAt,
            }
          })()
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  setTemporaryHp: (characterId, amount) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            temporaryHp: Math.max(0, amount),
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            temporaryHp: Math.max(0, amount),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  applyDamage: (characterId, damage) =>
  set((state) => {
    const updatedAt = new Date().toISOString()
    const items = useItemsStore.getState().items

    const newCharacters = state.characters.map((char) => {
      if (char.id !== characterId) return char

      const calculatedCharacter = calculateCharacter(char, items)
      const maxHp = calculatedCharacter.finalDerivedStats.maxHp

      const currentHp = char.currentHp ?? maxHp
      const temporaryHp = char.temporaryHp ?? 0

      const damageToTempHp = Math.min(temporaryHp, damage)
      const remainingDamage = damage - damageToTempHp
      const newTemporaryHp = temporaryHp - damageToTempHp
      const newCurrentHp = Math.max(0, currentHp - remainingDamage)

      return {
        ...char,
        currentHp: newCurrentHp,
        temporaryHp: newTemporaryHp,
        updatedAt,
      }
    })

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? (() => {
            const calculatedCharacter = calculateCharacter(
              state.currentCharacter,
              items
            )
            const maxHp = calculatedCharacter.finalDerivedStats.maxHp

            const currentHp = state.currentCharacter.currentHp ?? maxHp
            const temporaryHp = state.currentCharacter.temporaryHp ?? 0

            const damageToTempHp = Math.min(temporaryHp, damage)
            const remainingDamage = damage - damageToTempHp
            const newTemporaryHp = temporaryHp - damageToTempHp
            const newCurrentHp = Math.max(0, currentHp - remainingDamage)

            return {
              ...state.currentCharacter,
              currentHp: newCurrentHp,
              temporaryHp: newTemporaryHp,
              updatedAt,
            }
          })()
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
}))