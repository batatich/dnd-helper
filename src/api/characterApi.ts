import type { Character, NewSpell, NewAttack, Stats } from '../types/characters'
import { httpClient } from './httpClient.ts'

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
  class: string
  level?: number
  description?: string
  alignment?: string
  background?: string
  avatarUrl?: string
  currentHp?: number
  temporaryHp?: number
  speed?: number
  inspiration?: boolean
  spellcastingAbility?: keyof Stats
  deathSaves?: DeathSaves
  hitDice?: HitDice
}

export type UpdateCharacterInput = Partial<CreateCharacterInput> & {
  baseStats?: Stats
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
  const { deathSaves, hitDice, ...rest } = data

  return {
    ...rest,

    ...(deathSaves
      ? {
          deathSaveSuccesses: deathSaves.successes,
          deathSaveFailures: deathSaves.failures,
        }
      : {}),

    ...(hitDice?.total !== undefined ? { hitDiceTotal: hitDice.total } : {}),
    ...(hitDice?.used !== undefined ? { hitDiceUsed: hitDice.used } : {}),
    ...(hitDice?.dice !== undefined ? { hitDiceDice: hitDice.dice } : {}),
  }
}

function mapBackendCharacterToFrontend(data: BackendCharacter): Character {
  return {
    ...data,

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

export async function getCharacterSheet(id: string): Promise<Character> {
  const data = await httpClient.get<BackendCharacter>(`/characters/${id}/sheet`)
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
): Promise<Character> {
  await httpClient.post(`/characters/${characterId}/spells`, data)
  return getCharacterSheet(characterId)
}

export async function updateSpell(
  characterId: string,
  spellId: string,
  data: UpdateSpellInput
): Promise<Character> {
  await httpClient.patch(
    `/characters/${characterId}/spells/${spellId}`,
    removeEmptyValues(data)
  )

  return getCharacterSheet(characterId)
}

export async function deleteSpell(
  characterId: string,
  spellId: string
): Promise<Character> {
  await httpClient.delete(`/characters/${characterId}/spells/${spellId}`)
  return getCharacterSheet(characterId)
}

export async function updateSpellSlots(
  characterId: string,
  spellSlots: SpellSlotInput[]
): Promise<Character> {
  await httpClient.patch(`/characters/${characterId}/spell-slots`, {
    spellSlots,
  })

  return getCharacterSheet(characterId)
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
// Attacks
// =========================================================

export async function addAttack(
  characterId: string,
  data: NewAttack
): Promise<Character> {
  await httpClient.post(
    `/characters/${characterId}/attacks`,
    removeEmptyValues(data)
  )

  return getCharacterSheet(characterId)
}

export async function updateAttack(
  characterId: string,
  attackId: string,
  data: Partial<NewAttack>
): Promise<Character> {
  await httpClient.patch(
    `/characters/${characterId}/attacks/${attackId}`,
    removeEmptyValues(data)
  )

  return getCharacterSheet(characterId)
}

export async function deleteAttack(
  characterId: string,
  attackId: string
): Promise<Character> {
  await httpClient.delete(`/characters/${characterId}/attacks/${attackId}`)
  return getCharacterSheet(characterId)
}