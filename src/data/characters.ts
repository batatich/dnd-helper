import type { Character } from "../types/characters"

export const initialCharacters: Character[] = [
  {
    id: "character-1",
    name: "Arthas",
    race: "Human",
    class: "Fighter",
    level: 1,

    baseStats: {
      strength: 12,
      dexterity: 14,
      constitution: 13,
      intelligence: 10,
      wisdom: 11,
      charisma: 8,
    },

    derivedStats: {
      maxHp: 12,
      armorClass: 10,
      initiative: 2,
    },

    inventory: ["sword-1", "ring-1", "helmet-1"],

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
  },
]