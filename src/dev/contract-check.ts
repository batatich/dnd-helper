import type { CharacterSheet } from '../types/characterSheet'
import type { Character } from '../types/characters'
import type { ItemTemplate } from '../types/items'
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from '../api/characterProfileApi'

import type {
  HpState,
} from '../api/characterHpApi'

import type {
  CreateItemInput,
  UpdateItemInput,
} from '../api/characterInventoryApi'

// =========================================================
// 1. GET /characters/:id/sheet
// =========================================================

const characterSheetResponse = {
    "character": {
        "id": "2005a647-e82b-4e13-a9d8-e393ced10677",
        "name": "Contract Test Hero",
        "race": "Human",
        "className": "Fighter",
        "level": 1,
        "description": null,
        "alignment": null,
        "background": null,
        "avatarUrl": null,
        "currentHp": 5,
        "temporaryHp": 0,
        "speed": 30,
        "inspiration": false,
        "createdAt": "2026-05-12T18:41:42.881Z",
        "updatedAt": "2026-05-12T18:50:19.666Z"
    },
    "stats": {
        "base": {
            "strength": 16,
            "dexterity": 14,
            "constitution": 14,
            "intelligence": 10,
            "wisdom": 12,
            "charisma": 8
        },
        "final": {
            "strength": 16,
            "dexterity": 14,
            "constitution": 14,
            "intelligence": 10,
            "wisdom": 12,
            "charisma": 8
        },
        "modifiers": {
            "strength": 3,
            "dexterity": 2,
            "constitution": 2,
            "intelligence": 0,
            "wisdom": 1,
            "charisma": -1
        }
    },
    "derived": {
        "maxHp": 10,
        "armorClass": 12,
        "initiative": 2,
        "passivePerception": 11,
        "proficiencyBonus": 2,
        "spellAttackBonus": null,
        "spellSaveDc": null
    },
    "deathSaves": {
        "successes": 0,
        "failures": 0
    },
    "skills": [
        {
            "name": "Акробатика",
            "ability": "dexterity",
            "proficient": false,
            "expertise": false,
            "bonus": 2
        },
        {
            "name": "Анализ",
            "ability": "intelligence",
            "proficient": false,
            "expertise": false,
            "bonus": 0
        },
        {
            "name": "Атлетика",
            "ability": "strength",
            "proficient": false,
            "expertise": false,
            "bonus": 3
        },
        {
            "name": "Внимательность",
            "ability": "wisdom",
            "proficient": false,
            "expertise": false,
            "bonus": 1
        },
        {
            "name": "Выживание",
            "ability": "wisdom",
            "proficient": false,
            "expertise": false,
            "bonus": 1
        },
        {
            "name": "Выступление",
            "ability": "charisma",
            "proficient": false,
            "expertise": false,
            "bonus": -1
        },
        {
            "name": "Запугивание",
            "ability": "charisma",
            "proficient": false,
            "expertise": false,
            "bonus": -1
        },
        {
            "name": "История",
            "ability": "intelligence",
            "proficient": false,
            "expertise": false,
            "bonus": 0
        },
        {
            "name": "Ловкость рук",
            "ability": "dexterity",
            "proficient": false,
            "expertise": false,
            "bonus": 2
        },
        {
            "name": "Магия",
            "ability": "intelligence",
            "proficient": false,
            "expertise": false,
            "bonus": 0
        },
        {
            "name": "Медицина",
            "ability": "wisdom",
            "proficient": false,
            "expertise": false,
            "bonus": 1
        },
        {
            "name": "Обман",
            "ability": "charisma",
            "proficient": false,
            "expertise": false,
            "bonus": -1
        },
        {
            "name": "Природа",
            "ability": "intelligence",
            "proficient": false,
            "expertise": false,
            "bonus": 0
        },
        {
            "name": "Проницательность",
            "ability": "wisdom",
            "proficient": false,
            "expertise": false,
            "bonus": 1
        },
        {
            "name": "Религия",
            "ability": "intelligence",
            "proficient": false,
            "expertise": false,
            "bonus": 0
        },
        {
            "name": "Скрытность",
            "ability": "dexterity",
            "proficient": false,
            "expertise": false,
            "bonus": 2
        },
        {
            "name": "Убеждение",
            "ability": "charisma",
            "proficient": false,
            "expertise": false,
            "bonus": -1
        },
        {
            "name": "Уход за животными",
            "ability": "wisdom",
            "proficient": false,
            "expertise": false,
            "bonus": 1
        }
    ],
    "savingThrows": [
        {
            "ability": "strength",
            "label": "Сила",
            "proficient": false,
            "bonus": 3
        },
        {
            "ability": "dexterity",
            "label": "Ловкость",
            "proficient": false,
            "bonus": 2
        },
        {
            "ability": "constitution",
            "label": "Телосложение",
            "proficient": false,
            "bonus": 2
        },
        {
            "ability": "intelligence",
            "label": "Интеллект",
            "proficient": false,
            "bonus": 0
        },
        {
            "ability": "wisdom",
            "label": "Мудрость",
            "proficient": false,
            "bonus": 1
        },
        {
            "ability": "charisma",
            "label": "Харизма",
            "proficient": false,
            "bonus": -1
        }
    ],
    "attacks": [
        {
            "id": "9021e15f-ad84-446d-9e19-4b03a0d8a87b",
            "characterId": "2005a647-e82b-4e13-a9d8-e393ced10677",
            "name": "Contract Longsword",
            "attackType": "melee",
            "ability": "strength",
            "proficient": true,
            "damageDice": "1d8",
            "damageBonus": 0,
            "attackBonus": 5,
            "damageBonusFinal": 3,
            "damageType": "slashing",
            "notes": "Manual contract attack",
            "source": "manual",
            "itemId": null
        },
        {
            "id": "item-6f775d41-d587-4f18-b796-23b7df8f4daf",
            "characterId": "2005a647-e82b-4e13-a9d8-e393ced10677",
            "name": "Contract Custom Sword",
            "attackType": "melee",
            "ability": "strength",
            "proficient": true,
            "damageDice": "1d8",
            "damageBonus": 0,
            "attackBonus": 5,
            "damageBonusFinal": 3,
            "damageType": "slashing",
            "notes": "",
            "source": "item",
            "itemId": "6f775d41-d587-4f18-b796-23b7df8f4daf"
        }
    ],
    "magic": {
        "spells": [
            {
                "id": "1581b807-5ec5-4548-867c-a98cf5c22c70",
                "characterId": "2005a647-e82b-4e13-a9d8-e393ced10677",
                "name": "Contract Fire Bolt",
                "level": 0,
                "school": "Evocation",
                "castingTime": "1 action",
                "range": "120 feet",
                "components": "V, S",
                "duration": "Instantaneous",
                "concentration": false,
                "ritual": false,
                "description": "Contract test spell"
            }
        ],
        "spellSlots": [
            {
                "used": 0,
                "level": 1,
                "total": 2
            }
        ],
        "spellcastingAbility": null
    },
    "inventory": {
        "items": [
            {
                "id": "6f775d41-d587-4f18-b796-23b7df8f4daf",
                "itemId": "6f775d41-d587-4f18-b796-23b7df8f4daf",
                "name": "Contract Custom Sword",
                "type": "weapon",
                "effects": [],
                "allowedSlots": [
                    "mainHand"
                ],
                "isEquipped": true,
                "equippedSlot": "mainHand",
                "quantity": 1,
                "notes": "Личный меч персонажа для contract-check",
                "weaponConfig": {
                    "attackType": "melee",
                    "ability": "strength",
                    "damageDice": "1d8",
                    "damageBonus": 0,
                    "damageType": "slashing",
                    "notes": ""
                }
            }
        ],
        "equippedItems": [
            {
                "id": "6f775d41-d587-4f18-b796-23b7df8f4daf",
                "itemId": "6f775d41-d587-4f18-b796-23b7df8f4daf",
                "name": "Contract Custom Sword",
                "type": "weapon",
                "effects": [],
                "allowedSlots": [
                    "mainHand"
                ],
                "isEquipped": true,
                "equippedSlot": "mainHand",
                "quantity": 1,
                "notes": "Личный меч персонажа для contract-check",
                "weaponConfig": {
                    "attackType": "melee",
                    "ability": "strength",
                    "damageDice": "1d8",
                    "damageBonus": 0,
                    "damageType": "slashing",
                    "notes": ""
                }
            }
        ]
    },
    "progression": {
        "hitDice": {
            "total": 1,
            "used": 0,
            "dice": "1d8"
        },
        "hpIncreases": []
    }
} satisfies CharacterSheet

