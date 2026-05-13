import type { NewSpell, SpellSlot } from '../types/spells'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

export type UpdateSpellInput = Partial<NewSpell>

export type CharacterSpellResponse = {
  id: string
  characterId: string
  name: string
  level: number
  school: string | null
  castingTime: string | null
  range: string | null
  components: string | null
  duration: string | null
  concentration: boolean
  ritual: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export type SpellSlotsResponse = {
  id: string
  spellSlots: SpellSlot[]
}

export async function addSpell(
  characterId: string,
  data: NewSpell
): Promise<CharacterSpellResponse> {
  return httpClient.post<CharacterSpellResponse>(
    `/characters/${characterId}/spells`,
    removeUndefinedValues(data)
  )
}

export async function updateSpell(
  characterId: string,
  spellId: string,
  data: UpdateSpellInput
): Promise<CharacterSpellResponse> {
  return httpClient.patch<CharacterSpellResponse>(
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
): Promise<SpellSlotsResponse> {
  return httpClient.patch<SpellSlotsResponse>(
    `/characters/${characterId}/spell-slots/${level}/total`,
    {
      total,
    }
  )
}

export function useSpellSlot(
  characterId: string,
  level: number
): Promise<SpellSlotsResponse> {
  return httpClient.post<SpellSlotsResponse>(
    `/characters/${characterId}/spell-slots/${level}/use`
  )
}

export function restoreSpellSlot(
  characterId: string,
  level: number
): Promise<SpellSlotsResponse> {
  return httpClient.post<SpellSlotsResponse>(
    `/characters/${characterId}/spell-slots/${level}/restore`
  )
}
