import { httpClient } from './httpClient'
import type { SpellSlot } from '../types/spells'

export type HpState = {
  id: string
  level: number
  currentHp: number
  temporaryHp: number
  hitDiceTotal: number | null
  hitDiceUsed: number
  hitDiceDice: string | null
  inspiration: boolean
  deathSaveSuccesses: number
  deathSaveFailures: number
  spellSlots: SpellSlot[] | null
  createdAt: string
  updatedAt: string
}

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
): Promise<HpState> {
  return httpClient.post<HpState>(`/characters/${characterId}/level-up`, {
    hpMode,
  })
}

export function useHitDie(characterId: string): Promise<HpState> {
  return httpClient.post<HpState>(`/characters/${characterId}/hit-dice/use`)
}

export function restoreHitDie(characterId: string): Promise<HpState> {
  return httpClient.post<HpState>(`/characters/${characterId}/hit-dice/restore`)
}

export function setCharacterInspiration(
  characterId: string,
  inspiration: boolean
): Promise<HpState> {
  return httpClient.patch<HpState>(`/characters/${characterId}/inspiration`, {
    inspiration,
  })
}

export function addDeathSaveSuccess(characterId: string): Promise<HpState> {
  return httpClient.post<HpState>(
    `/characters/${characterId}/death-saves/success`
  )
}

export function addDeathSaveFailure(characterId: string): Promise<HpState> {
  return httpClient.post<HpState>(
    `/characters/${characterId}/death-saves/failure`
  )
}

export function resetDeathSaves(characterId: string): Promise<HpState> {
  return httpClient.post<HpState>(
    `/characters/${characterId}/death-saves/reset`
  )
}
