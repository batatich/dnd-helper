import type { Stats } from '../types/characters'
import { getModifier } from './stats'
import { getProficiencyBonus } from './skills'

export function calculateSavingThrowBonus(
  stat: keyof Stats,
  stats: Stats,
  level: number,
  savingThrowProficiencies: (keyof Stats)[]
): number {
  const statModifier = getModifier(stats[stat])
  const proficiencyBonus = savingThrowProficiencies.includes(stat)
    ? getProficiencyBonus(level)
    : 0

  return statModifier + proficiencyBonus
}