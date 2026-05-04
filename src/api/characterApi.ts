import type { Character, NewSpell, NewAttack, Stats } from '../types/characters'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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

export type ItemTemplate = {
  id: string
  name: string
  type?: string | null
  slot?: string | null
  description?: string | null
  effects?: unknown
  createdAt: string
  updatedAt: string
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

    // backend отдаёт stats, frontend ждёт baseStats
    baseStats: data.baseStats ?? data.stats,

    // backend отдаёт items, frontend ждёт inventory
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

// =========================================================
// Request helper
// =========================================================

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const data = await response.json()
      message = data.message ?? message
    } catch {
      // сервер не вернул JSON
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// =========================================================
// Characters
// =========================================================

export async function getCharacters(): Promise<Character[]> {
  const data = await request<BackendCharacter[]>('/characters')
  return data.map(mapBackendCharacterToFrontend)
}

export async function getCharacterById(id: string): Promise<Character> {
  const data = await request<BackendCharacter>(`/characters/${id}`)
  return mapBackendCharacterToFrontend(data)
}

export async function getCharacterSheet(id: string): Promise<Character> {
  const data = await request<BackendCharacter>(`/characters/${id}/sheet`)
  return mapBackendCharacterToFrontend(data)
}

export async function createCharacter(
  data: CreateCharacterInput
): Promise<Character> {
  const created = await request<BackendCharacter>('/characters', {
    method: 'POST',
    body: JSON.stringify(mapCharacterPayloadToBackend(data)),
  })

  return mapBackendCharacterToFrontend(created)
}

export async function updateCharacter(
  id: string,
  data: UpdateCharacterInput
): Promise<Character> {
  const updated = await request<BackendCharacter>(`/characters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(mapCharacterPayloadToBackend(data)),
  })

  return mapBackendCharacterToFrontend(updated)
}
export async function updateCharacterStats(
  characterId: string,
  baseStats: Stats
): Promise<Character> {
  const updated = await request<BackendCharacter>(
    `/characters/${characterId}/stats`,
    {
      method: 'PATCH',
      body: JSON.stringify(baseStats),
    }
  )

  return mapBackendCharacterToFrontend(updated)
}

export function deleteCharacter(id: string): Promise<void> {
  return request<void>(`/characters/${id}`, {
    method: 'DELETE',
  })
}

// =========================================================
// HP
// =========================================================

export async function damageCharacter(
  id: string,
  amount: number
): Promise<Character> {
  const updated = await request<BackendCharacter>(`/characters/${id}/hp/damage`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })

  return mapBackendCharacterToFrontend(updated)
}

export async function healCharacter(
  id: string,
  amount: number
): Promise<Character> {
  const updated = await request<BackendCharacter>(`/characters/${id}/hp/heal`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })

  return mapBackendCharacterToFrontend(updated)
}

export async function setTemporaryHp(
  id: string,
  amount: number
): Promise<Character> {
  const updated = await request<BackendCharacter>(`/characters/${id}/hp/temp`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })

  return mapBackendCharacterToFrontend(updated)
}

// =========================================================
// Items / Inventory
// =========================================================

export function getItemTemplates(): Promise<ItemTemplate[]> {
  return request<ItemTemplate[]>('/items')
}

export function addItem(
  characterId: string,
  data: CreateItemInput
): Promise<unknown> {
  return request(`/characters/${characterId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateItem(
  characterId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<unknown> {
  return request(`/characters/${characterId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteItem(
  characterId: string,
  itemId: string
): Promise<void> {
  return request<void>(`/characters/${characterId}/items/${itemId}`, {
    method: 'DELETE',
  })
}

export function equipItem(
  characterId: string,
  itemId: string
): Promise<unknown> {
  return request(`/characters/${characterId}/items/${itemId}/equip`, {
    method: 'POST',
  })
}

export function unequipItem(
  characterId: string,
  itemId: string
): Promise<unknown> {
  return request(`/characters/${characterId}/items/${itemId}/unequip`, {
    method: 'POST',
  })
}

// =========================================================
// Spells
// =========================================================

export async function addSpell(characterId: string, data: unknown) {
  return request(`/characters/${characterId}/spells`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateSpell(
  characterId: string,
  spellId: string,
  data: unknown
) {
  return request(`/characters/${characterId}/spells/${spellId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteSpell(
  characterId: string,
  spellId: string
) {
  return request(`/characters/${characterId}/spells/${spellId}`, {
    method: 'DELETE',
    body: JSON.stringify({}),
  })
}

export async function updateSpellSlots(
  characterId: string,
  spellSlots: unknown
) {
  return request(`/characters/${characterId}/spell-slots`, {
    method: 'PATCH',
    body: JSON.stringify({ spellSlots }),
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
// Attacks
// =========================================================

export async function addAttack(
  characterId: string,
  data: NewAttack
): Promise<Character> {
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
  )

  await request<void>(`/characters/${characterId}/attacks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return getCharacterSheet(characterId)
}

export async function updateAttack(
  characterId: string,
  attackId: string,
  data: Partial<NewAttack>
): Promise<Character> {
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
  )

  await request<void>(`/characters/${characterId}/attacks/${attackId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return getCharacterSheet(characterId)
}

export async function deleteAttack(
  characterId: string,
  attackId: string
): Promise<Character> {
  await request(`/characters/${characterId}/attacks/${attackId}`, {
    method: 'DELETE',
    body: JSON.stringify({}),
  })

  return getCharacterSheet(characterId)
}