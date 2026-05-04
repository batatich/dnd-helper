import { create } from 'zustand'
import type { Character } from '../types/characters'
import {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  damageCharacter,
  healCharacter,
  setTemporaryHp,
  type CreateCharacterInput,
  type UpdateCharacterInput,
} from '../api/characterApi'

// =========================================================
// Интерфейс store
// =========================================================

// CharacterStore хранит:
// - список персонажей
// - текущего открытого персонажа
// - состояние загрузки
// - текст последней ошибки
//
// А также публичные actions, которые вызываются из UI.
interface CharacterStore {
  characters: Character[]
  currentCharacter: Character | null
  isLoading: boolean
  error: string | null

  // =========================================================
  // Characters
  // =========================================================

  // Загрузить список всех персонажей
  fetchCharacters: () => Promise<void>

  // Загрузить одного персонажа по ID
  fetchCharacterById: (id: string) => Promise<void>

  // Создать нового персонажа
  addCharacter: (character: CreateCharacterInput) => Promise<void>

  // Обновить базовые данные персонажа
  updateCharacter: (id: string, updated: UpdateCharacterInput) => Promise<void>

  // Удалить персонажа
  deleteCharacter: (id: string) => Promise<void>

  // =========================================================
  // HP
  // =========================================================

  // Нанести урон персонажу
  damageCharacter: (id: string, amount: number) => Promise<void>

  // Исцелить персонажа
  healCharacter: (id: string, amount: number) => Promise<void>

  // Установить temporary HP
  setTemporaryHp: (id: string, amount: number) => Promise<void>

  // =========================================================
  // UI helpers
  // =========================================================

  // Локально установить текущего персонажа
  setCurrentCharacter: (character: Character | null) => void

  // Очистить текущего персонажа
  clearCurrentCharacter: () => void
}

// =========================================================
// Вспомогательные функции
// =========================================================

// Добавляет персонажа в список, если его там ещё нет,
// либо заменяет уже существующую запись по id.
//
// Это нужно, чтобы после fetch/update/hp-action
// список characters и currentCharacter не расходились.
const mergeCharacterIntoList = (
  characters: Character[],
  character: Character
): Character[] => {
  const exists = characters.some((item) => item.id === character.id)

  if (!exists) {
    return [...characters, character]
  }

  return characters.map((item) => (item.id === character.id ? character : item))
}

// Универсальный helper для получения понятного текста ошибки.
// Если сервер прислал нормальное сообщение — используем его.
// Иначе возвращаем fallback.
const getErrorMessage = (fallback: string, error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

// =========================================================
// Zustand store
// =========================================================

export const useCharacterStore = create<CharacterStore>((set) => ({
  // Начальное состояние store
  characters: [],
  currentCharacter: null,
  isLoading: false,
  error: null,

  // =========================================================
  // Characters
  // =========================================================

  // Загружает список всех персонажей с сервера
  // и полностью заменяет локальный массив characters.
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

  // Загружает одного персонажа по id.
  // После успешной загрузки:
  // - сохраняет его в currentCharacter
  // - синхронизирует его с общим списком characters
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

  // Создаёт нового персонажа на сервере.
  // После создания:
  // - добавляет его в список
  // - делает его текущим персонажем
  addCharacter: async (character) => {
    set({ isLoading: true, error: null })

    try {
      const createdCharacter = await createCharacter(character)

      set((state) => ({
        characters: mergeCharacterIntoList(state.characters, createdCharacter),
        currentCharacter: createdCharacter,
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

  // Обновляет базовые данные персонажа на сервере.
  // Если этот персонаж открыт сейчас в currentCharacter,
  // то обновляем и его тоже.
  updateCharacter: async (id, updated) => {
    set({ isLoading: true, error: null })

    try {
      const updatedCharacter = await updateCharacter(id, updated)

      set((state) => ({
        characters: mergeCharacterIntoList(state.characters, updatedCharacter),
        currentCharacter:
          state.currentCharacter?.id === id
            ? updatedCharacter
            : state.currentCharacter,
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

  // Удаляет персонажа на сервере.
  // После успешного удаления:
  // - убирает его из списка
  // - очищает currentCharacter, если был открыт именно он
  deleteCharacter: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await deleteCharacter(id)

      set((state) => ({
        characters: state.characters.filter((char) => char.id !== id),
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

  // =========================================================
  // HP
  // =========================================================

  // Наносит урон персонажу через backend action endpoint.
  // Сервер сам считает:
  // - как урон проходит через temporary HP
  // - сколько останется current HP
  //
  // После ответа сервера синхронизируем:
  // - список characters
  // - currentCharacter, если это активный персонаж
  damageCharacter: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      const updatedCharacter = await damageCharacter(id, amount)

      set((state) => ({
        characters: mergeCharacterIntoList(state.characters, updatedCharacter),
        currentCharacter:
          state.currentCharacter?.id === id
            ? updatedCharacter
            : state.currentCharacter,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to damage character:', error)
      set({
        error: getErrorMessage('Не удалось нанести урон персонажу', error),
        isLoading: false,
      })
    }
  },

  // Исцеляет персонажа через backend action endpoint.
  // После ответа сервера обновляем и список, и currentCharacter.
  healCharacter: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      const updatedCharacter = await healCharacter(id, amount)

      set((state) => ({
        characters: mergeCharacterIntoList(state.characters, updatedCharacter),
        currentCharacter:
          state.currentCharacter?.id === id
            ? updatedCharacter
            : state.currentCharacter,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to heal character:', error)
      set({
        error: getErrorMessage('Не удалось исцелить персонажа', error),
        isLoading: false,
      })
    }
  },

  // Устанавливает temporary HP через backend action endpoint.
  // Сервер остаётся источником истины, а store только сохраняет результат.
  setTemporaryHp: async (id, amount) => {
    set({ isLoading: true, error: null })

    try {
      const updatedCharacter = await setTemporaryHp(id, amount)

      set((state) => ({
        characters: mergeCharacterIntoList(state.characters, updatedCharacter),
        currentCharacter:
          state.currentCharacter?.id === id
            ? updatedCharacter
            : state.currentCharacter,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to set temporary HP:', error)
      set({
        error: getErrorMessage('Не удалось обновить временные HP', error),
        isLoading: false,
      })
    }
  },

  // =========================================================
  // UI helpers
  // =========================================================

  // Локально меняет currentCharacter.
  // Нужен для UI-сценариев, где не требуется запрос на сервер.
  setCurrentCharacter: (character) => set({ currentCharacter: character }),

  // Полностью очищает текущего персонажа из store.
  clearCurrentCharacter: () => set({ currentCharacter: null }),
}))