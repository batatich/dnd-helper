import type { Character, NewSpell, NewAttack, Stats } from '../types/characters'
import type {
  EquipmentSlot,
  ItemEffect,
  ItemType,
  WeaponConfig,
} from '../types/items'
import { httpClient } from './httpClient'

// =========================================================
// Types
// =========================================================

export type DeathSaves = {
  successes: number
  failures: number
}

export type HitDice = {
  total: number
  used: number
  dice: string
}

export type HpState = {
  id: string
  currentHp: number
  temporaryHp: number
}

export type CreateCharacterInput = {
  name: string
  race: string
  className: string
  level?: number
  description?: string | null
  alignment?: string | null
  background?: string | null
  avatarUrl?: string | null
  speed?: number
  spellcastingAbility?: keyof Stats | null
}

export type UpdateCharacterInput = {
  name?: string
  race?: string
  className?: string
  level?: number
  description?: string | null
  alignment?: string | null
  background?: string | null
  avatarUrl?: string | null
  speed?: number
  spellcastingAbility?: keyof Stats | null
}

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

type BackendCharacter = Character & {
  stats?: Stats | null
  items?: unknown[]
  deathSaveSuccesses?: number
  deathSaveFailures?: number
  hitDiceTotal?: number | null
  hitDiceUsed?: number | null
  hitDiceDice?: string | null
}

export type UpdateSpellInput = Partial<NewSpell>

/**
 * Старый тип для legacy updateSpellSlots().
 * Пока оставляем, чтобы не сломать characterStore до следующего шага.
 * После правки characterStore этот тип и updateSpellSlots можно удалить.
 */

export type AbilityRollResult = {
  dice: number[]
  dropped: number
  total: number
}

export type RollCharacterStatsResult = {
  character: Character
  stats: Stats
  rolls: Record<keyof Stats, AbilityRollResult>
}

// =========================================================
// Mappers / helpers
// =========================================================

function mapCharacterPayloadToBackend(
  data: CreateCharacterInput | UpdateCharacterInput
) {
  // Обычный create/update персонажа больше не прокидывает HP, death saves,
  // hit dice, inspiration и spell slots. Эти поля меняются отдельными backend actions.
  return removeUndefinedValues({
    name: data.name,
    race: data.race,
    className: data.className,
    level: data.level,
    description: data.description,
    alignment: data.alignment,
    background: data.background,
    avatarUrl: data.avatarUrl,
    speed: data.speed,
    spellcastingAbility: data.spellcastingAbility,
  })
}

function mapBackendCharacterToFrontend(data: BackendCharacter): Character {
  return {
    ...data,
    className: data.className ?? '',

    baseStats: data.baseStats ?? data.stats,

    inventory: (data.inventory ?? data.items ?? []) as Character['inventory'],

    deathSaves: data.deathSaves ?? {
      successes: data.deathSaveSuccesses ?? 0,
      failures: data.deathSaveFailures ?? 0,
    },

    hitDice: data.hitDice ?? {
      total: data.hitDiceTotal ?? data.level ?? 1,
      used: data.hitDiceUsed ?? 0,
      dice: data.hitDiceDice ?? `${data.level ?? 1}d8`,
    },

    spellSlots: data.spellSlots ?? [],

    attacks: data.attacks ?? [],
    spells: data.spells ?? [],

    savingThrowProficiencies: data.savingThrowProficiencies ?? [],
    skills: data.skills ?? [],

    equippedItems: data.equippedItems ?? {
      mainHand: null,
      offHand: null,
      head: null,
      body: null,
      ring1: null,
      ring2: null,
      amulet: null,
      boots: null,
    },

    derivedStats: data.derivedStats ?? {
      armorClass: 10,
      initiative: 0,
      maxHp: data.currentHp ?? 0,
    },
  } as Character
}

/**
 * Убирает только undefined.
 *
 * null оставляем, потому что backend может использовать null
 * как осознанную очистку nullable-поля:
 * description: null
 * avatarUrl: null
 * spellcastingAbility: null
 */
function removeUndefinedValues<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )
}

/**
 * Backend attack schemas strict и не должны принимать calculated/item поля
 * с frontend.
 */
function mapAttackPayloadToBackend(data: Partial<NewAttack>) {
  const {
    id: _id,
    source: _source,
    itemId: _itemId,
    attackBonus: _attackBonus,
    damageBonusFinal: _damageBonusFinal,
    ...payload
  } = data as Partial<NewAttack> & {
    id?: string
    source?: 'manual' | 'item'
    itemId?: string | null
    attackBonus?: number
    damageBonusFinal?: number
  }

  return removeUndefinedValues(payload)
}

// =========================================================
// Characters
// =========================================================

export async function getCharacters(): Promise<Character[]> {
  const data = await httpClient.get<BackendCharacter[]>('/characters')
  return data.map(mapBackendCharacterToFrontend)
}

export async function getCharacterById(id: string): Promise<Character> {
  const data = await httpClient.get<BackendCharacter>(`/characters/${id}`)
  return mapBackendCharacterToFrontend(data)
}

export async function createCharacter(
  data: CreateCharacterInput
): Promise<Character> {
  const created = await httpClient.post<BackendCharacter>(
    '/characters',
    mapCharacterPayloadToBackend(data)
  )

  return mapBackendCharacterToFrontend(created)
}

