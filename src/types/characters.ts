export type Stats = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type DerivedStats = {
  maxHp: number
  armorClass: number
  initiative: number
}

export type Character = {
  id: string
  name: string
  race: string
  class: string
  level: number

  baseStats: Stats
  derivedStats: DerivedStats

  inventory: string[] // список ID предметов
  equippedItems: Record<string, string | null> // слот -> предмет

  createdAt: string
  updatedAt: string
}
export function getModifier(stat: number): number {
  return Math.floor((stat - 10) / 2)
}