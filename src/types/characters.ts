export type Stats = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type SpellcastingAbility = keyof Stats

export type Character = {
  id: string

  name: string
  race: string
  className: string
  level: number

  description: string | null
  alignment: string | null
  background: string | null
  avatarUrl: string | null

  currentHp: number
  temporaryHp: number
  speed: number
  inspiration: boolean
  spellcastingAbility: SpellcastingAbility | null

  createdAt: string
  updatedAt: string
}