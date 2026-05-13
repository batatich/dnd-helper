import type { Stats } from '../types/characters'
import { httpClient } from './httpClient'

export type AbilityRollResult = {
  dice: number[]
  dropped: number
  total: number
}

export type RollCharacterStatsResult = {
  stats: Stats
  rolls: Record<keyof Stats, AbilityRollResult>
}

export function updateCharacterStats(
  characterId: string,
  baseStats: Stats
): Promise<Stats> {
  return httpClient.patch<Stats>(`/characters/${characterId}/stats`, baseStats)
}

export function rollCharacterStats(
  characterId: string
): Promise<RollCharacterStatsResult> {
  return httpClient.post<RollCharacterStatsResult>(
    `/characters/${characterId}/stats/roll`
  )
}