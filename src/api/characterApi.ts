import type { Character, NewSpell, NewAttack, Stats } from '../types/characters'
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

export type CreateItemInput = {
  itemTemplateId?: string
  nameSnapshot?: string
  quantity?: number
  isEquipped?: boolean
  slot?: string
  notes?: string
}

export type UpdateItemInput = {
  nameSnapshot?: string
  quantity?: number
  isEquipped?: boolean
  slot?: string | null
  notes?: string
}

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

export type SpellSlotInput = {
  level: number
  total: number
  used: number
}

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
// Mappers
// =========================================================

function mapCharacterPayloadToBackend(
  data: CreateCharacterInput | UpdateCharacterInput
) {
  // Обычный create/update персонажа больше не прокидывает HP, death saves,
  // hit dice, inspiration и spell slots. Эти поля меняются отдельными backend actions.
  return removeEmptyValues({
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

function removeEmptyValues<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
  )
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

export async function damageCharacter(
  id: string,
  amount: number
): Promise<Character> {
  const updated = await httpClient.post<BackendCharacter>(
    `/characters/${id}/hp/damage`,
    { amount }
  )

  return mapBackendCharacterToFrontend(updated)
}

export async function healCharacter(
  id: string,
  amount: number
): Promise<Character> {
  const updated = await httpClient.post<BackendCharacter>(
    `/characters/${id}/hp/heal`,
    { amount }
  )

  return mapBackendCharacterToFrontend(updated)
}

export async function setTemporaryHp(
  id: string,
  amount: number
): Promise<Character> {
  const updated = await httpClient.post<BackendCharacter>(
    `/characters/${id}/hp/temp`,
    { amount }
  )

  return mapBackendCharacterToFrontend(updated)
}

// Повышение уровня персонажа.
// hpMode:
// fixed — фиксированная прибавка HP
// roll — сервер бросает кость хитов (1d8)
export async function levelUpCharacter(
  characterId: string,
  hpMode: 'fixed' | 'roll',
) {
  return httpClient.post(`/characters/${characterId}/level-up`, {
    hpMode,
  })
}

export async function useHitDie(characterId: string) {
  return httpClient.post(`/characters/${characterId}/hit-dice/use`)
}

export async function restoreHitDie(characterId: string) {
  return httpClient.post(`/characters/${characterId}/hit-dice/restore`)
}

export async function setCharacterInspiration(
  characterId: string,
  inspiration: boolean
) {
  return httpClient.patch(`/characters/${characterId}/inspiration`, {
    inspiration,
  })
}

export async function addDeathSaveSuccess(characterId: string) {
  return httpClient.post(`/characters/${characterId}/death-saves/success`)
}

export async function addDeathSaveFailure(characterId: string) {
  return httpClient.post(`/characters/${characterId}/death-saves/failure`)
}

export async function resetDeathSaves(characterId: string) {
  return httpClient.post(`/characters/${characterId}/death-saves/reset`)
}
// =========================================================
// Inventory
// =========================================================

export function addItem(
  characterId: string,
  data: CreateItemInput
): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/items`, data)
}

export function updateItem(
  characterId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<unknown> {
  return httpClient.patch(`/characters/${characterId}/items/${itemId}`, data)
}

export function deleteItem(
  characterId: string,
  itemId: string
): Promise<void> {
  return httpClient.delete<void>(`/characters/${characterId}/items/${itemId}`)
}

export function equipItem(
  characterId: string,
  itemId: string
): Promise<unknown> {
  return httpClient.post(`/characters/${characterId}/items/${itemId}/equip`)
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
  await httpClient.post(`/characters/${characterId}/spells`, data)
}

export async function updateSpell(
  characterId: string,
  spellId: string,
  data: UpdateSpellInput
): Promise<void> {
  await httpClient.patch(
    `/characters/${characterId}/spells/${spellId}`,
    removeEmptyValues(data)
  )
}

export async function deleteSpell(
  characterId: string,
  spellId: string
): Promise<void> {
  await httpClient.delete(`/characters/${characterId}/spells/${spellId}`)
}

/**
 * Устаревший метод.
 * Лучше больше не использовать: вместо него есть действия
 * setSpellSlotTotal / useSpellSlot / restoreSpellSlot.
 */
export async function updateSpellSlots(
  characterId: string,
  spellSlots: SpellSlotInput[]
): Promise<void> {
  await httpClient.patch(`/characters/${characterId}/spell-slots`, {
    spellSlots,
  })
}

export async function updateSpellcastingAbility(
  characterId: string,
  ability: keyof Stats
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

export async function setSpellSlotTotal(
  characterId: string,
  level: number,
  total: number
) {
  return httpClient.patch(
    `/characters/${characterId}/spell-slots/${level}/total`,
    {
      total,
    }
  )
}

export async function useSpellSlot(characterId: string, level: number) {
  return httpClient.post(
    `/characters/${characterId}/spell-slots/${level}/use`
  )
}

export async function restoreSpellSlot(characterId: string, level: number) {
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
    removeEmptyValues(data)
  )
}

export async function updateAttack(
  characterId: string,
  attackId: string,
  data: Partial<NewAttack>
): Promise<void> {
  await httpClient.patch(
    `/characters/${characterId}/attacks/${attackId}`,
    removeEmptyValues(data)
  )
}

export async function deleteAttack(
  characterId: string,
  attackId: string
): Promise<void> {
  await httpClient.delete(`/characters/${characterId}/attacks/${attackId}`)
}