import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AttackSection } from '../components/AttackSection'
import { ProfileSection } from '../components/ProfileSection'
import { SpellSection } from '../components/SpellSection'

import { useCharacterStore } from '../stores/characterStore'

import type { Character, NewAttack, NewSpell, Stats } from '../types/characters'
import type { EquipmentSlot, ItemEffect } from '../types/items'

import { getModifier } from '../utils/stats'
import { calculateSkillBonus, getProficiencyBonus } from '../utils/skills'
import { calculateSavingThrowBonus } from '../utils/savingThrows'
import { formatItemEffect } from '../utils/itemEffects'
import { standardSkills } from '../types/characters'

const defaultStats: Stats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

type InventoryItemForUi = {
  id: string
  itemId: string
  name: string
  type: string
  effects: ItemEffect[]
  allowedSlots: EquipmentSlot[]
  isEquipped: boolean
  equippedSlot: EquipmentSlot | null
}

type BackendInventoryItem = {
  id: string
  nameSnapshot?: string | null
  quantity?: number | null
  notes?: string | null
  isEquipped?: boolean
  slot?: EquipmentSlot | string | null
  template?: {
    id: string
    name: string
    type?: string | null
    slot?: EquipmentSlot | string | null
    effects?: unknown
  } | null
  itemTemplate?: {
    id: string
    name: string
    type?: string | null
    slot?: EquipmentSlot | string | null
    effects?: unknown
  } | null
}


type ServerDerivedStatsForUi = {
  armorClass?: number | null
  initiative?: number | null
  maxHp?: number | null
}

type CharacterSheetForUi = Character & {
  stats?: Partial<Stats> | null
  derived?: ServerDerivedStatsForUi | null
  hitDice?: {
    total?: number | null
    used?: number | null
    dice?: string | null
  } | null
}