// =========================================================
// 2. GET /characters / GET /characters/:id
// =========================================================

// GET /characters/:id сейчас возвращает backend entity,
// а не frontend legacy Character.
// Главный контракт листа проверяется через characterSheetResponse.
const characterResponse = {
    "id": "7de0f53e-108a-4235-b49a-dffaf7f7fd77",
    "name": "Profile Contract Test Hero",
    "race": "Human",
    "className": "Fighter",
    "level": 1,
    "description": null,
    "alignment": null,
    "background": null,
    "avatarUrl": null,
    "currentHp": 8,
    "temporaryHp": 0,
    "speed": 30,
    "inspiration": false,
    "spellcastingAbility": null,
    "createdAt": "2026-05-12T19:33:27.938Z",
    "updatedAt": "2026-05-12T19:33:27.938Z"
} satisfies Character

// =========================================================
// 3. GET /items
// =========================================================

const itemTemplateResponse = [] satisfies ItemTemplate[]

// =========================================================
// 4. HP action responses
// POST /characters/:id/hp/damage
// POST /characters/:id/hp/heal
// POST /characters/:id/hp/temp
// =========================================================

const hpActionResponse = {
  "id": "2005a647-e82b-4e13-a9d8-e393ced10677",
  "level": 1,
  "currentHp": 5,
  "temporaryHp": 0,
  "hitDiceTotal": 1,
  "hitDiceUsed": 0,
  "hitDiceDice": "1d8",
  "inspiration": false,
  "deathSaveSuccesses": 0,
  "deathSaveFailures": 0,
  "spellSlots": [
    {
      "used": 0,
      "level": 1,
      "total": 2
    }
  ],
  "createdAt": "2026-05-12T18:41:42.881Z",
  "updatedAt": "2026-05-12T18:50:19.666Z"
} satisfies HpState & Record<string, unknown>

