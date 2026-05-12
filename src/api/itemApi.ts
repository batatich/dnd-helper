import type { ItemTemplate } from '../types/items'
import { httpClient } from './httpClient'

/**
 * Получить справочник шаблонов предметов.
 *
 * ItemTemplate — это backend-шаблон предмета:
 * - name
 * - type
 * - slot legacy/fallback
 * - allowedSlots
 * - effects
 * - weaponConfig
 */
export function getItemTemplates(): Promise<ItemTemplate[]> {
  return httpClient.get<ItemTemplate[]>('/items')
}