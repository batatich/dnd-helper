import { httpClient } from './httpClient'

export type HpState = {
  id: string
  currentHp: number
  temporaryHp: number
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