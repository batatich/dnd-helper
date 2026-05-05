import { create } from 'zustand'
import type { Character, NewAttack, NewSpell, Stats } from '../types/characters'
import {
  getCharacters,
  getCharacterById,
  getCharacterSheet,

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

  addAttack as addAttackRequest,
  updateAttack as updateAttackRequest,
  deleteAttack as deleteAttackRequest,

  addSpell as addSpellRequest,
  updateSpell as updateSpellRequest,
  deleteSpell as deleteSpellRequest,
  updateSpellSlots as updateSpellSlotsRequest,
  updateSpellcastingAbility as updateSpellcastingAbilityRequest,

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

// =========================================================
// Types
// =========================================================

interface SpellSlotInput {
  level: number
  total: number
  used: number
}

interface CharacterStore {
  // Основное состояние store
  characters: Character[]
  currentCharacter: Character | null
  currentSheet: Character | null
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

  // Spell slots
  updateSpellSlots: (
    characterId: string,
    spellSlots: SpellSlotInput[]
  ) => Promise<void>

  updateSpellcastingAbility: (
    characterId: string,
    ability: keyof Stats
  ) => Promise<void>

  // Inventory / equipment
  addItem: (characterId: string, item: CreateItemInput) => Promise<void>
  updateItem: (
    characterId: string,
    itemId: string,
    item: UpdateItemInput
  ) => Promise<void>
  deleteItem: (characterId: string, itemId: string) => Promise<void>
  equipItem: (characterId: string, itemId: string) => Promise<void>
  unequipItem: (characterId: string, itemId: string) => Promise<void>

  // Локальные UI helpers
  setCurrentCharacter: (character: Character | null) => void
  clearCurrentCharacter: () => void
  clearCurrentSheet: () => void
}

// =========================================================
// Helpers
// =========================================================

// Обновляет персонажа в списке или добавляет его, если его там ещё нет.
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

// Превращает неизвестную ошибку в нормальный текст.
const getErrorMessage = (fallback: string, error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

// =========================================================
// Store
// =========================================================

export const useCharacterStore = create<CharacterStore>((set, get) => ({
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

  // Загружает список персонажей с backend.
  // Здесь больше нет localStorage.
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

  // Загружает одного персонажа с backend.
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

  // Загружает готовый character sheet с backend.
  // Это будущий основной источник данных для CharacterSheet.tsx.
  fetchCharacterSheet: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const sheet = await getCharacterSheet(id)

      set((state) => ({
        currentSheet: sheet,
        currentCharacter: sheet,
        characters: mergeCharacterIntoList(state.characters, sheet),
        isLoading: false,
      }))
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

  // Создаёт персонажа через backend.
  //
  // Важно:
  // POST /characters создаёт самого персонажа.
  // Но базовые характеристики у нас сохраняются отдельным endpoint:
  // PATCH /characters/:id/stats
  //
  // Поэтому после создания персонажа:
  // 1. создаём персонажа
  // 2. если из формы пришли baseStats — сохраняем их отдельно
  // 3. загружаем свежий sheet
  // 4. кладём свежие данные в store
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

      const freshCharacter = await getCharacterSheet(createdCharacter.id)

      set((state) => ({
        characters: mergeCharacterIntoList(state.characters, freshCharacter),
        currentCharacter: freshCharacter,
        currentSheet: freshCharacter,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to create character:', error)

      set({
        error: getErrorMessage('Не удалось создать персонажа', error),
        isLoading: false,
      })
    }
  },

  // Обновляет базовые данные персонажа через backend.
  updateCharacter: async (id, updated) => {
    set({ isLoading: true, error: null })

    try {
      const updatedCharacter = await updateCharacterRequest(id, updated)

      set((state) => ({
        characters: mergeCharacterIntoList(
          state.characters,
          updatedCharacter
        ),
        currentCharacter:
          state.currentCharacter?.id === id
            ? updatedCharacter
            : state.currentCharacter,
        currentSheet:
          state.currentSheet?.id === id
            ? updatedCharacter
            : state.currentSheet,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to update character:', error)

      set({
        error: getErrorMessage('Не удалось обновить персонажа', error),
        isLoading: false,
      })
    }
  },

  // Удаляет персонажа через backend.
  deleteCharacter: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await deleteCharacterRequest(id)

      set((state) => ({
        characters: state.characters.filter((character) => character.id !== id),
        currentCharacter:
          state.currentCharacter?.id === id ? null : state.currentCharacter,
        currentSheet:
          state.currentSheet?.id === id ? null : state.currentSheet,
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

  // Ручное обновление базовых характеристик.
  // Store НЕ считает модификаторы сам.
  // Он отправляет stats на backend, а потом обновляет sheet.
  updateCharacterStats: async (id, stats) => {
    set({ isLoading: true, error: null })

    try {
      await updateCharacterStatsRequest(id, stats)
      await get().fetchCharacterSheet(id)
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

  // Генерация статов через 4d6 drop lowest.
  // Store НЕ кидает кубы сам.
  // Backend генерирует значения, сохраняет stats и возвращает подробные rolls.
  rollCharacterStats: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const result = await rollCharacterStatsRequest(id)

      // После генерации подтягиваем свежий sheet,
      // чтобы UI получил новые stats и derived modifiers.
      await get().fetchCharacterSheet(id)

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

  // Наносит урон.
  // Store НЕ считает HP сам: backend меняет HP, потом мы обновляем sheet.
  damageCharacter: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      await damageCharacterRequest(id, amount)
      await get().fetchCharacterSheet(id)
    } catch (error) {
      console.error('Failed to damage character:', error)

      set({
        error: getErrorMessage('Не удалось нанести урон персонажу', error),
        isLoading: false,
      })
    }
  },

  // Лечит персонажа.
  // Ограничение по max HP должно быть на backend.
  healCharacter: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      await healCharacterRequest(id, amount)
      await get().fetchCharacterSheet(id)
    } catch (error) {
      console.error('Failed to heal character:', error)

      set({
        error: getErrorMessage('Не удалось исцелить персонажа', error),
        isLoading: false,
      })
    }
  },

  // Устанавливает временные HP.
  setTemporaryHp: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      await setTemporaryHpRequest(id, amount)
      await get().fetchCharacterSheet(id)
    } catch (error) {
      console.error('Failed to set temporary HP:', error)

      set({
        error: getErrorMessage('Не удалось обновить временные HP', error),
        isLoading: false,
      })
    }
  },

  // Повышает уровень персонажа.
  // Store НЕ считает HP и НЕ бросает кубик.
  // Он только отправляет выбор пользователя на backend:
  // fixed — сервер прибавит фиксированное значение
  // roll — сервер сам бросит кость хитов
  levelUpCharacter: async (id, hpMode) => {
    set({ isLoading: true, error: null })

    try {
      await levelUpCharacterRequest(id, hpMode)

      // После повышения уровня обязательно подтягиваем свежий sheet.
      // Именно сервер возвращает актуальные:
      // - level
      // - derived.maxHp
      // - hitDice
      // - hpIncreases
      await get().fetchCharacterSheet(id)
    } catch (error) {
      console.error('Failed to level up character:', error)

      set({
        error: getErrorMessage('Не удалось повысить уровень персонажа', error),
        isLoading: false,
      })
    }
  },

  // =========================================================
  // Attacks
  // =========================================================

  // Создаёт атаку через backend.
  // Store НЕ генерирует id.
  addAttack: async (characterId, attack) => {
    set({ isLoading: true, error: null })

    try {
      await addAttackRequest(characterId, attack)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to add attack:', error)

      set({
        error: getErrorMessage('Не удалось добавить атаку', error),
        isLoading: false,
      })
    }
  },

  // Обновляет атаку через backend.
  updateAttack: async (characterId, attackId, attack) => {
    set({ isLoading: true, error: null })

    try {
      await updateAttackRequest(characterId, attackId, attack)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to update attack:', error)

      set({
        error: getErrorMessage('Не удалось обновить атаку', error),
        isLoading: false,
      })
    }
  },

  // Удаляет атаку через backend.
  deleteAttack: async (characterId, attackId) => {
    set({ isLoading: true, error: null })

    try {
      await deleteAttackRequest(characterId, attackId)
      await get().fetchCharacterSheet(characterId)
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

  // Создаёт заклинание через backend.
  addSpell: async (characterId, spell) => {
    set({ isLoading: true, error: null })

    try {
      await addSpellRequest(characterId, spell)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to add spell:', error)

      set({
        error: getErrorMessage('Не удалось добавить заклинание', error),
        isLoading: false,
      })
    }
  },

  // Обновляет заклинание через backend.
  updateSpell: async (characterId, spellId, spell) => {
    set({ isLoading: true, error: null })

    try {
      await updateSpellRequest(characterId, spellId, spell)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to update spell:', error)

      set({
        error: getErrorMessage('Не удалось обновить заклинание', error),
        isLoading: false,
      })
    }
  },

  // Удаляет заклинание через backend.
  deleteSpell: async (characterId, spellId) => {
    set({ isLoading: true, error: null })

    try {
      await deleteSpellRequest(characterId, spellId)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to delete spell:', error)

      set({
        error: getErrorMessage('Не удалось удалить заклинание', error),
        isLoading: false,
      })
    }
  },

  // =========================================================
  // Spell slots
  // =========================================================

  // Обновляет spell slots через backend.
  // Store НЕ считает used/total как истину.
  updateSpellSlots: async (characterId, spellSlots) => {
    set({ isLoading: true, error: null })

    try {
      await updateSpellSlotsRequest(characterId, spellSlots)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to update spell slots:', error)

      set({
        error: getErrorMessage('Не удалось обновить ячейки заклинаний', error),
        isLoading: false,
      })
    }
  },

  // Обновляет spellcasting ability через backend.
  updateSpellcastingAbility: async (characterId, ability) => {
    set({ isLoading: true, error: null })

    try {
      await updateSpellcastingAbilityRequest(characterId, ability)
      await get().fetchCharacterSheet(characterId)
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
  // Inventory / equipment
  // =========================================================

  // Добавляет предмет персонажу через backend.
  addItem: async (characterId, item) => {
    set({ isLoading: true, error: null })

    try {
      await addItemRequest(characterId, item)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to add item:', error)

      set({
        error: getErrorMessage('Не удалось добавить предмет', error),
        isLoading: false,
      })
    }
  },

  // Обновляет предмет персонажа через backend.
  updateItem: async (characterId, itemId, item) => {
    set({ isLoading: true, error: null })

    try {
      await updateItemRequest(characterId, itemId, item)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to update item:', error)

      set({
        error: getErrorMessage('Не удалось обновить предмет', error),
        isLoading: false,
      })
    }
  },

  // Удаляет предмет персонажа через backend.
  deleteItem: async (characterId, itemId) => {
    set({ isLoading: true, error: null })

    try {
      await deleteItemRequest(characterId, itemId)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to delete item:', error)

      set({
        error: getErrorMessage('Не удалось удалить предмет', error),
        isLoading: false,
      })
    }
  },

  // Экипирует предмет.
  // Store НЕ проверяет слот и НЕ применяет эффекты предмета.
  // Всё это делает backend.
  equipItem: async (characterId, itemId) => {
    set({ isLoading: true, error: null })

    try {
      await equipItemRequest(characterId, itemId)
      await get().fetchCharacterSheet(characterId)
    } catch (error) {
      console.error('Failed to equip item:', error)

      set({
        error: getErrorMessage('Не удалось экипировать предмет', error),
        isLoading: false,
      })
    }
  },

  // Снимает предмет.
  unequipItem: async (characterId, itemId) => {
    set({ isLoading: true, error: null })

    try {
      await unequipItemRequest(characterId, itemId)
      await get().fetchCharacterSheet(characterId)
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

  // Локально выставляет текущего персонажа.
  // Это не backend-действие.
  setCurrentCharacter: (character) => {
    set({ currentCharacter: character })
  },

  // Очищает текущего персонажа.
  clearCurrentCharacter: () => {
    set({ currentCharacter: null })
  },

  // Очищает текущий sheet.
  clearCurrentSheet: () => {
    set({ currentSheet: null })
  },
}))