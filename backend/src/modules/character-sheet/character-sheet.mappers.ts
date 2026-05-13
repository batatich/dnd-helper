import type { AbilityName, AbilityScores } from '../calculation/stats.rules'
import { normalizeItemEffects } from '../calculation/item-effects.rules'
import { normalizeWeaponConfig } from '../calculation/generated-attacks.rules'

import type {
  AbilityModifiers,
  AttackDto,
  AttackSource,
  AttackType,
  CharacterItemDto,
  CharacterProfileDto,
  EquipmentSlot,
  SpellDto,
  SpellSlotDto,
} from './character-sheet.types'
import type {
  CharacterAttackEntity,
  CharacterEntity,
  CharacterItemEntity,
  CharacterSpellEntity,
  CharacterStatsEntity,
} from './character-sheet.contracts'

// =========================================================
// Public mappers
// =========================================================

export function toCharacterProfileDto(
  character: CharacterEntity,
): CharacterProfileDto {
  return {
    id: character.id,
    name: character.name,
    race: character.race,
    className: character.className,
    level: character.level,

    description: character.description,
    alignment: character.alignment,
    background: character.background,
    avatarUrl: character.avatarUrl,

    currentHp: character.currentHp,
    temporaryHp: character.temporaryHp,
    speed: character.speed,
    inspiration: character.inspiration,

    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}

export function toAttackDto(
  attack: CharacterAttackEntity,
  modifiers: AbilityModifiers,
  proficiencyBonus: number,
): AttackDto {
  const ability = normalizeAttackAbility(attack.ability)
  const abilityModifier = modifiers[ability]

  const baseDamageBonus = attack.damageBonus ?? 0

  const attackBonus =
    abilityModifier + (attack.proficient ? proficiencyBonus : 0)

  const damageBonusFinal = baseDamageBonus + abilityModifier

  return {
    id: attack.id,
    characterId: attack.characterId,
    name: attack.name,
    attackType: normalizeAttackType(attack.attackType),
    ability,
    proficient: attack.proficient,
    damageDice: attack.damageDice ?? '',
    damageBonus: baseDamageBonus,
    attackBonus,
    damageBonusFinal,
    damageType: attack.damageType ?? '',
    notes: attack.notes ?? '',
    source: normalizeAttackSource(attack.source),
    itemId: attack.itemId ?? null,
  }
}

export function toSpellDto(spell: CharacterSpellEntity): SpellDto {
  return {
    id: spell.id,
    characterId: spell.characterId,
    name: spell.name,
    level: spell.level,
    school: spell.school ?? '',
    castingTime: spell.castingTime ?? '',
    range: spell.range ?? '',
    components: spell.components ?? '',
    duration: spell.duration ?? '',
    concentration: spell.concentration ?? false,
    ritual: spell.ritual ?? false,
    description: spell.description ?? '',
  }
}

export function toCharacterItemDto(
  item: CharacterItemEntity,
): CharacterItemDto {
  const template = item.itemTemplate ?? null

  const hasItemType = item.type !== null && item.type !== undefined
  const hasItemEffects = item.effects !== null && item.effects !== undefined
  const hasItemAllowedSlots =
    item.allowedSlots !== null && item.allowedSlots !== undefined
  const hasTemplateAllowedSlots =
    template?.allowedSlots !== null && template?.allowedSlots !== undefined
  const hasItemWeaponConfig =
    item.weaponConfig !== null && item.weaponConfig !== undefined

  const type = hasItemType ? item.type : template?.type ?? 'misc'

  const itemEffects = normalizeItemEffects(item.effects)
  const templateEffects = normalizeItemEffects(template?.effects)

  const itemAllowedSlots = normalizeAllowedSlots(item.allowedSlots)
  const templateAllowedSlots = normalizeAllowedSlots(template?.allowedSlots)
  const templateSlot = normalizeAllowedSlots(template?.slot)

  const itemWeaponConfig = normalizeWeaponConfig(item.weaponConfig)
  const templateWeaponConfig = normalizeWeaponConfig(template?.weaponConfig)

  return {
    id: item.id,
    itemId: item.id,
    name: item.nameSnapshot || template?.name || 'Предмет',
    type,
    effects: hasItemEffects ? itemEffects : templateEffects,
    allowedSlots: hasItemAllowedSlots
      ? itemAllowedSlots
      : hasTemplateAllowedSlots
        ? templateAllowedSlots
        : templateSlot,
    isEquipped: item.isEquipped,
    equippedSlot: normalizeEquipmentSlot(item.equippedSlot),
    quantity: item.quantity,
    notes: item.notes,
    weaponConfig: hasItemWeaponConfig
      ? itemWeaponConfig ?? undefined
      : templateWeaponConfig ?? undefined,
  }
}

export function toAbilityScores(
  stats: CharacterStatsEntity,
): AbilityScores {
  return {
    strength: stats.strength,
    dexterity: stats.dexterity,
    constitution: stats.constitution,
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
    charisma: stats.charisma,
  }
}

export function normalizeAbilityName(
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

export function normalizeSpellSlots(spellSlots: unknown): SpellSlotDto[] {
  if (!Array.isArray(spellSlots)) {
    return []
  }

  return spellSlots
    .map((slot): SpellSlotDto | null => {
      if (!slot || typeof slot !== 'object') {
        return null
      }

      const rawSlot = slot as Record<string, unknown>

      const level = rawSlot.level
      const total = rawSlot.total
      const used = rawSlot.used

      if (
        typeof level !== 'number' ||
        typeof total !== 'number' ||
        typeof used !== 'number'
      ) {
        return null
      }

      return {
        level,
        total,
        used,
      }
    })
    .filter((slot): slot is SpellSlotDto => slot !== null)
}

// =========================================================
// Internal item helpers
// =========================================================

function normalizeEquipmentSlot(slot: unknown): EquipmentSlot | null {
  if (
    slot === 'mainHand' ||
    slot === 'offHand' ||
    slot === 'head' ||
    slot === 'body' ||
    slot === 'ring1' ||
    slot === 'ring2' ||
    slot === 'amulet' ||
    slot === 'boots'
  ) {
    return slot
  }

  return null
}

function normalizeAllowedSlots(value: unknown): EquipmentSlot[] {
  if (!value) {
    return []
  }

  if (typeof value === 'string') {
    const slot = normalizeEquipmentSlot(value)
    return slot ? [slot] : []
  }

  if (Array.isArray(value)) {
    return value
      .map((slot) => normalizeEquipmentSlot(slot))
      .filter((slot): slot is EquipmentSlot => slot !== null)
  }

  return []
}

// =========================================================
// Internal attack helpers
// =========================================================

function normalizeAttackType(attackType: string | null): AttackType {
  if (
    attackType === 'melee' ||
    attackType === 'ranged' ||
    attackType === 'spell'
  ) {
    return attackType
  }

  return 'melee'
}

function normalizeAttackSource(source: string | null | undefined): AttackSource {
  if (source === 'item') {
    return 'item'
  }

  return 'manual'
}

function normalizeAttackAbility(
  ability: string | null | undefined,
): AbilityName {
  return normalizeAbilityName(ability) ?? 'strength'
}