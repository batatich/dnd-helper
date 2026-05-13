import type { NewAttack } from '../types/attacks'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

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
): Promise<void> {
  await httpClient.post(
    `/characters/${characterId}/attacks`,
    mapAttackPayloadToBackend(data)
  )
}

export async function updateAttack(
  characterId: string,
  attackId: string,
  data: Partial<NewAttack>
): Promise<void> {
  await httpClient.patch(
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