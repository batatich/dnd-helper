import { create } from 'zustand'
import type { Item } from '../types/items'
import { items as initialItems } from '../data/items'

const STORAGE_KEY = 'dnd-items'

const loadItems = (): Item[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return initialItems
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return initialItems
    }

    return parsed
  } catch (error) {
    console.error('Failed to load items from localStorage:', error)
    return initialItems
  }
}

const saveItems = (items: Item[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save items to localStorage:', error)
  }
}

interface ItemsStore {
  items: Item[]
  addItem: (item: Item) => void
  updateItem: (id: string, updated: Partial<Item>) => void
  deleteItem: (id: string) => void
  setItems: (items: Item[]) => void
}

export const useItemsStore = create<ItemsStore>((set) => ({
  items: loadItems(),

  addItem: (item) =>
    set((state) => {
      const newItems = [...state.items, item]
      saveItems(newItems)
      return { items: newItems }
    }),

  updateItem: (id, updated) =>
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updated,
            }
          : item
      )

      saveItems(newItems)
      return { items: newItems }
    }),

  deleteItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id)
      saveItems(newItems)
      return { items: newItems }
    }),

  setItems: (items) => {
    saveItems(items)
    set({ items })
  },
}))