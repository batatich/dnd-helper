import { create } from 'zustand'
import type {
  Character,
  Stats,
  Skill,
  Attack,
  Spell,
  SpellSlot,
  NewAttack,
  NewSpell,
  SpellUpdate,
} from '../types/characters'
import { standardSkills } from '../types/characters'
import { initialCharacters } from '../data/characters'
import type { Item, EquipmentSlot } from '../types/items'
import { useItemsStore } from './itemsStore'
import { calculateCharacter } from '../utils/calculateCharacter'


const STORAGE_KEY = 'dnd-characters'

const defaultDeathSaves = {
  successes: 0,
  failures: 0,
}

const defaultHitDice = {
  total: 1,
  used: 0,
  dice: '1d8',
}

const defaultSpellSlots: SpellSlot[] = Array.from({ length: 9 }, (_, i) => ({
  level: i + 1,
  total: 0,
  used: 0,
}))

const defaultEquippedItems = {
  mainHand: null,
  offHand: null,
  head: null,
  body: null,
  ring1: null,
  ring2: null,
  amulet: null,
  boots: null,
}

const defaultBaseStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

const defaultDerivedStats = {
  maxHp: 10,
  armorClass: 10,
  initiative: 0,
}

const defaultSkills: Skill[] = standardSkills.map((skill) => ({
  ...skill,
}))
const normalizeCharacter = (character: Partial<Character>): Character => {
  return {
    id: character.id ?? crypto.randomUUID(),
    name: character.name ?? '',
    race: character.race ?? '',
    class: character.class ?? '',
    level: character.level ?? 1,
    description: character.description ?? '',
    alignment: character.alignment ?? '',
    background: character.background ?? '',
    avatarUrl: character.avatarUrl ?? '',

    skills:
      character.skills && character.skills.length > 0
        ? character.skills
        : defaultSkills,

    attacks: (character.attacks ?? []) as Attack[],
    spells: (character.spells ?? []) as Spell[],
    spellcastingAbility: character.spellcastingAbility ?? 'intelligence',

    currentHp:
      character.currentHp ??
      character.derivedStats?.maxHp ??
      defaultDerivedStats.maxHp,
    temporaryHp: character.temporaryHp ?? 0,

    deathSaves: character.deathSaves ?? defaultDeathSaves,
    inspiration: character.inspiration ?? false,
    speed: character.speed ?? 30,
    hitDice: character.hitDice ?? defaultHitDice,

    spellSlots:
      character.spellSlots && character.spellSlots.length > 0
        ? character.spellSlots
        : defaultSpellSlots,

    baseStats: character.baseStats ?? defaultBaseStats,
    derivedStats: character.derivedStats ?? defaultDerivedStats,

    savingThrowProficiencies: character.savingThrowProficiencies ?? [],

    inventory: character.inventory ?? [],
    equippedItems: character.equippedItems ?? defaultEquippedItems,

    createdAt: character.createdAt ?? new Date().toISOString(),
    updatedAt: character.updatedAt ?? new Date().toISOString(),
  }
}

