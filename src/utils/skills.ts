import type { Skill, Stats } from '../types/characters'
import { getModifier } from './stats'

export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6
  if (level >= 13) return 5
  if (level >= 9) return 4
  if (level >= 5) return 3
  return 2
}

export function calculateSkillBonus(
  skill: Skill,
  stats: Stats,
  level: number
): number {
  const statModifier = getModifier(stats[skill.attribute])
  const proficiencyBonus = skill.proficient ? getProficiencyBonus(level) : 0

  return statModifier + proficiencyBonus
}