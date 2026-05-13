import { calculateItemDerivedBonuses } from '../calculation/item-effects.rules'

import {
  normalizeAbilityName,
  type AbilityName,
} from '../calculation/stats.rules'

import type {
  AbilityModifiers,
  CharacterDerivedDto,
  CharacterItemDto,
} from './character-sheet.types'

type CalculateCharacterDerivedInput = {
  level: number
  spellcastingAbility?: AbilityName | string | null
  modifiers: AbilityModifiers
  maxHp: number
  passivePerception: number
  equippedItems: CharacterItemDto[]
}

export function calculateCharacterSheetDerived({
  level,
  spellcastingAbility,
  modifiers,
  maxHp,
  passivePerception,
  equippedItems,
}: CalculateCharacterDerivedInput): CharacterDerivedDto {
  const proficiencyBonus = calculateProficiencyBonus(level)

  const normalizedSpellcastingAbility =
    normalizeAbilityName(spellcastingAbility)

  const spellcastingModifier = normalizedSpellcastingAbility
    ? modifiers[normalizedSpellcastingAbility]
    : null

  const itemDerivedBonuses = calculateItemDerivedBonuses(equippedItems)

  const finalMaxHp = maxHp + itemDerivedBonuses.hpBonus

  const finalArmorClass =
    10 + modifiers.dexterity + itemDerivedBonuses.armorClassBonus

  const finalInitiative =
    modifiers.dexterity + itemDerivedBonuses.initiativeBonus

  return {
    maxHp: finalMaxHp,
    armorClass: finalArmorClass,
    initiative: finalInitiative,
    passivePerception,
    proficiencyBonus,

    spellAttackBonus:
      spellcastingModifier === null
        ? null
        : spellcastingModifier + proficiencyBonus,

    spellSaveDc:
      spellcastingModifier === null
        ? null
        : 8 + spellcastingModifier + proficiencyBonus,
  }
}

export function calculateProficiencyBonus(level: number): number {
  const safeLevel = Math.min(Math.max(level, 1), 20)

  return Math.ceil(safeLevel / 4) + 1
}