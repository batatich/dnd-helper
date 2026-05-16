import { CharacterNotFoundError } from '../characters/errors'
import { calculateHitDice, calculateMaxHp } from '../calculation/hp.rules'

import { getAbilityModifiers } from '../calculation/stats.rules'

import {
  normalizeAbilityName,
  normalizeSpellSlots,
  toAbilityScores,
  toAttackDto,
  toCharacterItemDto,
  toCharacterProfileDto,
  toSpellDto,
} from './character-sheet.mappers'

import {
  calculateCharacterSheetDerived,
  calculateProficiencyBonus,
} from './character-sheet.calculation'

import {
  calculatePassivePerception,
  calculateSkillBonuses,
} from '../calculation/skills.rules'
import { calculateFinalStats } from '../calculation/item-effects.rules'
import { createGeneratedWeaponAttacks } from '../calculation/generated-attacks.rules'

import { calculateSavingThrows } from '../calculation/saving-throws.rules'

import type {
  CharacterAttackRepository,
  CharacterEntity,
  CharacterItemRepository,
  CharacterRepository,
  CharacterStatsEntity,
  CharacterStatsRepository,
  CharacterSpellRepository,
} from './character-sheet.contracts'

import type { CharacterSheetDto } from './character-sheet.types'


// =========================================================
// CharacterSheetService
// =========================================================

export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterStatsRepository: CharacterStatsRepository,
    private readonly attackRepository: CharacterAttackRepository,
    private readonly spellRepository: CharacterSpellRepository,
    private readonly itemRepository: CharacterItemRepository,
  ) {}

  async getCharacterSheet(characterId: string): Promise<CharacterSheetDto> {
    const character = await this.getCharacterForSheet(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const baseStatsEntity = await this.getStats(characterId)

    const [attacks, spells, items] = await Promise.all([
      this.attackRepository.findByCharacterId(characterId),
      this.spellRepository.findByCharacterId(characterId),
      this.itemRepository.findByCharacterId(characterId),
    ])

    const inventoryItems = items.map((item) => toCharacterItemDto(item))
    const equippedItems = inventoryItems.filter((item) => item.isEquipped)

    const baseStats = toAbilityScores(baseStatsEntity)

    const finalStats = calculateFinalStats(baseStats, equippedItems)

    const modifiers = getAbilityModifiers(finalStats)

    const proficiencyBonus = calculateProficiencyBonus(character.level)

    const skills = calculateSkillBonuses({
      modifiers,
      proficiencyBonus,
      skillStates: [],
    })

    const savingThrows = calculateSavingThrows({
      modifiers,
      proficiencyBonus,
      savingThrowStates: [],
    })

    const hpIncreases = character.hpIncreases ?? []

    const characterForHpCalculation = {
      ...character,
      stats: baseStatsEntity,
      hpIncreases,
    }

    const derived = calculateCharacterSheetDerived({
      level: character.level,
      spellcastingAbility: character.spellcastingAbility,
      modifiers,
      maxHp: calculateMaxHp(characterForHpCalculation),
      passivePerception: calculatePassivePerception(skills),
      equippedItems,
    })

    const hitDice = calculateHitDice(characterForHpCalculation)

    const manualAttacks = attacks.map((attack) =>
      toAttackDto(attack, modifiers, proficiencyBonus),
    )

    const generatedWeaponAttacks = createGeneratedWeaponAttacks({
      characterId: character.id,
      equippedItems,
      modifiers,
      proficiencyBonus,
    })
    
    return {
      character: toCharacterProfileDto(character),

      stats: {
        base: baseStats,
        final: finalStats,
        modifiers,
      },

      derived,

      deathSaves: {
        successes: character.deathSaveSuccesses,
        failures: character.deathSaveFailures,
      },

      skills,
      savingThrows,

      attacks: [...manualAttacks, ...generatedWeaponAttacks],

      magic: {
        spells: spells.map((spell) => toSpellDto(spell)),
        spellSlots: normalizeSpellSlots(character.spellSlots),
        spellcastingAbility: normalizeAbilityName(character.spellcastingAbility),
      },

      inventory: {
        items: inventoryItems,
        equippedItems,
      },
      progression: {
        hitDice,
        hpIncreases,
      },
    }
  }

  // =======================================================
  // Character loading
  // =======================================================

  private getCharacterForSheet(
    characterId: string,
  ): Promise<CharacterEntity | null> {
    return this.characterRepository.findByIdForSheet(characterId)
  }

  // =======================================================
  // Stats loading
  // =======================================================

  private async getStats(characterId: string): Promise<CharacterStatsEntity> {
    const stats = await this.characterStatsRepository.findByCharacterId(
      characterId,
    )

    if (!stats) {
      return {
        characterId,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      }
    }

    return stats
  }
}