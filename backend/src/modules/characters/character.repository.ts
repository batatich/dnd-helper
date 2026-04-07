import { prisma } from '../../lib/prisma'
import type {
  CreateAttackInput,
  CreateCharacterInput,
  CreateItemInput,
  CreateSpellInput,
  UpdateAttackInput,
  UpdateCharacterInput,
  UpdateItemInput,
  UpdateSpellInput,
} from './character.schemas'

// Базовый include для персонажа (минимум для большинства операций)
const characterBaseInclude = {
  stats: true,
} as const

// Расширенный include для "собранного" персонажа (ближе к sheet)
const characterSheetInclude = {
  stats: true,
  attacks: true,
  spells: true,
  items: {
    include: {
      itemTemplate: true,
    },
  },
} as const

// Внутренний тип для обновления HP-состояния
type UpdateHpStateInput = {
  currentHp: number
  temporaryHp: number
}

// Тип для spell slots (пока хранится как массив)
type UpdateSpellSlotsInput = {
  level: number
  total: number
  used: number
}[]

export const characterRepository = {
  // =========================================================
  // Characters
  // =========================================================

  // Получить список всех персонажей (для списка/дашборда)
  findAll() {
    return prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: characterBaseInclude,
    })
  },

  // Получить одного персонажа по ID
  findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterBaseInclude,
    })
  },

  // Создать нового персонажа с дефолтными значениями
  create(data: CreateCharacterInput) {
    return prisma.character.create({
      data: {
        name: data.name,
        race: data.race,
        className: data.className,
        level: data.level ?? 1,
        description: data.description,
        alignment: data.alignment,
        background: data.background,

        // Приводим пустую строку к null
        avatarUrl: data.avatarUrl?.trim() ? data.avatarUrl : null,

        currentHp: data.currentHp ?? 0,
        temporaryHp: data.temporaryHp ?? 0,
        speed: data.speed ?? 30,
        inspiration: data.inspiration ?? false,

        // Создаём базовые характеристики
        stats: {
          create: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
          },
        },
      },
      include: characterBaseInclude,
    })
  },

  // Обновить базовые поля персонажа
  update(id: string, data: UpdateCharacterInput) {
    return prisma.character.update({
      where: { id },
      data: {
        ...data,

        // Нормализация avatarUrl ('' → null)
        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl.trim() ? data.avatarUrl : null,
        }),
      },
      include: characterBaseInclude,
    })
  },

  // Удалить персонажа
  delete(id: string) {
    return prisma.character.delete({
      where: { id },
    })
  },

  // =========================================================
  // HP
  // =========================================================

  // Обновление HP состояния (используется сервисом для damage/heal/tempHp)
  updateHpState(id: string, data: UpdateHpStateInput) {
    return prisma.character.update({
      where: { id },
      data,
      include: characterBaseInclude,
    })
  },

  // =========================================================
  // Attacks
  // =========================================================

  // Найти атаку по ID
  findAttackById(attackId: string) {
    return prisma.characterAttack.findUnique({
      where: { id: attackId },
    })
  },

  // Добавить атаку персонажу
  addAttack(characterId: string, data: CreateAttackInput) {
    return prisma.characterAttack.create({
      data: {
        characterId,
        ...data,
      },
    })
  },

  // Обновить атаку
  updateAttack(attackId: string, data: UpdateAttackInput) {
    return prisma.characterAttack.update({
      where: { id: attackId },
      data,
    })
  },

  // Удалить атаку
  deleteAttack(attackId: string) {
    return prisma.characterAttack.delete({
      where: { id: attackId },
    })
  },

  // =========================================================
  // Spells
  // =========================================================

  // Найти заклинание по ID
  findSpellById(spellId: string) {
    return prisma.characterSpell.findUnique({
      where: { id: spellId },
    })
  },

  // Добавить заклинание персонажу
  addSpell(characterId: string, data: CreateSpellInput) {
    return prisma.characterSpell.create({
      data: {
        characterId,
        ...data,
      },
    })
  },

  // Обновить заклинание
  updateSpell(spellId: string, data: UpdateSpellInput) {
    return prisma.characterSpell.update({
      where: { id: spellId },
      data,
    })
  },

  // Удалить заклинание
  deleteSpell(spellId: string) {
    return prisma.characterSpell.delete({
      where: { id: spellId },
    })
  },

  // =========================================================
  // Spell slots
  // =========================================================

  // Обновить все слоты заклинаний персонажа
  // (пока храним как массив, позже можно вынести в отдельную таблицу)
  updateSpellSlots(id: string, spellSlots: UpdateSpellSlotsInput) {
    return prisma.character.update({
      where: { id },
      data: {
        spellSlots,
      },
      include: characterSheetInclude,
    })
  },

  // =========================================================
  // Items / Inventory
  // =========================================================

  // Получить все шаблоны предметов
  findAllItemTemplates() {
    return prisma.itemTemplate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  // Найти шаблон предмета по ID
  findItemTemplateById(itemTemplateId: string) {
    return prisma.itemTemplate.findUnique({
      where: { id: itemTemplateId },
    })
  },

  // Найти предмет персонажа по ID
  findItemById(itemId: string) {
    return prisma.characterItem.findUnique({
      where: { id: itemId },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Найти уже экипированный предмет персонажа по слоту
  // Используется для проверки занятости слота
  findEquippedItemBySlot(characterId: string, slot: string) {
    return prisma.characterItem.findFirst({
      where: {
        characterId,
        slot,
        isEquipped: true,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Добавить предмет в инвентарь персонажа
  addItem(characterId: string, data: CreateItemInput & { nameSnapshot: string }) {
    return prisma.characterItem.create({
      data: {
        characterId,
        itemTemplateId: data.itemTemplateId ?? null,
        nameSnapshot: data.nameSnapshot,
        quantity: data.quantity ?? 1,
        isEquipped: data.isEquipped ?? false,
        slot: data.slot ?? null,
        notes: data.notes ?? null,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Обновить предмет персонажа
  updateItem(itemId: string, data: UpdateItemInput) {
    return prisma.characterItem.update({
      where: { id: itemId },
      data: {
        ...(data.nameSnapshot !== undefined && {
          nameSnapshot: data.nameSnapshot,
        }),
        ...(data.quantity !== undefined && {
          quantity: data.quantity,
        }),
        ...(data.isEquipped !== undefined && {
          isEquipped: data.isEquipped,
        }),
        ...(data.slot !== undefined && {
          slot: data.slot,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Удалить предмет персонажа
  deleteItem(itemId: string) {
    return prisma.characterItem.delete({
      where: { id: itemId },
    })
  },

  // Экипировать предмет
  equipItem(itemId: string) {
    return prisma.characterItem.update({
      where: { id: itemId },
      data: {
        isEquipped: true,
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Снять предмет
  unequipItem(itemId: string) {
    return prisma.characterItem.update({
      where: { id: itemId },
      data: {
        isEquipped: false,
      },
      include: {
        itemTemplate: true,
      },
    })
  },
}