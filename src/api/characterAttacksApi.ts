import type { NewAttack } from '../types/attacks'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

export type CharacterAttackResponse = {
  id: string
  characterId: string
  name: string
  attackType: 'melee' | 'ranged' | 'spell' | null
  ability:
    | 'strength'
    | 'dexterity'
    | 'constitution'
    | 'intelligence'
    | 'wisdom'
    | 'charisma'
    | null
  proficient: boolean
  damageDice: string | null
  damageBonus: number | null
  damageType: string | null
  notes: string | null
  source: 'manual' | 'item' | null
  itemId: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Backend attack schemas strict и не должны принимать calculated/item поля
 * с frontend.
 */
function mapAttackPayloadToBackend(data: Partial<NewAttack>) {
  const {
    id: _id,
    source: _source,
    itemId: _itemId,
    attackBonus: _attackBonus,
    damageBonusFinal: _damageBonusFinal,
    ...payload
  } = data as Partial<NewAttack> & {
    id?: string
    source?: 'manual' | 'item'
    itemId?: string | null
    attackBonus?: number
    damageBonusFinal?: number
  }

  return removeUndefinedValues(payload)
}

export async function addAttack(
  characterId: string,
  data: NewAttack
): Promise<CharacterAttackResponse> {
  return httpClient.post<CharacterAttackResponse>(
    `/characters/${characterId}/attacks`,
    mapAttackPayloadToBackend(data)
  )
}

export async function updateAttack(
  characterId: string,
  attackId: string,
  data: Partial<NewAttack>
): Promise<CharacterAttackResponse> {
  return httpClient.patch<CharacterAttackResponse>(
    `/characters/${characterId}/attacks/${attackId}`,
    mapAttackPayloadToBackend(data)
  )
}

export async function deleteAttack(
  characterId: string,
  attackId: string
): Promise<void> {
  await httpClient.delete(`/characters/${characterId}/attacks/${attackId}`)
}
