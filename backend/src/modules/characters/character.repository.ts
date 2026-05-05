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
  UpdateSpellSlotsInput,
  CreateCharacterStatsInput,
  UpdateCharacterStatsInput,
} from './character.schemas'

// =========================================================
// Include-конфиги
// =========================================================

// Базовый include для большинства операций над персонажем.
// Здесь подтягиваем только stats, чтобы не раздувать ответ без необходимости.
const characterBaseInclude = {
  stats: true,
} as const

// Расширенный include для "собранного" персонажа.
// Используется там, где нужен более полный character sheet.
const characterSheetInclude = {
   stats: true,
    attacks: true,
    spells: true,
    items: {
      include: {
        itemTemplate: true,
      },
    },
    hpIncreases: {
      orderBy: {
        level: 'asc',
      },
    },
} as const

// =========================================================
// Внутренние типы repository
// =========================================================

// Внутренний тип для обновления HP-состояния персонажа.
type UpdateHpStateInput = {
  currentHp: number
  temporaryHp: number
}
type HpIncreaseMode = 'fixed' | 'roll'

type CreateHpIncreaseInput = {
  level: number
  mode: HpIncreaseMode
  value: number
  dice: string
  rolledValue?: number | null
}

type CharacterStatsInput = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

type UpdateLevelAndHpStateInput = {
  level: number
  currentHp: number
  temporaryHp: number
  hitDiceTotal: number
  hitDiceDice: string
}

