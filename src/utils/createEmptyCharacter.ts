import type { Character } from '../types/characters'
import { standardSkills } from '../types/characters'

export function createEmptyCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    race: '',
    class: '',
    level: 1,
    description: '',
    alignment: '',
    background: '',
    avatarUrl: '',

    skills: standardSkills.map((skill) => ({ ...skill })),
    attacks: [],
    spells: [],
    spellcastingAbility: 'intelligence',

    currentHp: 10,
    temporaryHp: 0,
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    inspiration: false,
    speed: 30,
    hitDice: {
      total: 1,
      used: 0,
      dice: '1d8',
    },

    spellSlots: Array.from({ length: 9 }, (_, i) => ({
      level: i + 1,
      total: 0,
      used: 0,
    })),

    baseStats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },

    derivedStats: {
      maxHp: 10,
      armorClass: 10,
      initiative: 0,
    },

    savingThrowProficiencies: [],

    inventory: [],
    equippedItems: {
      mainHand: null,
      offHand: null,
      head: null,
      body: null,
      ring1: null,
      ring2: null,
      amulet: null,
      boots: null,
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}