export function CharacterSheet() {
  const { id } = useParams()

  const {
    currentSheet,
    currentCharacter,
    isLoading,
    error,
    fetchCharacterSheet,
    updateCharacter,
    updateCharacterStats,
    damageCharacter,
    healCharacter,
    setTemporaryHp,
    addAttack,
    updateAttack,
    deleteAttack,
    addSpell,
    updateSpell,
    deleteSpell,
    updateSpellSlots,
    updateSpellcastingAbility,
    equipItem,
    unequipItem,
    levelUpCharacter,
  } = useCharacterStore()

  const [tempHpInput, setTempHpInput] = useState(0)
  const [hpChangeInput, setHpChangeInput] = useState('')

  useEffect(() => {
    if (!id) return

    void fetchCharacterSheet(id)
  }, [id, fetchCharacterSheet])

  const character = currentSheet ?? currentCharacter

  const handleUpdateProfile = async (updates: Partial<Character>) => {
    if (!character) return

    await updateCharacter(character.id, {
      name: updates.name?.trim() || character.name,
      race: updates.race?.trim() || character.race,
      class: updates.class?.trim() || character.class,

      // level отправляем только если он есть.
      // Backend сам проверит 1–20 и обработает понижение.
      level: updates.level,

      description: updates.description ?? character.description,
      alignment: updates.alignment ?? character.alignment,
      background: updates.background ?? character.background,
      avatarUrl: updates.avatarUrl ?? character.avatarUrl,

      currentHp: updates.currentHp ?? character.currentHp,
      temporaryHp: updates.temporaryHp ?? character.temporaryHp,
      speed: updates.speed ?? character.speed,
      inspiration: updates.inspiration ?? character.inspiration,
      spellcastingAbility:
        updates.spellcastingAbility ?? character.spellcastingAbility,
    })
  }

  const handleUpdateStats = async (stats: Stats) => {
    if (!character) return

    await updateCharacterStats(character.id, stats)
  }

  const handleHpChange = async () => {
    if (!character) return

    const value = hpChangeInput.trim()

    if (!value) return

    const isHeal = value.startsWith('+')
    const amount = Number(isHeal ? value.slice(1) : value)

    if (!Number.isFinite(amount) || amount <= 0) {
      return
    }

    if (isHeal) {
      await healCharacter(character.id, amount)
    } else {
      await damageCharacter(character.id, amount)
    }

    setHpChangeInput('')
  }

  const handleSetTempHp = async () => {
    if (!character) return

    if (!Number.isFinite(tempHpInput) || tempHpInput < 0) {
      return
    }

    await setTemporaryHp(character.id, tempHpInput)
  }

  const handleLevelUpFixed = async () => {
    if (!character) return

    await levelUpCharacter(character.id, 'fixed')
  }

  const handleLevelUpRoll = async () => {
    if (!character) return

    await levelUpCharacter(character.id, 'roll')
  }

  const handleAddAttack = async (attack: NewAttack) => {
    if (!character) return

    await addAttack(character.id, attack)
  }

  const handleUpdateAttack = async (
    attackId: string,
    attack: Partial<NewAttack>
  ) => {
    if (!character) return

    await updateAttack(character.id, attackId, attack)
  }

  const handleDeleteAttack = async (attackId: string) => {
    if (!character) return

    await deleteAttack(character.id, attackId)
  }

  const handleAddSpell = async (spell: NewSpell) => {
    if (!character) return

    await addSpell(character.id, spell)
  }

  const handleUpdateSpell = async (spellId: string, spell: Partial<NewSpell>) => {
    if (!character) return

    await updateSpell(character.id, spellId, spell)
  }

  const handleDeleteSpell = async (spellId: string) => {
    if (!character) return

    await deleteSpell(character.id, spellId)
  }

  const handleSetSpellcastingAbility = async (ability: keyof Stats) => {
    if (!character) return

    await updateSpellcastingAbility(character.id, ability)
  }

  const handleSetSpellSlotsTotal = async (level: number, total: number) => {
    if (!character) return

    const nextSpellSlots = (character.spellSlots ?? []).map((slot) =>
      slot.level === level
        ? {
            ...slot,
            total,
            used: Math.min(Number(slot.used ?? 0), total),
          }
        : slot
    )

    await updateSpellSlots(character.id, nextSpellSlots)
  }

  const handleChangeSpellSlot = async (level: number, delta: number) => {
    if (!character) return

    const nextSpellSlots = (character.spellSlots ?? []).map((slot) =>
      slot.level === level
        ? {
            ...slot,
            used: Math.max(
              0,
              Math.min(Number(slot.total ?? 0), Number(slot.used ?? 0) + delta)
            ),
          }
        : slot
    )

    await updateSpellSlots(character.id, nextSpellSlots)
  }

  const handleEquipItem = async (item: InventoryItemForUi) => {
    if (!character) return

    await equipItem(character.id, item.itemId)
  }

  const handleUnequipItem = async (itemId: string) => {
    if (!character) return

    await unequipItem(character.id, itemId)
  }

  if (isLoading && !character) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Загрузка персонажа...</h1>
      </div>
    )
  }

  if (error && !character) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Ошибка загрузки</h1>
        <p className="text-red-400 mt-2">{error}</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Персонаж не найден</h1>
        <p className="text-gray-400 mt-2">Возможно, он был удалён</p>
      </div>
    )
  }

  const sheetCharacter = character as CharacterSheetForUi
  const serverDerivedStats = sheetCharacter.derived ?? undefined

  const slotLabels: Record<string, string> = {
    mainHand: 'Основная рука',
    offHand: 'Вторая рука',
    head: 'Голова',
    body: 'Тело',
    ring1: 'Кольцо 1',
    ring2: 'Кольцо 2',
    amulet: 'Амулет',
    boots: 'Обувь',
  }

  const safeBaseStats: Stats = {
    strength: Number(
      character.baseStats?.strength ?? sheetCharacter.stats?.strength ?? defaultStats.strength
    ),
    dexterity: Number(
      character.baseStats?.dexterity ?? sheetCharacter.stats?.dexterity ?? defaultStats.dexterity
    ),
    constitution: Number(
      character.baseStats?.constitution ??
        sheetCharacter.stats?.constitution ??
        defaultStats.constitution
    ),
    intelligence: Number(
      character.baseStats?.intelligence ??
        sheetCharacter.stats?.intelligence ??
        defaultStats.intelligence
    ),
    wisdom: Number(
      character.baseStats?.wisdom ?? sheetCharacter.stats?.wisdom ?? defaultStats.wisdom
    ),
    charisma: Number(
      character.baseStats?.charisma ?? sheetCharacter.stats?.charisma ?? defaultStats.charisma
    ),
  }

  const finalStats: Stats = safeBaseStats

  const finalDerivedStats = {
    armorClass: Number(
      serverDerivedStats?.armorClass ?? character.derivedStats?.armorClass ?? 10
    ),
    initiative: Number(
      serverDerivedStats?.initiative ??
        character.derivedStats?.initiative ??
        getModifier(finalStats.dexterity)
    ),
    maxHp: Number(
      serverDerivedStats?.maxHp ?? character.derivedStats?.maxHp ?? character.currentHp ?? 0
    ),
  }

  const safeCharacterForProfile: Character = {
    ...character,
    name: character.name ?? '',
    race: character.race ?? '',
    class: character.class ?? '',
    level: character.level ?? 1,
    alignment: character.alignment ?? '',
    background: character.background ?? '',
    description: character.description ?? '',
    avatarUrl: character.avatarUrl ?? '',
    baseStats: safeBaseStats,
  }

  const rawInventory = (character.inventory ?? []) as unknown[]

  const backendInventoryItems = rawInventory.filter(
    (item): item is BackendInventoryItem =>
      typeof item === 'object' && item !== null && 'id' in item
  )

  const inventoryItems: InventoryItemForUi[] = backendInventoryItems.map(
    (inventoryItem) => {
      const template = inventoryItem.template ?? inventoryItem.itemTemplate

      let parsedNotes: { allowedSlots?: EquipmentSlot[]; type?: string } = {}

      try {
        if (inventoryItem.notes) {
          parsedNotes = JSON.parse(inventoryItem.notes)
        }
      } catch {
        parsedNotes = {}
      }

      return {
        id: inventoryItem.id,
        itemId: inventoryItem.id,
        name: inventoryItem.nameSnapshot ?? template?.name ?? 'Предмет',
        type: template?.type ?? parsedNotes.type ?? 'Предмет',
        effects: Array.isArray(template?.effects) ? (template.effects as ItemEffect[]) : [],
        allowedSlots: template?.slot
          ? [template.slot as EquipmentSlot]
          : parsedNotes.allowedSlots ?? [],
        isEquipped: inventoryItem.isEquipped ?? false,
        equippedSlot: inventoryItem.slot as EquipmentSlot | null,
      }
    }
  )

  const equipmentSlots = Object.keys(slotLabels) as EquipmentSlot[]

  const equippedEntries = equipmentSlots.map((slot) => {
    const item =
      inventoryItems.find(
        (inventoryItem) =>
          inventoryItem.isEquipped && inventoryItem.equippedSlot === slot
      ) ?? null

    return { slot, item }
  })

  const isItemEquipped = (itemId: string) => {
    const item = inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.itemId === itemId || inventoryItem.id === itemId
    )

    return item?.isEquipped ?? false
  }

  const getEquippedSlot = (itemId: string): EquipmentSlot | null => {
    const item = inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.itemId === itemId || inventoryItem.id === itemId
    )

    return item?.equippedSlot ?? null
  }

  const statLabels: Record<keyof Stats, string> = {
    strength: 'Сила',
    dexterity: 'Ловкость',
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма',
  }

  const skillsToDisplay =
    character.skills && character.skills.length > 0
      ? character.skills
      : standardSkills

  const savingThrowStats: (keyof Stats)[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
  ]

  const perceptionSkill = skillsToDisplay.find(
    (skill) => skill.name === 'Восприятие'
  )

  const passivePerception = perceptionSkill
    ? 10 + calculateSkillBonus(perceptionSkill, finalStats, character.level)
    : 10

  const currentHp = Number(sheetCharacter.currentHp ?? character.currentHp ?? 0)
  const temporaryHp = Number(
    sheetCharacter.temporaryHp ?? character.temporaryHp ?? 0
  )
  const deathSaves = character.deathSaves ?? { successes: 0, failures: 0 }
  const proficiencyBonus = getProficiencyBonus(character.level)
  const inspiration = character.inspiration ?? false
  const speed = character.speed ?? 30

  const hitDice = {
    total: Number(sheetCharacter.hitDice?.total ?? character.level),
    used: Number(sheetCharacter.hitDice?.used ?? character.hitDice?.used ?? 0),
    dice: sheetCharacter.hitDice?.dice ?? `${character.level}d8`,
  }

  const spells = character.spells ?? []
  const spellcastingAbility = character.spellcastingAbility ?? 'intelligence'
  const spellcastingModifier = getModifier(finalStats[spellcastingAbility])
  const spellAttackBonus = spellcastingModifier + proficiencyBonus
  const spellSaveDc = 8 + spellcastingModifier + proficiencyBonus
  const spellSlots = character.spellSlots ?? []

  const renderDeathSaveDots = (
    type: 'successes' | 'failures',
    value: number
  ) => (
    <div className="flex gap-2">
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={`w-4 h-4 rounded-full border transition ${
            value >= dot
              ? type === 'successes'
                ? 'bg-green-500 border-green-500'
                : 'bg-red-500 border-red-500'
              : 'bg-transparent border-gray-400'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ProfileSection
        character={safeCharacterForProfile}
        onUpdateCharacter={handleUpdateProfile}
        onUpdateStats={handleUpdateStats}
        isLoading={isLoading}
      />

      <div className="bg-gray-800 rounded-lg p-4 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white text-lg font-bold">Повышение уровня</h2>

            <p className="text-gray-400 text-sm mt-1">
              Текущий уровень: {character.level}. Выберите способ увеличения HP.
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Фиксированное значение сейчас даёт +5 HP. Бросок кубика выполняется на сервере: 1d8.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => void handleLevelUpFixed()}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm text-white transition"
            >
              + уровень: фикс +5 HP
            </button>

            <button
              type="button"
              onClick={() => void handleLevelUpRoll()}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm text-white transition"
            >
              + уровень: бросить 1d8
            </button>
          </div>
        </div>
      </div>      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm">Бонус мастерства</div>
          <div className="text-white text-xl font-bold">+{proficiencyBonus}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm">Вдохновение</div>
          <div className="text-white text-xl font-bold">
            {inspiration ? 'Есть' : 'Нет'}
          </div>
          <button
            className="mt-3 bg-yellow-600 px-3 py-1 rounded text-sm opacity-60 cursor-not-allowed"
            disabled
          >
            {inspiration ? 'Снять' : 'Выдать'}
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm">Скорость</div>
          <div className="text-white text-xl font-bold">{speed} фт.</div>
        </div>

        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm">Кости хитов</div>
          <div className="text-white text-xl font-bold">{hitDice.dice}</div>
          <div className="text-gray-300 text-sm mt-1">
            Использовано: {hitDice.used} / {hitDice.total}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
        {(Object.entries(finalStats) as [keyof Stats, number][]).map(
          ([key, value]) => {
            const labels: Record<keyof Stats, string> = {
              strength: 'СИЛА',
              dexterity: 'ЛОВКОСТЬ',
              constitution: 'ТЕЛОСЛОЖЕНИЕ',
              intelligence: 'ИНТЕЛЛЕКТ',
              wisdom: 'МУДРОСТЬ',
              charisma: 'ХАРИЗМА',
            }

            const mod = getModifier(value)
            const baseValue = character.baseStats[key]
            const bonus = value - baseValue

            return (
              <div
                key={key}
                className={`rounded-lg p-4 text-center transition ${
                  bonus !== 0
                    ? 'bg-gray-800 ring-2 ring-yellow-400 shadow-lg'
                    : 'bg-gray-800'
                }`}
              >
                <div className="text-gray-400 text-sm">{labels[key]}</div>
                <div className="text-3xl font-bold text-white">{value}</div>
                <div
                  className={`text-lg ${
                    mod >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {mod >= 0 ? `+${mod}` : mod}
                </div>

                {bonus !== 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    {bonus > 0 ? `+${bonus}` : bonus} от экипировки
                  </div>
                )}
              </div>
            )
          }
        )}
      </div>

      <h2 className="text-white text-xl font-bold mt-8 mb-4">Спасброски</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {savingThrowStats.map((stat) => {
          const bonus = calculateSavingThrowBonus(
            stat,
            finalStats,
            character.level,
            character.savingThrowProficiencies ?? []
          )

          const isProficient =
            character.savingThrowProficiencies?.includes(stat)

          return (
            <div
              key={stat}
              className="bg-gray-800 rounded-lg p-4 flex justify-between items-center"
            >
              <div className="text-white font-medium">{statLabels[stat]}</div>

              <div className="text-right">
                <div
                  className={`text-lg font-bold ${
                    bonus >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </div>

                {isProficient && (
                  <div className="text-xs text-yellow-400">Владение</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="text-white text-xl font-bold mt-8 mb-4">Навыки</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skillsToDisplay.map((skill) => {
          const bonus = calculateSkillBonus(skill, finalStats, character.level)

          return (
            <div
              key={skill.name}
              className="bg-gray-800 rounded-lg p-4 flex justify-between items-center gap-4"
            >
              <div>
                <div className="text-white font-medium">{skill.name}</div>
                <div className="text-gray-400 text-sm">
                  Характеристика: {statLabels[skill.attribute]}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`px-3 py-1 rounded text-sm opacity-60 cursor-not-allowed ${
                    skill.proficient
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                  disabled
                >
                  {skill.proficient ? 'Владение' : 'Без владения'}
                </button>

                <div className="text-right min-w-[60px]">
                  <div
                    className={`text-lg font-bold ${
                      bonus >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {bonus >= 0 ? `+${bonus}` : bonus}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-800 rounded-lg p-4 text-center mt-4">
        <div className="text-gray-400 text-sm">Пассивное восприятие</div>
        <div className="text-white text-xl font-bold">{passivePerception}</div>
      </div>

      <h2 className="text-white text-xl font-bold mt-8 mb-4">
        Производные характеристики
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-gray-400 text-sm">Хиты</div>
          <div className="text-white text-xl font-bold">
            {currentHp} / {finalDerivedStats.maxHp}
          </div>

          {temporaryHp > 0 && (
            <div className="text-cyan-400 text-sm mt-1">
              Временные хиты: {temporaryHp}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 justify-center">
            <input
              type="text"
              value={hpChangeInput}
              onChange={(e) => setHpChangeInput(e.target.value)}
              placeholder="+5 лечение / 5 урон"
              className="w-32 bg-gray-700 text-white rounded-lg p-2 text-center"
            />

            <button
              onClick={() => void handleHpChange()}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm transition"
            >
              Применить
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 justify-center">
            <input
              type="number"
              value={tempHpInput}
              onChange={(e) => setTempHpInput(Number(e.target.value))}
              className="w-24 bg-gray-700 text-white rounded-lg p-2 text-center"
              min="0"
            />

            <button
              onClick={() => void handleSetTempHp()}
              className="bg-cyan-600 hover:bg-cyan-700 px-3 py-2 rounded-lg text-sm transition"
            >
              Временные
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm mb-3">Спасброски от смерти</div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-green-400">Успехи</span>
              {renderDeathSaveDots('successes', deathSaves.successes)}
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-red-400">Провалы</span>
              {renderDeathSaveDots('failures', deathSaves.failures)}
            </div>

            <button
              type="button"
              className="mt-2 bg-gray-700 px-3 py-1 rounded text-sm opacity-60 cursor-not-allowed"
              disabled
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm">Класс брони</div>
          <div className="text-white text-xl font-bold">
            {finalDerivedStats.armorClass}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-gray-400 text-sm">Инициатива</div>
          <div className="text-white text-xl font-bold">
            {finalDerivedStats.initiative}
          </div>
        </div>
      </div>

      <AttackSection
        attacks={character.attacks ?? []}
        proficiencyBonus={proficiencyBonus}
        finalStats={finalStats}
        onAddAttack={handleAddAttack}
        onDeleteAttack={handleDeleteAttack}
        onUpdateAttack={handleUpdateAttack}
      />

      <SpellSection
        spells={spells}
        spellSlots={spellSlots}
        spellcastingAbility={spellcastingAbility}
        spellSaveDc={spellSaveDc}
        spellAttackBonus={spellAttackBonus}
        onAddSpell={handleAddSpell}
        onDeleteSpell={handleDeleteSpell}
        onUpdateSpell={handleUpdateSpell}
        onSetSpellcastingAbility={handleSetSpellcastingAbility}
        onSetSpellSlotsTotal={handleSetSpellSlotsTotal}
        onChangeSpellSlot={handleChangeSpellSlot}
      />

      <h2 className="text-white text-xl font-bold mt-8 mb-4">Экипировка</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equippedEntries.map(({ slot, item }) => (
          <div
            key={slot}
            className="bg-gray-800 rounded-lg p-4 flex justify-between items-center gap-4"
          >
            <div>
              <div className="text-gray-400 text-sm">
                {slotLabels[slot] || slot}
              </div>

              <div className="text-white font-semibold">
                {item ? item.name : 'Пусто'}
              </div>

              {item && (
                <div className="mt-1 flex flex-col gap-1">
                  {item.effects.map((effect, index) => (
                    <div key={index} className="text-green-400 text-sm">
                      {formatItemEffect(effect)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {item && (
              <button
                onClick={() => void handleUnequipItem(item.itemId)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
              >
                Снять
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-white text-xl font-bold">Инвентарь</h2>

        <Link
          to={`/items/create?characterId=${character.id}`}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition"
        >
          + Создать предмет
        </Link>
      </div>

      {inventoryItems.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-4 text-gray-400">
          Инвентарь пуст
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventoryItems.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-4 min-w-0">
              <div className="text-white font-semibold flex items-center gap-2 flex-wrap">
                {item.name}

                {isItemEquipped(item.id) && getEquippedSlot(item.id) && (
                  <span className="text-green-400 text-xs">
                    ({slotLabels[getEquippedSlot(item.id)!]})
                  </span>
                )}
              </div>

              <div className="text-gray-400 text-sm mt-1">Тип: {item.type}</div>

              <div className="mt-2 flex flex-col gap-1">
                {item.effects.map((effect, index) => (
                  <div key={index} className="text-green-400 text-sm">
                    {formatItemEffect(effect)}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.allowedSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => void handleEquipItem(item)}
                    className="px-3 py-1 rounded text-sm transition bg-purple-600 hover:bg-purple-700"
                  >
                    Надеть в {slotLabels[slot] || slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}