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
  description: string
  alignment: string
  background: string
  avatarUrl: string
  skills: Skill[]

  baseStats: Stats
  derivedStats: DerivedStats

  savingThrowProficiencies: (keyof Stats)[]

  inventory: string[] // список ID предметов
  equippedItems: Record<string, string | null> // слот -> предмет

  createdAt: string
  updatedAt: string
}

export const standardSkills: Skill[] = [
  // Сила
  { name: 'Атлетика', attribute: 'strength', proficient: false },
  // Ловкость
  { name: 'Акробатика', attribute: 'dexterity', proficient: false },
  { name: 'Ловкость рук', attribute: 'dexterity', proficient: false },
  { name: 'Скрытность', attribute: 'dexterity', proficient: false },
  // Интеллект
  { name: 'Магия', attribute: 'intelligence', proficient: false },
  { name: 'История', attribute: 'intelligence', proficient: false },
  { name: 'Расследование', attribute: 'intelligence', proficient: false },
  { name: 'Природа', attribute: 'intelligence', proficient: false },
  { name: 'Религия', attribute: 'intelligence', proficient: false },
  // Мудрость
  { name: 'Уход за животными', attribute: 'wisdom', proficient: false },
  { name: 'Проницательность', attribute: 'wisdom', proficient: false },
  { name: 'Медицина', attribute: 'wisdom', proficient: false },
  { name: 'Восприятие', attribute: 'wisdom', proficient: false },
  { name: 'Выживание', attribute: 'wisdom', proficient: false },
  // Харизма
  { name: 'Обман', attribute: 'charisma', proficient: false },
  { name: 'Запугивание', attribute: 'charisma', proficient: false },
  { name: 'Выступление', attribute: 'charisma', proficient: false },
  { name: 'Убеждение', attribute: 'charisma', proficient: false }
];
export type Skill = {
  name: string
  attribute: keyof Stats
  proficient: boolean
}
