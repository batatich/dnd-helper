import type { Prisma } from '@prisma/client'

export type CharacterProfileEntity = Prisma.CharacterGetPayload<{
  select: {
    id: true

    name: true
    race: true
    className: true
    level: true

    description: true
    alignment: true
    background: true
    avatarUrl: true

    currentHp: true
    temporaryHp: true
    speed: true
    inspiration: true
    spellcastingAbility: true

    createdAt: true
    updatedAt: true
  }
}>

export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'

export type CharacterProfileDto = {
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
  spellcastingAbility: AbilityName | null

  createdAt: Date
  updatedAt: Date
}

export function toCharacterProfileDto(
  character: CharacterProfileEntity,
): CharacterProfileDto {
  return {
    id: character.id,

    name: character.name,
    race: character.race,
    className: character.className,
    level: character.level,

    description: character.description ?? null,
    alignment: character.alignment ?? null,
    background: character.background ?? null,
    avatarUrl: character.avatarUrl ?? null,

    currentHp: character.currentHp,
    temporaryHp: character.temporaryHp,
    speed: character.speed,
    inspiration: character.inspiration,

    spellcastingAbility: character.spellcastingAbility as AbilityName | null,

    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}