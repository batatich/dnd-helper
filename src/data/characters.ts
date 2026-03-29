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

    inventory: ["sword-1",
  "sword-2",
  "dagger-1",
  "ring-1",
  "ring-2",
  "ring-3",
  "helmet-1",
  "helmet-2",
  "armor-1",
  "armor-2",
  "amulet-1",
  "amulet-2",
  "boots-1",
  "boots-2",],

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