export async function updateCharacter(
  id: string,
  data: UpdateCharacterInput
): Promise<Character> {
  const updated = await httpClient.patch<BackendCharacter>(
    `/characters/${id}`,
    mapCharacterPayloadToBackend(data)
  )

  return mapBackendCharacterToFrontend(updated)
}

export async function updateCharacterStats(
  characterId: string,
  baseStats: Stats
): Promise<Character> {
  const updated = await httpClient.patch<BackendCharacter>(
    `/characters/${characterId}/stats`,
    baseStats
  )

  return mapBackendCharacterToFrontend(updated)
}

export async function rollCharacterStats(
  characterId: string
): Promise<RollCharacterStatsResult> {
  const result = await httpClient.post<{
    character: BackendCharacter
    stats: Stats
    rolls: Record<keyof Stats, AbilityRollResult>
  }>(`/characters/${characterId}/stats/roll`)

  return {
    character: mapBackendCharacterToFrontend(result.character),
    stats: result.stats,
    rolls: result.rolls,
  }
}

export function deleteCharacter(id: string): Promise<void> {
  return httpClient.delete<void>(`/characters/${id}`)
}

// =========================================================
// HP
// =========================================================

export function damageCharacter(id: string, amount: number): Promise<HpState> {
  return httpClient.post<HpState>(`/characters/${id}/hp/damage`, { amount })
}

export function healCharacter(id: string, amount: number): Promise<HpState> {
  return httpClient.post<HpState>(`/characters/${id}/hp/heal`, { amount })
}

export function setTemporaryHp(id: string, amount: number): Promise<HpState> {
  return httpClient.post<HpState>(`/characters/${id}/hp/temp`, { amount })
}

// Повышение уровня персонажа.
// hpMode:
// fixed — фиксированная прибавка HP
// roll — сервер бросает кость хитов.
export function levelUpCharacter(
  characterId: string,
  hpMode: 'fixed' | 'roll'
): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/level-up`, {
    hpMode,
  })
}

export function useHitDie(characterId: string): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/hit-dice/use`)
}

export function restoreHitDie(characterId: string): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/hit-dice/restore`)
}

export function setCharacterInspiration(
  characterId: string,
  inspiration: boolean
): Promise<unknown> {
  return httpClient.patch(`/characters/${characterId}/inspiration`, {
    inspiration,
  })
}

export function addDeathSaveSuccess(characterId: string): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/death-saves/success`)
}

export function addDeathSaveFailure(characterId: string): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/death-saves/failure`)
}

export function resetDeathSaves(characterId: string): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/death-saves/reset`)
}

// =========================================================
// Inventory
// =========================================================

export function addItem(
  characterId: string,
  data: CreateItemInput
): Promise<unknown> {
  return httpClient.post(
    `/characters/${characterId}/items`,
    removeUndefinedValues(data)
  )
}

export function updateItem(
  characterId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<unknown> {
  return httpClient.patch(
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
): Promise<unknown> {
  return httpClient.post(
    `/characters/${characterId}/items/${itemId}/equip`,
    equippedSlot ? { equippedSlot } : {}
  )
}

export function unequipItem(
  characterId: string,
  itemId: string
): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/items/${itemId}/unequip`)
}

// =========================================================
// Spells
// =========================================================

export async function addSpell(
  characterId: string,
  data: NewSpell
): Promise<void> {
  await httpClient.post(
    `/characters/${characterId}/spells`,
    removeUndefinedValues(data)
  )
}

export async function updateSpell(
  characterId: string,
  spellId: string,
  data: UpdateSpellInput
): Promise<void> {
  await httpClient.patch(
    `/characters/${characterId}/spells/${spellId}`,
    removeUndefinedValues(data)
  )
}

export async function deleteSpell(
  characterId: string,
  spellId: string
): Promise<void> {
  await httpClient.delete(`/characters/${characterId}/spells/${spellId}`)
}

export async function updateSpellcastingAbility(
  characterId: string,
  ability: keyof Stats | null
): Promise<Character> {
  return updateCharacter(characterId, {
    spellcastingAbility: ability,
  })
}

// =========================================================
// Spell slots actions
// =========================================================
// Эти методы НЕ пересобирают весь массив spellSlots на фронте.
// Они отправляют на backend конкретное действие.
// =========================================================

export function setSpellSlotTotal(
  characterId: string,
  level: number,
  total: number
): Promise<unknown> {
  return httpClient.patch(
    `/characters/${characterId}/spell-slots/${level}/total`,
    {
      total,
    }
  )
}

export function useSpellSlot(
  characterId: string,
  level: number
): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/spell-slots/${level}/use`)
}

export function restoreSpellSlot(
  characterId: string,
  level: number
): Promise<unknown> {
  return httpClient.post(
    `/characters/${characterId}/spell-slots/${level}/restore`
  )
}

// =========================================================
// Attacks
// =========================================================

export async function addAttack(
  characterId: string,
  data: NewAttack
): Promise<void> {
  await httpClient.post(
    `/characters/${characterId}/attacks`,
    mapAttackPayloadToBackend(data)
  )
}

export async function updateAttack(
  characterId: string,
  attackId: string,
  data: Partial<NewAttack>
): Promise<void> {
  await httpClient.patch(
    `/characters/${characterId}/attacks/${attackId}`,
    mapAttackPayloadToBackend(data)
  )
}

export async function deleteAttack(
  characterId: string,
  attackId: string
): Promise<void> {
  await httpClient.delete(`/characters/${characterId}/attacks/${attackId}`)
}