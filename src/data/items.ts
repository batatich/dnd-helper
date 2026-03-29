import type { Item } from "../types/items"

export const items: Item[] = [
  {
    id: "sword-1",
    name: "Iron Sword",
    type: "weapon",
    allowedSlots: ["mainHand"],
    effects: [
      {
        stat: "strength",
        value: 2,
      },
    ],
  },
  {
    id: "sword-2",
    name: "Steel Sword",
    type: "weapon",
    allowedSlots: ["mainHand"],
    effects: [
      {
        stat: "strength",
        value: 1,
      },
      {
        initiativeBonus: 1,
      },
    ],
  },
  {
    id: "dagger-1",
    name: "Magic Dagger",
    type: "weapon",
    allowedSlots: ["mainHand", "offHand"],
    effects: [
      {
        stat: "dexterity",
        value: 2,
      },
    ],
  },
  {
    id: "ring-1",
    name: "Ring of Health",
    type: "ring",
    allowedSlots: ["ring1", "ring2"],
    effects: [
      {
        hpBonus: 10,
      },
    ],
  },
  {
    id: "ring-2",
    name: "Ring of Power",
    type: "ring",
    allowedSlots: ["ring1", "ring2"],
    effects: [
      {
        stat: "strength",
        value: 1,
      },
    ],
  },
  {
    id: "ring-3",
    name: "Ring of Speed",
    type: "ring",
    allowedSlots: ["ring1", "ring2"],
    effects: [
      {
        initiativeBonus: 2,
      },
    ],
  },
  {
    id: "helmet-1",
    name: "Leather Hood",
    type: "helmet",
    allowedSlots: ["head"],
    effects: [
      {
        armorClassBonus: 1,
      },
    ],
  },
  {
    id: "helmet-2",
    name: "Iron Helmet",
    type: "helmet",
    allowedSlots: ["head"],
    effects: [
      {
        armorClassBonus: 2,
      },
    ],
  },
  {
    id: "armor-1",
    name: "Leather Armor",
    type: "armor",
    allowedSlots: ["body"],
    effects: [
      {
        armorClassBonus: 2,
      },
    ],
  },
  {
    id: "armor-2",
    name: "Chain Armor",
    type: "armor",
    allowedSlots: ["body"],
    effects: [
      {
        armorClassBonus: 4,
      },
    ],
  },
  {
    id: "amulet-1",
    name: "Amulet of Wisdom",
    type: "amulet",
    allowedSlots: ["amulet"],
    effects: [
      {
        stat: "wisdom",
        value: 2,
      },
    ],
  },
  {
    id: "amulet-2",
    name: "Amulet of Charisma",
    type: "amulet",
    allowedSlots: ["amulet"],
    effects: [
      {
        stat: "charisma",
        value: 2,
      },
    ],
  },
  {
    id: "boots-1",
    name: "Boots of Agility",
    type: "boots",
    allowedSlots: ["boots"],
    effects: [
      {
        stat: "dexterity",
        value: 2,
      },
    ],
  },
  {
    id: "boots-2",
    name: "Heavy Boots",
    type: "boots",
    allowedSlots: ["boots"],
    effects: [
      {
        stat: "constitution",
        value: 1,
      },
    ],
  },
]