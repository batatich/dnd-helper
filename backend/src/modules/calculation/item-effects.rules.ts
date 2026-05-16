import type { AbilityName, AbilityScores } from './stats.rules'

export type ItemEffectDto = {
  stat?: AbilityName
  value?: number
  armorClassBonus?: number
  hpBonus?: number
  initiativeBonus?: number
}

type ItemWithEffects = {
  effects: ItemEffectDto[]
}

export function normalizeItemEffects(value: unknown): ItemEffectDto[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((effect) => normalizeItemEffect(effect))
    .filter((effect): effect is ItemEffectDto => effect !== null)
}

export function normalizeItemEffect(effect: unknown): ItemEffectDto | null {
  if (!effect || typeof effect !== 'object') {
    return null
  }

  const rawEffect = effect as {
    stat?: unknown
    value?: unknown
    armorClassBonus?: unknown
    hpBonus?: unknown
    initiativeBonus?: unknown
  }

  const normalized: ItemEffectDto = {}

  const stat =
    typeof rawEffect.stat === 'string'
      ? normalizeAbilityName(rawEffect.stat)
      : null

  if (stat) {
    normalized.stat = stat
  }

  if (typeof rawEffect.value === 'number') {
    normalized.value = rawEffect.value
  }

  if (typeof rawEffect.armorClassBonus === 'number') {
    normalized.armorClassBonus = rawEffect.armorClassBonus
  }

  if (typeof rawEffect.hpBonus === 'number') {
    normalized.hpBonus = rawEffect.hpBonus
  }

  if (typeof rawEffect.initiativeBonus === 'number') {
    normalized.initiativeBonus = rawEffect.initiativeBonus
  }

  return Object.keys(normalized).length > 0 ? normalized : null
}

export function calculateFinalStats(
  baseStats: AbilityScores,
  equippedItems: ItemWithEffects[],
): AbilityScores {
  const finalStats: AbilityScores = {
    ...baseStats,
  }

  for (const item of equippedItems) {
    for (const effect of item.effects) {
      if (!effect.stat || typeof effect.value !== 'number') {
        continue
      }

      finalStats[effect.stat] += effect.value
    }
  }

  return finalStats
}

export function calculateItemDerivedBonuses(equippedItems: ItemWithEffects[]): {
  armorClassBonus: number
  hpBonus: number
  initiativeBonus: number
} {
  const bonuses = {
    armorClassBonus: 0,
    hpBonus: 0,
    initiativeBonus: 0,
  }

  for (const item of equippedItems) {
    for (const effect of item.effects) {
      if (typeof effect.armorClassBonus === 'number') {
        bonuses.armorClassBonus += effect.armorClassBonus
      }

      if (typeof effect.hpBonus === 'number') {
        bonuses.hpBonus += effect.hpBonus
      }

      if (typeof effect.initiativeBonus === 'number') {
        bonuses.initiativeBonus += effect.initiativeBonus
      }
    }
  }

  return bonuses
}

function normalizeAbilityName(
  ability: AbilityName | string | null | undefined,
): AbilityName | null {
  if (
    ability === 'strength' ||
    ability === 'dexterity' ||
    ability === 'constitution' ||
    ability === 'intelligence' ||
    ability === 'wisdom' ||
    ability === 'charisma'
  ) {
    return ability
  }

  return null
}

export function calculateEffectiveMaxHp(
  baseMaxHp: number,
  equippedItems: ItemWithEffects[],
): number {
  const itemBonuses = calculateItemDerivedBonuses(equippedItems)

  return baseMaxHp + itemBonuses.hpBonus
}