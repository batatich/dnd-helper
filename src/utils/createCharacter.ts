import type { DerivedStats, Stats } from '../types/characters'
import { getModifier } from './stats'

export function calculateStartingDerivedStats(baseStats: Stats): DerivedStats {
  return {
    maxHp: 10 + getModifier(baseStats.constitution),
    armorClass: 10 + getModifier(baseStats.dexterity),
    initiative: getModifier(baseStats.dexterity),
  }
}