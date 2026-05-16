import { create } from 'zustand'
import { getItemTemplates } from '../api/itemApi'
import type { ItemTemplateResponse } from '../types/items'

interface ItemsStore {
  items: ItemTemplateResponse[]
  isLoading: boolean
  error: string | null

  fetchItems: () => Promise<void>
  setItems: (items: ItemTemplateResponse[]) => void
  clearItems: () => void
}

const getErrorMessage = (fallback: string, error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export const useItemsStore = create<ItemsStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null })

    try {
      const items = await getItemTemplates()

      set({
        items,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch item templates:', error)

      set({
        error: getErrorMessage('Не удалось загрузить справочник предметов', error),
        isLoading: false,
      })

      throw error
    }
  },

  setItems: (items) => {
    set({ items })
  },

  clearItems: () => {
    set({
      items: [],
      error: null,
    })
  },
}))
