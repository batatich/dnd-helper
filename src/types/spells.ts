import type { Stats } from './characters'

export type SpellSlot = {
  level: number
  total: number
  used: number
}

export type Spell = {
  id: string
  characterId?: string

  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  components: string
  concentration: boolean
  ritual: boolean
  description: string
}

export type NewSpell = Omit<Spell, 'id' | 'characterId'>

export type SpellUpdate = Partial<NewSpell>

export type SpellcastingAbility = keyof Stats