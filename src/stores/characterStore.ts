import { create } from 'zustand'
import type { Character, NewAttack, NewSpell, Stats } from '../types/characters'
import type { EquipmentSlot } from '../types/items'

import {
  getCharacters,
  getCharacterById,

  createCharacter as createCharacterRequest,
  updateCharacter as updateCharacterRequest,
  deleteCharacter as deleteCharacterRequest,

  updateCharacterStats as updateCharacterStatsRequest,
  rollCharacterStats as rollCharacterStatsRequest,
  type RollCharacterStatsResult,

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

  addAttack as addAttackRequest,
  updateAttack as updateAttackRequest,
  deleteAttack as deleteAttackRequest,

  addSpell as addSpellRequest,
  updateSpell as updateSpellRequest,
  deleteSpell as deleteSpellRequest,
  updateSpellcastingAbility as updateSpellcastingAbilityRequest,

  setSpellSlotTotal as setSpellSlotTotalRequest,
  useSpellSlot as useSpellSlotRequest,
  restoreSpellSlot as restoreSpellSlotRequest,

  addItem as addItemRequest,
  updateItem as updateItemRequest,
  deleteItem as deleteItemRequest,
  equipItem as equipItemRequest,
  unequipItem as unequipItemRequest,

  type CreateCharacterInput,
  type UpdateCharacterInput,
  type CreateItemInput,
  type UpdateItemInput,
} from '../api/characterApi'

import { getCharacterSheet } from '../api/characterSheetApi'
import type { CharacterSheet } from '../types/characterSheet'

// =========================================================
// Types
// =========================================================

interface CharacterStore {
  // Основное состояние store
  characters: Character[]
  currentCharacter: Character | null
  currentSheet: CharacterSheet | null
  isLoading: boolean
  error: string | null

  // Загрузка данных
  fetchCharacters: () => Promise<void>
  fetchCharacterById: (id: string) => Promise<void>
  fetchCharacterSheet: (id: string) => Promise<void>

  // CRUD персонажа
  addCharacter: (character: CreateCharacterInput) => Promise<void>
  updateCharacter: (id: string, updated: UpdateCharacterInput) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>

  // Stats
  updateCharacterStats: (id: string, stats: Stats) => Promise<void>
  rollCharacterStats: (id: string) => Promise<RollCharacterStatsResult | null>

  // HP
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

  // Attacks
  addAttack: (characterId: string, attack: NewAttack) => Promise<void>
  updateAttack: (
    characterId: string,
    attackId: string,
    attack: Partial<NewAttack>
  ) => Promise<void>
  deleteAttack: (characterId: string, attackId: string) => Promise<void>

  // Spells
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

  // Spell slots actions
  setSpellSlotTotal: (
    characterId: string,
    level: number,
    total: number
  ) => Promise<void>
  useSpellSlot: (characterId: string, level: number) => Promise<void>
  restoreSpellSlot: (characterId: string, level: number) => Promise<void>

  // Inventory / equipment
  addItem: (characterId: string, item: CreateItemInput) => Promise<void>
  updateItem: (
    characterId: string,
    itemId: string,
    item: UpdateItemInput
  ) => Promise<void>
  deleteItem: (characterId: string, itemId: string) => Promise<void>
  equipItem: (
    characterId: string,
    itemId: string,
    equippedSlot?: EquipmentSlot
  ) => Promise<void>
  unequipItem: (characterId: string, itemId: string) => Promise<void>

  // Локальные UI helpers
  setCurrentCharacter: (character: Character | null) => void
  clearCurrentCharacter: () => void
  clearCurrentSheet: () => void
}

// =========================================================
// Helpers
// =========================================================

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