const loadCharacters = (): Character[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return initialCharacters.map((character) => normalizeCharacter(character))
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return initialCharacters.map((character) => normalizeCharacter(character  ))
    }

    return parsed
  } catch (error) {
    console.error('Failed to load characters from localStorage:', error)
    return initialCharacters.map((character) => normalizeCharacter(character  ))
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
  
  setDeathSaves: (
  characterId: string,
  deathSaves: { successes: number; failures: number }
  ) => void
  resetDeathSaves: (characterId: string) => void
  toggleInspiration: (characterId: string) => void
  setSpeed: (characterId: string, speed: number) => void
  setHitDiceUsed: (characterId: string, used: number) => void
  addAttack: (characterId: string, attack: NewAttack) => void
  updateAttack: (
    characterId: string,
    attackId: string,
    updated: Partial<Attack>
  ) => void
  deleteAttack: (characterId: string, attackId: string) => void
  addSpell: (characterId: string, spell: NewSpell) => void
  updateSpell: (
    characterId: string,
    spellId: string,
    spell: SpellUpdate,
  ) => void
  deleteSpell: (characterId: string, spellId: string) => void
  setSpellcastingAbility: (
    characterId: string,
    ability: keyof Stats
  ) => void
  setSpellSlotsTotal: (
    characterId: string,
    level: number,
    total: number
  ) => void

  changeSpellSlot: (
    characterId: string,
    level: number,
    delta: number
  ) => void
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

  const attacksWithoutThisItem = (char.attacks ?? []).filter(
  (attack) => attack.itemId !== item.id
)

const generatedAttack =
  item.type === 'weapon' && item.weaponConfig
    ? [
        {
          id: crypto.randomUUID(),
          name: item.name,
          attackType: item.weaponConfig.attackType,
          ability: item.weaponConfig.ability,
          proficient: true,
          damageDice: item.weaponConfig.damageDice,
          damageBonus: item.weaponConfig.damageBonus,
          damageType: item.weaponConfig.damageType,
          notes: item.weaponConfig.notes,
          source: 'item' as const,
          itemId: item.id,
        },
      ]
    : []

const updatedCharacter = {
  ...char,
  equippedItems: {
    ...char.equippedItems,
    [slot]: item.id,
  },
  attacks: [...attacksWithoutThisItem, ...generatedAttack],
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
    ? (() => {
        const currentAttacksWithoutThisItem = (
          state.currentCharacter.attacks ?? []
        ).filter((attack) => attack.itemId !== item.id)

        const generatedAttack =
          item.type === 'weapon' && item.weaponConfig
            ? [
                {
                  id: crypto.randomUUID(),
                  name: item.name,
                  attackType: item.weaponConfig.attackType,
                  ability: item.weaponConfig.ability,
                  proficient: true,
                  damageDice: item.weaponConfig.damageDice,
                  damageBonus: item.weaponConfig.damageBonus,
                  damageType: item.weaponConfig.damageType,
                  notes: item.weaponConfig.notes,
                  source: 'item' as const,
                  itemId: item.id,
                },
              ]
            : []

        return {
          ...state.currentCharacter,
          equippedItems: {
            ...state.currentCharacter.equippedItems,
            [slot]: item.id,
          },
          attacks: [...currentAttacksWithoutThisItem, ...generatedAttack],
          updatedAt,
        }
      })()
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

  const removedItemId = char.equippedItems[slot]

const updatedCharacter = {
  ...char,
  equippedItems: {
    ...char.equippedItems,
    [slot]: null,
  },
  attacks: (char.attacks ?? []).filter(
    (attack) => attack.itemId !== removedItemId
  ),
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
    ? (() => {
        const removedItemId = state.currentCharacter.equippedItems[slot]

        return {
          ...state.currentCharacter,
          equippedItems: {
            ...state.currentCharacter.equippedItems,
            [slot]: null,
          },
          attacks: (state.currentCharacter.attacks ?? []).filter(
            (attack) => attack.itemId !== removedItemId
          ),
          updatedAt,
        }
      })()
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
        deathSaves:
          newCurrentHp > 0
          ? { successes: 0, failures: 0 }
          : char.deathSaves,
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
              deathSaves:
                newCurrentHp > 0
                  ? { successes: 0, failures: 0 }
                  : state.currentCharacter.deathSaves,
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
  setDeathSaves: (characterId, deathSaves) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            deathSaves: {
              successes: Math.max(0, Math.min(3, deathSaves.successes)),
              failures: Math.max(0, Math.min(3, deathSaves.failures)),
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
            deathSaves: {
              successes: Math.max(0, Math.min(3, deathSaves.successes)),
              failures: Math.max(0, Math.min(3, deathSaves.failures)),
            },
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

resetDeathSaves: (characterId) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            deathSaves: {
              successes: 0,
              failures: 0,
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
            deathSaves: {
              successes: 0,
              failures: 0,
            },
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  toggleInspiration: (characterId) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            inspiration: !char.inspiration,
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            inspiration: !state.currentCharacter.inspiration,
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

setSpeed: (characterId, speed) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            speed: Math.max(0, speed),
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            speed: Math.max(0, speed),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

setHitDiceUsed: (characterId, used) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) => {
      if (char.id !== characterId) return char

      const total = char.hitDice?.total ?? 0

      return {
        ...char,
        hitDice: {
          ...char.hitDice,
          used: Math.max(0, Math.min(total, used)),
        },
        updatedAt,
      }
    })

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            hitDice: {
              ...state.currentCharacter.hitDice,
              used: Math.max(
                0,
                Math.min(state.currentCharacter.hitDice?.total ?? 0, used)
              ),
            },
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
addAttack: (characterId, attack) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const attackWithId = {
      ...attack,
      id: crypto.randomUUID(),
    }

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            attacks: [...(char.attacks ?? []), attackWithId],
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            attacks: [...(state.currentCharacter.attacks ?? []), attackWithId],
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

updateAttack: (characterId, attackId, updated) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            attacks: (char.attacks ?? []).map((attack) =>
              attack.id === attackId
                ? { ...attack, ...updated }
                : attack
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
            attacks: (state.currentCharacter.attacks ?? []).map((attack) =>
              attack.id === attackId
                ? { ...attack, ...updated }
                : attack
            ),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

deleteAttack: (characterId, attackId) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            attacks: (char.attacks ?? []).filter(
              (attack) => attack.id !== attackId
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
            attacks: (state.currentCharacter.attacks ?? []).filter(
              (attack) => attack.id !== attackId
            ),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  addSpell: (characterId, spell) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const spellWithId: Spell = {
      ...spell,
      id: crypto.randomUUID(),
    }

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            spells: [...(char.spells ?? []), spellWithId],
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            spells: [...(state.currentCharacter.spells ?? []), spellWithId],
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

updateSpell: (characterId, spellId, updated) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            spells: (char.spells ?? []).map((spell) =>
              spell.id === spellId
                ? { ...spell, ...updated }
                : spell
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
            spells: (state.currentCharacter.spells ?? []).map((spell) =>
              spell.id === spellId
                ? { ...spell, ...updated }
                : spell
            ),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

deleteSpell: (characterId, spellId) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            spells: (char.spells ?? []).filter(
              (spell) => spell.id !== spellId
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
            spells: (state.currentCharacter.spells ?? []).filter(
              (spell) => spell.id !== spellId
            ),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  setSpellcastingAbility: (characterId, ability) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            spellcastingAbility: ability,
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            spellcastingAbility: ability,
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
  setSpellSlotsTotal: (characterId, level, total) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            spellSlots: char.spellSlots.map((slot) =>
              slot.level === level
                ? { ...slot, total }
                : slot
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
            spellSlots: state.currentCharacter.spellSlots.map((slot) =>
              slot.level === level
                ? { ...slot, total }
                : slot
            ),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),

changeSpellSlot: (characterId, level, delta) =>
  set((state) => {
    const updatedAt = new Date().toISOString()

    const newCharacters = state.characters.map((char) =>
      char.id === characterId
        ? {
            ...char,
            spellSlots: char.spellSlots.map((slot) => {
              if (slot.level !== level) return slot

              const newUsed = Math.max(
                0,
                Math.min(slot.total, slot.used + delta)
              )

              return { ...slot, used: newUsed }
            }),
            updatedAt,
          }
        : char
    )

    saveCharacters(newCharacters)

    const updatedCurrentCharacter =
      state.currentCharacter?.id === characterId
        ? {
            ...state.currentCharacter,
            spellSlots: state.currentCharacter.spellSlots.map((slot) => {
              if (slot.level !== level) return slot

              const newUsed = Math.max(
                0,
                Math.min(slot.total, slot.used + delta)
              )

              return { ...slot, used: newUsed }
            }),
            updatedAt,
          }
        : state.currentCharacter

    return {
      characters: newCharacters,
      currentCharacter: updatedCurrentCharacter,
    }
  }),
}))