import { create } from 'zustand'
import { getCharacterSheet } from '../api/characterSheetApi'
import type { CharacterSheet } from '../types/characterSheet'

// =========================================================
// CharacterSheetStore
// =========================================================
// Этот store отвечает только за полный лист персонажа.
//
// Он НЕ отвечает за:
// - список персонажей
// - создание / удаление персонажа
// - локальный расчёт статов
// - экипировку
// - атаки
// - заклинания
//
// Его задача:
// 1. запросить GET /characters/:id/sheet
// 2. сохранить готовый sheet в currentSheet
// 3. отдать CharacterSheet.tsx уже собранные данные
// =========================================================

type CharacterSheetStore = {
  // =======================================================
  // State
  // =======================================================
  // currentSheet — готовый лист персонажа с backend.
  // Это главный источник данных для CharacterSheet.tsx.
  // =======================================================

  currentSheet: CharacterSheet | null

  // =======================================================
  // Loading state
  // =======================================================
  // isLoading нужен для первичной загрузки sheet.
  // error нужен для отображения ошибки на странице.
  // =======================================================

  isLoading: boolean
  error: string | null

  // =======================================================
  // Actions
  // =======================================================

  // Загружает полный лист персонажа с backend.
  fetchCharacterSheet: (characterId: string) => Promise<CharacterSheet | null>

  // Принудительно записывает sheet.
  // Нужно редко, но полезно как технический setter.
  setCurrentSheet: (sheet: CharacterSheet | null) => void

  // Очищает текущий sheet.
  // Используется при уходе со страницы или смене персонажа.
  clearCurrentSheet: () => void

  // Перезагружает уже открытый sheet.
  // Удобно после действий, которые пока остались в старом store.
  refreshCurrentSheet: () => Promise<CharacterSheet | null>
}

// =========================================================
// Helpers
// =========================================================
// Маленький helper для нормального текста ошибки.
// Не содержит игровой логики.
// =========================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить лист персонажа'
}

// =========================================================
// Store
// =========================================================
// Здесь нет calculateCharacter, useItemsStore и локальных правил.
// Store только вызывает API и кладёт ответ backend в state.
// =========================================================
let latestSheetRequestId = 0
export const useCharacterSheetStore = create<CharacterSheetStore>(
  (set, get) => ({
    // =====================================================
    // Initial state
    // =====================================================

    currentSheet: null,
    isLoading: false,
    error: null,

    // =====================================================
    // Load character sheet
    // =====================================================
    // Главный action этого store.
    //
    // Поток:
    // CharacterSheet.tsx
    //   → fetchCharacterSheet(id)
    //   → characterApi.getCharacterSheet(id)
    //   → backend GET /characters/:id/sheet
    //   → currentSheet
    // =====================================================

    fetchCharacterSheet: async (characterId: string) => {
      const requestId = ++latestSheetRequestId

      set({
        isLoading: true,
        error: null,
      })

      try {
        const sheet = await getCharacterSheet(characterId)

        if (requestId !== latestSheetRequestId) {
          return sheet
        }

        set({
          currentSheet: sheet,
          isLoading: false,
          error: null,
        })

        return sheet
      } catch (error) {
        if (requestId !== latestSheetRequestId) {
          throw error
        }

        const message = getErrorMessage(error)

        set({
          currentSheet: null,
          isLoading: false,
          error: message,
        })

        throw error
      }
    },

    // =====================================================
    // Set current sheet
    // =====================================================
    // Технический setter.
    // Не делает запросов и не считает данные.
    // =====================================================

    setCurrentSheet: (sheet: CharacterSheet | null) => {
      set({
        currentSheet: sheet,
        error: null,
      })
    },

    // =====================================================
    // Clear current sheet
    // =====================================================
    // Очищает лист, например при уходе со страницы.
    // =====================================================

    clearCurrentSheet: () => {
      set({
        currentSheet: null,
        isLoading: false,
        error: null,
      })
    },

    // =====================================================
    // Refresh current sheet
    // =====================================================
    // Перезагружает sheet по id текущего sheet.
    //
    // Это удобно на переходном этапе:
    // actions живут в characterStore,
    // а после их выполнения можно обновить currentSheet.
    // =====================================================

    refreshCurrentSheet: async () => {
      const sheet = get().currentSheet

      if (!sheet) {
        return null
      }

      return get().fetchCharacterSheet(sheet.character.id)
    },
  }),
)