const getErrorMessage = (fallback: string, error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

/**
 * Временный mapper из нового CharacterSheet DTO в старый Character.
 *
 * Нужен, пока часть UI ещё ожидает legacy Character-форму.
 * Истина всё равно остаётся в currentSheet.
 */
const mapSheetToLegacyCharacter = (sheet: CharacterSheet): Character => {
  const equippedItems = sheet.inventory.equippedItems.reduce<
    Record<string, string | null>
  >((acc, item) => {
    if (item.equippedSlot) {
      acc[item.equippedSlot] = item.id
    }

    return acc
  }, {})

  return {
    id: sheet.character.id,

    name: sheet.character.name,
    race: sheet.character.race,
    className: sheet.character.className,
    level: sheet.character.level,

    description: sheet.character.description,
    alignment: sheet.character.alignment,
    background: sheet.character.background,
    avatarUrl: sheet.character.avatarUrl,

    currentHp: sheet.character.currentHp,
    temporaryHp: sheet.character.temporaryHp,
    inspiration: sheet.character.inspiration,
    speed: sheet.character.speed,

    spellcastingAbility: sheet.magic.spellcastingAbility,

    deathSaves: sheet.deathSaves,
    hitDice: sheet.progression.hitDice,

    baseStats: sheet.stats.base,
    derivedStats: {
      maxHp: sheet.derived.maxHp,
      armorClass: sheet.derived.armorClass,
      initiative: sheet.derived.initiative,
    },

    skills: sheet.skills.map((skill) => ({
      name: skill.name,
      attribute: skill.ability,
      proficient: skill.proficient,
    })),

    savingThrowProficiencies: sheet.savingThrows
      .filter((savingThrow) => savingThrow.proficient)
      .map((savingThrow) => savingThrow.ability),

    attacks: sheet.attacks,
    spells: sheet.magic.spells,
    spellSlots: sheet.magic.spellSlots,

    inventory: sheet.inventory.items,
    equippedItems,

    createdAt: sheet.character.createdAt,
    updatedAt: sheet.character.updatedAt,

    isSynced: true,
  }
}

// =========================================================
// Store
// =========================================================

export const useCharacterStore = create<CharacterStore>((set) => {
  /**
   * Единый способ обновить sheet после любого backend action.
   *
   * Важно:
   * - store не патчит sheet руками;
   * - store не считает derived values;
   * - backend возвращает готовый sheet;
   * - legacy currentCharacter обновляется из sheet только как bridge для старого UI.
   */
  const refreshCharacterSheet = async (characterId: string) => {
    const sheet = await getCharacterSheet(characterId)
    const character = mapSheetToLegacyCharacter(sheet)

    set((state) => ({
      currentSheet: sheet,
      currentCharacter: character,
      characters: mergeCharacterIntoList(state.characters, character),
      isLoading: false,
    }))
  }

  return {
    // =========================================================
    // Initial state
    // =========================================================

    characters: [],
    currentCharacter: null,
    currentSheet: null,
    isLoading: false,
    error: null,

    // =========================================================
    // Loading
    // =========================================================

    fetchCharacters: async () => {
      set({ isLoading: true, error: null })

      try {
        const characters = await getCharacters()

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
        const character = await getCharacterById(id)

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

    fetchCharacterSheet: async (id) => {
      set({ isLoading: true, error: null })

      try {
        await refreshCharacterSheet(id)
      } catch (error) {
        console.error('Failed to fetch character sheet:', error)

        set({
          error: getErrorMessage('Не удалось загрузить лист персонажа', error),
          isLoading: false,
        })
      }
    },

    // =========================================================
    // Character CRUD
    // =========================================================

    addCharacter: async (character) => {
      set({ isLoading: true, error: null })

      try {
        const createdCharacter = await createCharacterRequest(character)

        const characterWithStats = character as CreateCharacterInput & {
          baseStats?: Stats
        }

        if (characterWithStats.baseStats) {
          await updateCharacterStatsRequest(
            createdCharacter.id,
            characterWithStats.baseStats
          )
        }

        await refreshCharacterSheet(createdCharacter.id)
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
        await updateCharacterRequest(id, updated)
        await refreshCharacterSheet(id)
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

        set((state) => ({
          characters: state.characters.filter(
            (character) => character.id !== id
          ),
          currentCharacter:
            state.currentCharacter?.id === id ? null : state.currentCharacter,
          currentSheet:
            state.currentSheet?.character.id === id ? null : state.currentSheet,
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

    // =========================================================
    // Stats
    // =========================================================

    updateCharacterStats: async (id, stats) => {
      set({ isLoading: true, error: null })

      try {
        await updateCharacterStatsRequest(id, stats)
        await refreshCharacterSheet(id)
      } catch (error) {
        console.error('Failed to update character stats:', error)

        set({
          error: getErrorMessage(
            'Не удалось обновить характеристики персонажа',
            error
          ),
          isLoading: false,
        })
      }
    },

    rollCharacterStats: async (id) => {
      set({ isLoading: true, error: null })

      try {
        const result = await rollCharacterStatsRequest(id)

        await refreshCharacterSheet(id)

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

        return null
      }
    },

    // =========================================================
    // HP
    // =========================================================

    damageCharacter: async (id, amount) => {
      set({ isLoading: true, error: null })

      try {
        await damageCharacterRequest(id, amount)
        await refreshCharacterSheet(id)
      } catch (error) {
        console.error('Failed to damage character:', error)

        set({
          error: getErrorMessage('Не удалось нанести урон персонажу', error),
          isLoading: false,
        })
      }
    },

    healCharacter: async (id, amount) => {
      set({ isLoading: true, error: null })

      try {
        await healCharacterRequest(id, amount)
        await refreshCharacterSheet(id)
      } catch (error) {
        console.error('Failed to heal character:', error)

        set({
          error: getErrorMessage('Не удалось исцелить персонажа', error),
          isLoading: false,
        })
      }
    },

    setTemporaryHp: async (id, amount) => {
      set({ isLoading: true, error: null })

      try {
        await setTemporaryHpRequest(id, amount)
        await refreshCharacterSheet(id)
      } catch (error) {
        console.error('Failed to set temporary HP:', error)

        set({
          error: getErrorMessage('Не удалось обновить временные HP', error),
          isLoading: false,
        })
      }
    },

    levelUpCharacter: async (id, hpMode) => {
      set({ isLoading: true, error: null })

      try {
        await levelUpCharacterRequest(id, hpMode)
        await refreshCharacterSheet(id)
      } catch (error) {
        console.error('Failed to level up character:', error)

        set({
          error: getErrorMessage(
            'Не удалось повысить уровень персонажа',
            error
          ),
          isLoading: false,
        })
      }
    },

    useHitDie: async (characterId) => {
      set({ isLoading: true, error: null })

      try {
        await useHitDieRequest(characterId)
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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

    // =========================================================
    // Attacks
    // =========================================================

    addAttack: async (characterId, attack) => {
      set({ isLoading: true, error: null })

      try {
        await addAttackRequest(characterId, attack)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to add attack:', error)

        set({
          error: getErrorMessage('Не удалось добавить атаку', error),
          isLoading: false,
        })
      }
    },

    updateAttack: async (characterId, attackId, attack) => {
      set({ isLoading: true, error: null })

      try {
        await updateAttackRequest(characterId, attackId, attack)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to update attack:', error)

        set({
          error: getErrorMessage('Не удалось обновить атаку', error),
          isLoading: false,
        })
      }
    },

    deleteAttack: async (characterId, attackId) => {
      set({ isLoading: true, error: null })

      try {
        await deleteAttackRequest(characterId, attackId)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to delete attack:', error)

        set({
          error: getErrorMessage('Не удалось удалить атаку', error),
          isLoading: false,
        })
      }
    },

    // =========================================================
    // Spells
    // =========================================================

    addSpell: async (characterId, spell) => {
      set({ isLoading: true, error: null })

      try {
        await addSpellRequest(characterId, spell)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to add spell:', error)

        set({
          error: getErrorMessage('Не удалось добавить заклинание', error),
          isLoading: false,
        })
      }
    },

    updateSpell: async (characterId, spellId, spell) => {
      set({ isLoading: true, error: null })

      try {
        await updateSpellRequest(characterId, spellId, spell)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to update spell:', error)

        set({
          error: getErrorMessage('Не удалось обновить заклинание', error),
          isLoading: false,
        })
      }
    },

    deleteSpell: async (characterId, spellId) => {
      set({ isLoading: true, error: null })

      try {
        await deleteSpellRequest(characterId, spellId)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to delete spell:', error)

        set({
          error: getErrorMessage('Не удалось удалить заклинание', error),
          isLoading: false,
        })
      }
    },

    updateSpellcastingAbility: async (characterId, ability) => {
      set({ isLoading: true, error: null })

      try {
        await updateSpellcastingAbilityRequest(characterId, ability)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to update spellcasting ability:', error)

        set({
          error: getErrorMessage(
            'Не удалось обновить характеристику заклинаний',
            error
          ),
          isLoading: false,
        })
      }
    },

    // =========================================================
    // Spell slots actions
    // =========================================================

    setSpellSlotTotal: async (characterId, level, total) => {
      set({ isLoading: true, error: null })

      try {
        await setSpellSlotTotalRequest(characterId, level, total)
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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
        await refreshCharacterSheet(characterId)
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

    // =========================================================
    // Inventory / equipment
    // =========================================================

    addItem: async (characterId, item) => {
      set({ isLoading: true, error: null })

      try {
        await addItemRequest(characterId, item)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to add item:', error)

        set({
          error: getErrorMessage('Не удалось добавить предмет', error),
          isLoading: false,
        })
      }
    },

    updateItem: async (characterId, itemId, item) => {
      set({ isLoading: true, error: null })

      try {
        await updateItemRequest(characterId, itemId, item)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to update item:', error)

        set({
          error: getErrorMessage('Не удалось обновить предмет', error),
          isLoading: false,
        })
      }
    },

    deleteItem: async (characterId, itemId) => {
      set({ isLoading: true, error: null })

      try {
        await deleteItemRequest(characterId, itemId)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to delete item:', error)

        set({
          error: getErrorMessage('Не удалось удалить предмет', error),
          isLoading: false,
        })
      }
    },

    equipItem: async (characterId, itemId, equippedSlot) => {
      set({ isLoading: true, error: null })

      try {
        await equipItemRequest(characterId, itemId, equippedSlot)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to equip item:', error)

        set({
          error: getErrorMessage('Не удалось экипировать предмет', error),
          isLoading: false,
        })
      }
    },

    unequipItem: async (characterId, itemId) => {
      set({ isLoading: true, error: null })

      try {
        await unequipItemRequest(characterId, itemId)
        await refreshCharacterSheet(characterId)
      } catch (error) {
        console.error('Failed to unequip item:', error)

        set({
          error: getErrorMessage('Не удалось снять предмет', error),
          isLoading: false,
        })
      }
    },

    // =========================================================
    // UI helpers
    // =========================================================

    setCurrentCharacter: (character) => {
      set({ currentCharacter: character })
    },

    clearCurrentCharacter: () => {
      set({ currentCharacter: null })
    },

    clearCurrentSheet: () => {
      set({ currentSheet: null })
    },
  }
})