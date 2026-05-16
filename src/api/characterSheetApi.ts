import { httpClient } from './httpClient'
import type { CharacterSheet } from '../types/characterSheet'

export function getCharacterSheet(
  characterId: string
): Promise<CharacterSheet> {
  return httpClient.get<CharacterSheet>(`/characters/${characterId}/sheet`)
}