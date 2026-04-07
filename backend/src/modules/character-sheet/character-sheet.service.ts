import { CharacterNotFoundError } from '../characters/errors'

type CharacterEntity = {
  id: string
  name: string
  race: string
  className: string
  level: number
  description: string | null
  alignment: string | null
  background: string | null
  avatarUrl: string | null
  currentHp: number
  temporaryHp: number
  speed: number
  inspiration: boolean
  createdAt: Date
  updatedAt: Date
}

type CharacterStatsEntity = {
  characterId: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

type CharacterAttackEntity = {
  id: string
  characterId: string
  name: string
  attackType: string
  ability: string
  proficient: boolean
  damageDice: string | null
  damageBonus: number | null
  damageType: string | null
  notes: string | null
}

type CharacterSpellEntity = {
  id: string
  characterId: string
  name: string
  level: number
  school: string | null
  castingTime: string | null
  range: string | null
  components: string | null
  duration: string | null
  description: string | null
}

type CharacterItemEntity = {
  id: string
  characterId: string
  name: string
  isEquipped: boolean
}

type CharacterRepository = {
  findById: (id: string) => Promise<CharacterEntity | null>
}

type CharacterStatsRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterStatsEntity | null>
}

type CharacterAttackRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterAttackEntity[]>
}

type CharacterSpellRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterSpellEntity[]>
}

type CharacterItemRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterItemEntity[]>
}

type AbilityModifiers = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

type DerivedStats = {
  modifiers: AbilityModifiers
  initiative: number
  passivePerception: number
  maxHp: number
}

export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterStatsRepository: CharacterStatsRepository,
    private readonly attackRepository: CharacterAttackRepository,
    private readonly spellRepository: CharacterSpellRepository,
    private readonly itemRepository: CharacterItemRepository,
  ) {}

  async getCharacterSheet(characterId: string) {
    const character = await this.characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const stats = await this.getStats(characterId)
    const attacks = await this.attackRepository.findByCharacterId(characterId)
    const spells = await this.spellRepository.findByCharacterId(characterId)
    const items = await this.itemRepository.findByCharacterId(characterId)

    const equippedItems = items.filter((item: CharacterItemEntity) => item.isEquipped)

    const derived = this.calculateDerived(stats)

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
      stats,
      attacks,
      spells,
      items,
      equippedItems,
      derived,
    }
  }

  private async getStats(characterId: string): Promise<CharacterStatsEntity> {
    const stats = await this.characterStatsRepository.findByCharacterId(characterId)

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

  private calculateDerived(stats: CharacterStatsEntity): DerivedStats {
    const modifiers: AbilityModifiers = {
      strength: this.getModifier(stats.strength),
      dexterity: this.getModifier(stats.dexterity),
      constitution: this.getModifier(stats.constitution),
      intelligence: this.getModifier(stats.intelligence),
      wisdom: this.getModifier(stats.wisdom),
      charisma: this.getModifier(stats.charisma),
    }

    return {
      modifiers,
      initiative: modifiers.dexterity,
      passivePerception: 10 + modifiers.wisdom,
      maxHp: Math.max(1, modifiers.constitution),
    }
  }

  private getModifier(stat: number): number {
    return Math.floor((stat - 10) / 2)
  }
}