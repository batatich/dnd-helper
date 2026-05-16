import type { Stats } from './characters'

export type Attack = {
  id: string
  characterId?: string
  name: string
  attackType: 'melee' | 'ranged' | 'spell'
  ability: keyof Stats
  proficient: boolean
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string

  source: 'manual' | 'item'
  itemId?: string | null

  attackBonus: number
  damageBonusFinal: number
}

export type NewAttack = Omit<
  Attack,
  | 'id'
  | 'characterId'
  | 'attackBonus'
  | 'damageBonusFinal'
>

export type AttackUpdate = Partial<NewAttack>
