import type {
  EquipmentSlot,
  ItemEffect,
  ItemType,
  WeaponConfig,
} from '../types/items'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

/**
 * Создание предмета в инвентаре персонажа.
 *
 * Важно:
 * - create item НЕ экипирует предмет;
 * - isEquipped сюда не отправляем;
 * - slot сюда не отправляем;
 * - equippedSlot используется только в equipItem().
 */
export type CreateItemInput = {
  itemTemplateId?: string | null
  nameSnapshot?: string
  quantity?: number
  notes?: string | null

  type?: ItemType | string | null
  allowedSlots?: EquipmentSlot[]
  effects?: ItemEffect[]
  weaponConfig?: WeaponConfig | null
}

/**
 * Обновление предмета.
 *
 * Важно:
 * - update item НЕ экипирует предмет;
 * - isEquipped сюда не отправляем;
 * - slot/equippedSlot сюда не отправляем.
 */
export type UpdateItemInput = Partial<CreateItemInput>

export type ItemWeaponConfigResponse = {
  attackType?: 'melee' | 'ranged' | 'spell'
  ability?:
    | 'strength'
    | 'dexterity'
    | 'constitution'
    | 'intelligence'
    | 'wisdom'
    | 'charisma'
  damageDice?: string
  damageBonus?: number
  damageType?: string
  notes?: string | null
}

export type ItemTemplateResponse = {
  id: string
  name: string
  type: ItemType | string | null
  slot: EquipmentSlot | string | null
  description: string | null
  allowedSlots: EquipmentSlot[] | null
  effects: ItemEffect[] | null
  weaponConfig: ItemWeaponConfigResponse | null
  createdAt: string
  updatedAt: string
}

export type CharacterItemResponse = {
  id: string
  characterId: string
  itemTemplateId: string | null
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  equippedSlot: EquipmentSlot | string | null
  notes: string | null
  type: ItemType | string | null
  allowedSlots: EquipmentSlot[] | null
  effects: ItemEffect[] | null
  weaponConfig: ItemWeaponConfigResponse | null
  createdAt: string
  updatedAt: string
  itemTemplate: ItemTemplateResponse | null
}

export function addItem(
  characterId: string,
  data: CreateItemInput
): Promise<CharacterItemResponse> {
  return httpClient.post<CharacterItemResponse>(
    `/characters/${characterId}/items`,
    removeUndefinedValues(data)
  )
}

export function updateItem(
  characterId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<CharacterItemResponse> {
  return httpClient.patch<CharacterItemResponse>(
    `/characters/${characterId}/items/${itemId}`,
    removeUndefinedValues(data)
  )
}

export function deleteItem(
  characterId: string,
  itemId: string
): Promise<void> {
  return httpClient.delete<void>(`/characters/${characterId}/items/${itemId}`)
}

/**
 * Экипирует предмет.
 *
 * Backend теперь ждёт:
 * {
 *   equippedSlot: "mainHand"
 * }
 *
 * equippedSlot optional, потому что backend может сам выбрать слот,
 * если допустимый слот только один.
 */
export function equipItem(
  characterId: string,
  itemId: string,
  equippedSlot?: EquipmentSlot
): Promise<CharacterItemResponse> {
  return httpClient.post<CharacterItemResponse>(
    `/characters/${characterId}/items/${itemId}/equip`,
    equippedSlot ? { equippedSlot } : {}
  )
}

export function unequipItem(
  characterId: string,
  itemId: string
): Promise<CharacterItemResponse> {
  return httpClient.post<CharacterItemResponse>(
    `/characters/${characterId}/items/${itemId}/unequip`
  )
}
