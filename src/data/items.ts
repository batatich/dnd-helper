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
]