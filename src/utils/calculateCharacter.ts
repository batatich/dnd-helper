import type { Character, DerivedStats, Stats } from "../types/characters"
import type { Item } from "../types/items"

export type CalculatedCharacterStats = {
  finalStats: Stats
  finalDerivedStats: DerivedStats
}

export function calculateCharacter(
  character: Character,
  allItems: Item[]
): CalculatedCharacterStats {
  const finalStats: Stats = { ...character.baseStats }
  const finalDerivedStats: DerivedStats = { ...character.derivedStats }

  const equippedItemIds = Object.values(character.equippedItems).filter(
    (itemId): itemId is string => itemId !== null
  )

  const equippedItems = allItems.filter((item) =>
    equippedItemIds.includes(item.id)
  )

  for (const item of equippedItems) {
    for (const effect of item.effects) {
      if (effect.stat && effect.value) {
        finalStats[effect.stat] += effect.value
      }

      if (effect.armorClassBonus) {
        finalDerivedStats.armorClass += effect.armorClassBonus
      }

      if (effect.hpBonus) {
        finalDerivedStats.maxHp += effect.hpBonus
      }

      if (effect.initiativeBonus) {
        finalDerivedStats.initiative += effect.initiativeBonus
      }
    }
  }

  return {
    finalStats,
    finalDerivedStats,
  }
}