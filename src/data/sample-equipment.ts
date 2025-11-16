import type { Equipment } from '../types/characters';

export const sampleEquipment: Equipment[] = [
  {
    id: "1",
    name: "🔥 Пламенный меч",
    type: "weapon",
    equipped: true,
    modifiers: [
      { attribute: "strength", value: 2 },
      { attribute: "dexterity", value: -1 }
    ]
  },
  {
    id: "2", 
    name: "💍 Кольцо защиты",
    type: "ring",
    equipped: true,
    modifiers: [
      { attribute: "constitution", value: 1 }
    ]
  },
  {
    id: "3",
    name: "🛡️ Доспех новичка",
    type: "armor", 
    equipped: false,
    modifiers: [
      { attribute: "constitution", value: 1 }
    ]
  },
  {
    id: "4",
    name: "🧙‍♂️ Посох мага",
    type: "weapon",
    equipped: false,
    modifiers: [
      { attribute: "intelligence", value: 2 }
    ]
  },
  {
    id: "5",
    name: "🍃 Сапоги легкости", 
    type: "other",
    equipped: true,
    modifiers: [
      { attribute: "dexterity", value: 1 }
    ]
  }
];