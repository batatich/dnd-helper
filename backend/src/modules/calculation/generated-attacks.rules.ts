import type { AbilityName } from './stats.rules'

import type {
  AbilityModifiers,
  AttackDto,
  CharacterItemDto,
  WeaponConfigDto,
} from '../character-sheet/character-sheet.types'

type CreateGeneratedWeaponAttacksInput = {
  characterId: string
  equippedItems: CharacterItemDto[]
  modifiers: AbilityModifiers
  proficiencyBonus: number
}

export function createGeneratedWeaponAttacks({
  characterId,
  equippedItems,
  modifiers,
  proficiencyBonus,
}: CreateGeneratedWeaponAttacksInput): AttackDto[] {
  return equippedItems
    .filter((item) => item.weaponConfig)
    .map((item) => {
      const weaponConfig = item.weaponConfig!

      const abilityModifier = modifiers[weaponConfig.ability]
      const baseDamageBonus = weaponConfig.damageBonus

      const attackBonus = abilityModifier + proficiencyBonus
      const damageBonusFinal = baseDamageBonus + abilityModifier

      return {
        id: `item-${item.itemId}`,
        characterId,
        name: item.name,
        attackType: weaponConfig.attackType,
        ability: weaponConfig.ability,
        proficient: true,
        damageDice: weaponConfig.damageDice,
        damageBonus: baseDamageBonus,
        attackBonus,
        damageBonusFinal,
        damageType: weaponConfig.damageType,
        notes: weaponConfig.notes,
        source: 'item',
        itemId: item.itemId,
      }
    })
}

export function normalizeWeaponConfig(
  value: unknown,
): WeaponConfigDto | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const rawConfig = value as {
    attackType?: unknown
    ability?: unknown
    damageDice?: unknown
    damageBonus?: unknown
    damageType?: unknown
    notes?: unknown
  }

  const attackType =
    rawConfig.attackType === 'ranged' || rawConfig.attackType === 'melee'
      ? rawConfig.attackType
      : 'melee'

  return {
    attackType,
    ability: normalizeAttackAbility(
      typeof rawConfig.ability === 'string' ? rawConfig.ability : null,
    ),
    damageDice:
      typeof rawConfig.damageDice === 'string' ? rawConfig.damageDice : '',
    damageBonus:
      typeof rawConfig.damageBonus === 'number' ? rawConfig.damageBonus : 0,
    damageType:
      typeof rawConfig.damageType === 'string' ? rawConfig.damageType : '',
    notes: typeof rawConfig.notes === 'string' ? rawConfig.notes : '',
  }
}

function normalizeAttackAbility(
  ability: string | null | undefined,
): AbilityName {
  return normalizeAbilityName(ability) ?? 'strength'
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