export const characterRepository = {
  // =========================================================
  // Characters
  // =========================================================

  // Получить список всех персонажей.
  findAll() {
    return prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: characterBaseInclude,
    })
  },

  // Получить персонажа по ID.
  findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterBaseInclude,
    })
  },

  // Получить персонажа с полным набором связанных сущностей.
  // Это ближе к character sheet, чем обычный findById.
  findByIdWithSheet(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterSheetInclude,
    })
  },

  // Создать нового персонажа.
  // Важно:
  // - поля spellcastingAbility / death saves / hit dice / spellSlots
  //   записываются в Character, а не в CharacterStats
  // - stats создаются отдельно как relation create
  create(data: CreateCharacterInput) {
    return prisma.character.create({
      data: {
        name: data.name,
        race: data.race,
        class: data.class,
        level: data.level ?? 1,
        description: data.description ?? null,
        alignment: data.alignment ?? null,
        background: data.background ?? null,

        // Пустую строку превращаем в null, чтобы не хранить мусор.
        avatarUrl: data.avatarUrl?.trim() ? data.avatarUrl : null,

        currentHp: data.currentHp ?? 0,
        temporaryHp: data.temporaryHp ?? 0,
        speed: data.speed ?? 30,
        inspiration: data.inspiration ?? false,

        spellcastingAbility: data.spellcastingAbility ?? null,

        deathSaveSuccesses: data.deathSaveSuccesses ?? 0,
        deathSaveFailures: data.deathSaveFailures ?? 0,

        hitDiceTotal: data.hitDiceTotal ?? null,
        hitDiceUsed: data.hitDiceUsed ?? 0,
        hitDiceDice: data.hitDiceDice ?? null,

        // В Prisma это Json?, поэтому можно хранить массив объектов напрямую.
        spellSlots: [],

        // Для нового персонажа создаём базовые stats по умолчанию.
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

  // Обновить базовые поля персонажа.
  update(id: string, data: UpdateCharacterInput) {
    return prisma.character.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.race !== undefined && { race: data.race }),
        ...(data.class !== undefined && { class: data.class }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.alignment !== undefined && { alignment: data.alignment }),
        ...(data.background !== undefined && { background: data.background }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl.trim() ? data.avatarUrl : null,
        }),

        ...(data.currentHp !== undefined && { currentHp: data.currentHp }),
        ...(data.temporaryHp !== undefined && {
          temporaryHp: data.temporaryHp,
        }),
        ...(data.speed !== undefined && { speed: data.speed }),
        ...(data.inspiration !== undefined && { inspiration: data.inspiration }),

        ...(data.spellcastingAbility !== undefined && {
          spellcastingAbility: data.spellcastingAbility,
        }),

        ...(data.deathSaveSuccesses !== undefined && {
          deathSaveSuccesses: data.deathSaveSuccesses,
        }),
        ...(data.deathSaveFailures !== undefined && {
          deathSaveFailures: data.deathSaveFailures,
        }),

        ...(data.hitDiceTotal !== undefined && {
          hitDiceTotal: data.hitDiceTotal,
        }),
        ...(data.hitDiceUsed !== undefined && {
          hitDiceUsed: data.hitDiceUsed,
        }),
        ...(data.hitDiceDice !== undefined && {
          hitDiceDice: data.hitDiceDice,
        }),
      },
      include: characterBaseInclude,
    })
  },

  // Удалить персонажа.
  delete(id: string) {
    return prisma.character.delete({
      where: { id },
    })
  },

  // =========================================================
  // Character stats
  // =========================================================

  // Получить stats персонажа по characterId.
  findStatsByCharacterId(characterId: string) {
    return prisma.characterStats.findUnique({
      where: { characterId },
    })
  },

    // Обновить базовые характеристики персонажа.
  // Используется для ручного ввода статов через форму.
  updateStats(characterId: string, data: CharacterStatsInput) {
    return prisma.characterStats.update({
      where: {
        characterId,
      },
      data: {
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
    })
  },

  // Создать stats, если их почему-то ещё нет.
  // Нужен как безопасный fallback, чтобы PATCH /characters/:id/stats
  // не падал, если персонаж был создан до появления CharacterStats.
  createStats(characterId: string, data: CharacterStatsInput) {
    return prisma.characterStats.create({
      data: {
        characterId,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
    })
  },

  // Обновить stats, а если записи нет — создать.
  // Это самый удобный метод для service:
  // service не обязан знать, существует ли CharacterStats.
  upsertStats(characterId: string, data: CharacterStatsInput) {
    return prisma.characterStats.upsert({
      where: {
        characterId,
      },
      update: {
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
      create: {
        characterId,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
    })
  },

  // =========================================================
  // HP
  // =========================================================

  // Обновить HP-состояние персонажа.
  // Используется сервисом для damage / heal / set temp HP.
  updateHpState(id: string, data: UpdateHpStateInput) {
    return prisma.character.update({
      where: { id },
      data: {
        currentHp: data.currentHp,
        temporaryHp: data.temporaryHp,
      },
      include: characterBaseInclude,
    })
  },

    // Получить персонажа со всем, что нужно для расчёта HP.
    // Используется для heal / level-up / пересчёта maxHp.
    findByIdWithHpData(id: string) {
      return prisma.character.findUnique({
        where: { id },
        include: {
          stats: true,
          hpIncreases: {
            orderBy: {
              level: 'asc',
            },
          },
        },
      })
    },

    // Найти HP-прибавку конкретного персонажа на конкретном уровне.
    // Нужна защита от дублей при level-up.
    findHpIncreaseByLevel(characterId: string, level: number) {
      return prisma.characterHpIncrease.findFirst({
        where: {
          characterId,
          level,
        },
      })
    },

    // Сохранить HP-прибавку за уровень.
    // Например: level 2, fixed, value 5, dice 1d8.
    createHpIncrease(characterId: string, data: CreateHpIncreaseInput) {
      return prisma.characterHpIncrease.create({
        data: {
          characterId,
          level: data.level,
          mode: data.mode,
          value: data.value,
          dice: data.dice,
          rolledValue: data.rolledValue ?? null,
        },
      })
    },

    // Обновить уровень и HP-состояние после level-up.
    updateLevelAndHpState(id: string, data: UpdateLevelAndHpStateInput) {
      return prisma.character.update({
        where: { id },
        data: {
          level: data.level,
          currentHp: data.currentHp,
          temporaryHp: data.temporaryHp,
          hitDiceTotal: data.hitDiceTotal,
          hitDiceDice: data.hitDiceDice,
        },
        include: characterSheetInclude,
      })
    },

    // Удаляет HP-прибавки выше указанного уровня.
    // Нужно, когда пользователь вручную понижает level через форму.
    deleteHpIncreasesAboveLevel(characterId: string, level: number) {
      return prisma.characterHpIncrease.deleteMany({
        where: {
          characterId,
          level: {
            gt: level,
          },
        },
      })
    },

  // =========================================================
  // Attacks
  // =========================================================

  // Найти атаку по ID.
  findAttackById(attackId: string) {
    return prisma.characterAttack.findUnique({
      where: { id: attackId },
    })
  },

  // Получить все атаки персонажа.
  findAttacksByCharacterId(characterId: string) {
    return prisma.characterAttack.findMany({
      where: { characterId },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  // Добавить атаку персонажу.
  addAttack(characterId: string, data: CreateAttackInput) {
    return prisma.characterAttack.create({
      data: {
        characterId,
        name: data.name,
        attackType: data.attackType ?? null,
        ability: data.ability ?? null,
        proficient: data.proficient ?? false,
        damageDice: data.damageDice ?? null,
        damageBonus: data.damageBonus ?? null,
        damageType: data.damageType ?? null,
        notes: data.notes ?? null,
        source: data.source ?? null,
        itemId: data.itemId ?? null,
      },
    })
  },

  // Обновить атаку.
  updateAttack(attackId: string, data: UpdateAttackInput) {
    return prisma.characterAttack.update({
      where: { id: attackId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.attackType !== undefined && { attackType: data.attackType }),
        ...(data.ability !== undefined && { ability: data.ability }),
        ...(data.proficient !== undefined && { proficient: data.proficient }),
        ...(data.damageDice !== undefined && { damageDice: data.damageDice }),
        ...(data.damageBonus !== undefined && {
          damageBonus: data.damageBonus,
        }),
        ...(data.damageType !== undefined && { damageType: data.damageType }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.itemId !== undefined && { itemId: data.itemId }),
      },
    })
  },

  // Удалить атаку.
  deleteAttack(attackId: string) {
    return prisma.characterAttack.delete({
      where: { id: attackId },
    })
  },

  // Удалить все item-атаки, связанные с конкретным предметом.
  // Это пригодится для логики экипировки/снятия предметов.
  deleteAttacksByItemId(characterId: string, itemId: string) {
    return prisma.characterAttack.deleteMany({
      where: {
        characterId,
        itemId,
      },
    })
  },

  // =========================================================
  // Spells
  // =========================================================

  // Найти заклинание по ID.
  findSpellById(spellId: string) {
    return prisma.characterSpell.findUnique({
      where: { id: spellId },
    })
  },

  // Получить все заклинания персонажа.
  findSpellsByCharacterId(characterId: string) {
    return prisma.characterSpell.findMany({
      where: { characterId },
      orderBy: [
        { level: 'asc' },
        { createdAt: 'asc' },
      ],
    })
  },

  // Добавить заклинание персонажу.
  addSpell(characterId: string, data: CreateSpellInput) {
    return prisma.characterSpell.create({
      data: {
        characterId,
        name: data.name,
        level: data.level,
        school: data.school ?? null,
        castingTime: data.castingTime ?? null,
        range: data.range ?? null,
        components: data.components ?? null,
        duration: data.duration ?? null,
        concentration: data.concentration ?? false,
        ritual: data.ritual ?? false,
        description: data.description ?? null,
      },
    })
  },

  // Обновить заклинание.
  updateSpell(spellId: string, data: UpdateSpellInput) {
    return prisma.characterSpell.update({
      where: { id: spellId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.school !== undefined && { school: data.school }),
        ...(data.castingTime !== undefined && {
          castingTime: data.castingTime,
        }),
        ...(data.range !== undefined && { range: data.range }),
        ...(data.components !== undefined && { components: data.components }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.concentration !== undefined && {
          concentration: data.concentration,
        }),
        ...(data.ritual !== undefined && { ritual: data.ritual }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    })
  },

  // Удалить заклинание.
  deleteSpell(spellId: string) {
    return prisma.characterSpell.delete({
      where: { id: spellId },
    })
  },

  // =========================================================
  // Spell slots
  // =========================================================

  // Обновить весь массив spell slots у персонажа.
  // В Prisma поле хранится как Json.
  updateSpellSlots(id: string, data: UpdateSpellSlotsInput) {
    return prisma.character.update({
      where: { id },
      data: {
        spellSlots: data.spellSlots,
      },
      include: characterSheetInclude,
    })
  },

  // =========================================================
  // Items / Inventory
  // =========================================================

  // Получить все шаблоны предметов.
  findAllItemTemplates() {
    return prisma.itemTemplate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  // Найти шаблон предмета по ID.
  findItemTemplateById(itemTemplateId: string) {
    return prisma.itemTemplate.findUnique({
      where: { id: itemTemplateId },
    })
  },

  // Найти предмет персонажа по ID.
  findItemById(itemId: string) {
    return prisma.characterItem.findUnique({
      where: { id: itemId },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Получить все предметы персонажа.
  findItemsByCharacterId(characterId: string) {
    return prisma.characterItem.findMany({
      where: { characterId },
      include: {
        itemTemplate: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  // Найти уже экипированный предмет в конкретном слоте.
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

  // Добавить предмет в инвентарь персонажа.
  // nameSnapshot обязателен по Prisma, поэтому здесь он должен приходить уже готовым.
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

  // Обновить предмет персонажа.
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

  // Удалить предмет персонажа.
  deleteItem(itemId: string) {
    return prisma.characterItem.delete({
      where: { id: itemId },
    })
  },

  // Экипировать предмет.
  // При необходимости слот можно пробросить отдельно через updateItem,
  // либо расширить этот метод под body со slot.
  equipItem(itemId: string, slot?: string | null) {
    return prisma.characterItem.update({
      where: { id: itemId },
      data: {
        isEquipped: true,
        ...(slot !== undefined && { slot }),
      },
      include: {
        itemTemplate: true,
      },
    })
  },

  // Снять предмет.
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