// =========================================================
// 5. Payload checks: create/update character
// =========================================================

const createCharacterPayload = {
  name: 'Profile Contract Test Hero',
  race: 'Human',
  className: 'Fighter',
  level: 1,
  description: null,
  alignment: null,
  background: null,
  avatarUrl: null,
  speed: 30,
  spellcastingAbility: null,
} satisfies CreateCharacterInput

const updateCharacterPayload = {
  "description": "",
  "avatarUrl": "",
  "spellcastingAbility": "strength"
} satisfies UpdateCharacterInput

// =========================================================
// 6. Payload checks: create/update item
// =========================================================

const createItemPayload = {
  "nameSnapshot": "Contract Custom Sword",
  "quantity": 1,
  "notes": "Личный меч персонажа для contract-check",
  "type": "weapon",
  "allowedSlots": [
    "mainHand"
  ],
  "effects": [],
  "weaponConfig": {
    "notes": "",
    "ability": "strength",
    "attackType": "melee",
    "damageDice": "1d8",
    "damageType": "slashing",
    "damageBonus": 0
  }
} satisfies CreateItemInput

const updateItemPayload = {
  "notes": "",
  "quantity": 2
} satisfies UpdateItemInput

// =========================================================
// 7. Negative checks
// Эти блоки должны давать TypeScript-ошибку.
// Если ошибки нет — значит тип слишком широкий.
// =========================================================

const invalidCreateItemPayload1 = {
  nameSnapshot: 'Bad Item',

  // @ts-expect-error create item не должен принимать isEquipped
  isEquipped: false,
} satisfies CreateItemInput

const invalidCreateItemPayload2 = {
  nameSnapshot: 'Bad Item',

  // @ts-expect-error create item не должен принимать slot
  slot: 'mainHand',
} satisfies CreateItemInput

const invalidSheetItem = {
  ...characterSheetResponse.inventory.items[0],

  // @ts-expect-error item в sheet не должен иметь старый slot
  slot: 'mainHand',
} satisfies CharacterSheet['inventory']['items'][number]

void characterSheetResponse
void characterResponse
void itemTemplateResponse
void hpActionResponse
void createCharacterPayload
void updateCharacterPayload
void createItemPayload
void updateItemPayload
void invalidCreateItemPayload1
void invalidCreateItemPayload2
void invalidSheetItem
void characterResponse

export {}