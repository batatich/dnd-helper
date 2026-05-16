import type { Stats } from '../types/characters'
import { httpClient } from './httpClient'

export type AbilityRollResult = {
  dice: number[]
  dropped: number
  total: number
}

export type RollCharacterStatsResult = {
  stats: CharacterStatsResponse
  rolls: Record<keyof Stats, AbilityRollResult>
}

export type CharacterStatsResponse = Stats & {
  id: string
  characterId: string
}

export function updateCharacterStats(
  characterId: string,
  baseStats: Stats
): Promise<CharacterStatsResponse> {
  return httpClient.patch<CharacterStatsResponse>(
    `/characters/${characterId}/stats`,
    baseStats
  )
}

export function rollCharacterStats(
  characterId: string
): Promise<RollCharacterStatsResult> {
  return httpClient.post<RollCharacterStatsResult>(
    `/characters/${characterId}/stats/roll`
  )
}
