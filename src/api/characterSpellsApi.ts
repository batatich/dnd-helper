import type { NewSpell } from '../types/spells'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

export type UpdateSpellInput = Partial<NewSpell>

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