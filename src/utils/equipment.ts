import type { Character } from "../types/characters"
import type { EquipmentSlot, Item } from "../types/items"

export function equipItem(
  character: Character,
  item: Item,
  slot: EquipmentSlot
): Character {
  if (!item.allowedSlots.includes(slot)) {
    throw new Error("This item cannot be equipped in this slot")
  }

  return {
    ...character,
    equippedItems: {
      ...character.equippedItems,
      [slot]: item.id,
    },
    updatedAt: new Date().toISOString(),
  }
}

export function unequipItem(
  character: Character,
  slot: EquipmentSlot
): Character {
  return {
    ...character,
    equippedItems: {
      ...character.equippedItems,
      [slot]: null,
    },
    updatedAt: new Date().toISOString(),
  }
}