import type { Character, Stats } from '../types/characters'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

export type CreateCharacterInput = {
  name: string
  race: string
  className: string
  level?: number
  baseStats?: Stats
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

function mapCreateCharacterPayloadToBackend(data: CreateCharacterInput) {
  return removeUndefinedValues({
    name: data.name,
    race: data.race,
    className: data.className,
    level: data.level,
    baseStats: data.baseStats,
    description: data.description,
    alignment: data.alignment,
    background: data.background,
    avatarUrl: data.avatarUrl,
    speed: data.speed,
    spellcastingAbility: data.spellcastingAbility,
  })
}

function mapUpdateCharacterPayloadToBackend(data: UpdateCharacterInput) {
  return removeUndefinedValues({
    name: data.name,
    race: data.race,
    className: data.className,
    description: data.description,
    alignment: data.alignment,
    background: data.background,
    avatarUrl: data.avatarUrl,
    speed: data.speed,
    spellcastingAbility: data.spellcastingAbility,
  })
}

export function getCharacters(): Promise<Character[]> {
  return httpClient.get<Character[]>('/characters')
}

export function getCharacterById(id: string): Promise<Character> {
  return httpClient.get<Character>(`/characters/${id}`)
}

export function createCharacter(
  data: CreateCharacterInput
): Promise<Character> {
  return httpClient.post<Character>(
    '/characters',
    mapCreateCharacterPayloadToBackend(data)
  )
}

export function updateCharacter(
  id: string,
  data: UpdateCharacterInput
): Promise<Character> {
  return httpClient.patch<Character>(
    `/characters/${id}`,
    mapUpdateCharacterPayloadToBackend(data)
  )
}

export function deleteCharacter(id: string): Promise<void> {
  return httpClient.delete<void>(`/characters/${id}`)
}

export async function updateSpellcastingAbility(
  characterId: string,
  ability: keyof Stats | null
): Promise<Character> {
  return updateCharacter(characterId, {
    spellcastingAbility: ability,
  })
}
