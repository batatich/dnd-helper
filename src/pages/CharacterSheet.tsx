import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AttackSection } from '../components/AttackSection'
import { ProfileSection } from '../components/ProfileSection'
import { SpellSection } from '../components/SpellSection'

import { CharacterHeader } from '../components/character_sheet/CharacterHeader'
import { CharacterSummaryBar } from '../components/character_sheet/CharacterSummaryBar'

import { useCharacterStore } from '../stores/characterStore'
import { useCharacterSheetStore } from '../stores/characterSheetStore'

import type { Character, NewAttack, NewSpell, Stats } from '../types/characters'
import type { EquipmentSlot, ItemEffect } from '../types/items'

import { formatItemEffect } from '../utils/itemEffects'

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

export function CharacterSheet() {
  const { id } = useParams()

  const {
    currentSheet,
    isLoading: isSheetLoading,
    error: sheetError,
    fetchCharacterSheet,
    clearCurrentSheet,
    refreshCurrentSheet,
  } = useCharacterSheetStore()

  const {
    isLoading: isActionLoading,
    updateCharacter,
    updateCharacterStats,
    damageCharacter,
    healCharacter,
    setTemporaryHp,
    useHitDie,
    restoreHitDie,
    setCharacterInspiration,
    addDeathSaveSuccess,
    addDeathSaveFailure,
    resetDeathSaves,
    addAttack,
    updateAttack,
    deleteAttack,
    addSpell,
    updateSpell,
    deleteSpell,
    updateSpellcastingAbility,
    setSpellSlotTotal,
    useSpellSlot,
    restoreSpellSlot,
    equipItem,
    unequipItem,
    levelUpCharacter,
  } = useCharacterStore()

  const [tempHpInput, setTempHpInput] = useState(0)
  const [hpChangeInput, setHpChangeInput] = useState('')

  useEffect(() => {
    if (!id) return

    void fetchCharacterSheet(id)

    return () => {
      clearCurrentSheet()
    }
  }, [id, fetchCharacterSheet, clearCurrentSheet])

  const sheet = currentSheet

  const handleUpdateProfile = async (updates: Partial<Character>) => {
    if (!sheet) return

    const character = sheet.character

    await updateCharacter(character.id, {
      name: updates.name?.trim() || character.name,
      race: updates.race?.trim() || character.race,
      class: updates.class?.trim() || character.className,

      level: updates.level,

      description: updates.description ?? character.description ?? '',
      alignment: updates.alignment ?? character.alignment ?? '',
      background: updates.background ?? character.background ?? '',
      avatarUrl: updates.avatarUrl ?? character.avatarUrl ?? '',

      currentHp: updates.currentHp ?? character.currentHp,
      temporaryHp: updates.temporaryHp ?? character.temporaryHp,
      speed: updates.speed ?? character.speed,
      inspiration: updates.inspiration ?? character.inspiration,
      spellcastingAbility:
        updates.spellcastingAbility ??
        sheet.magic.spellcastingAbility ??
        'intelligence',
    })

    await refreshCurrentSheet()
  }

  const handleUpdateStats = async (stats: Stats) => {
    if (!sheet) return

    await updateCharacterStats(sheet.character.id, stats)
    await refreshCurrentSheet()
  }

  const handleHpChange = async () => {
    if (!sheet) return

    const value = hpChangeInput.trim()

    if (!value) return

    const isHeal = value.startsWith('+')
    const amount = Number(isHeal ? value.slice(1) : value)

    if (!Number.isFinite(amount) || amount <= 0) {
      return
    }

    if (isHeal) {
      await healCharacter(sheet.character.id, amount)
    } else {
      await damageCharacter(sheet.character.id, amount)
    }

    await refreshCurrentSheet()
    setHpChangeInput('')
  }

  const handleSetTempHp = async () => {
    if (!sheet) return

    if (!Number.isFinite(tempHpInput) || tempHpInput < 0) {
      return
    }

    await setTemporaryHp(sheet.character.id, tempHpInput)
    await refreshCurrentSheet()
  }

  const handleUseHitDie = async () => {
    if (!sheet) return

    await useHitDie(sheet.character.id)
    await refreshCurrentSheet()
  }

  const handleRestoreHitDie = async () => {
    if (!sheet) return

    await restoreHitDie(sheet.character.id)
    await refreshCurrentSheet()
  }

  const handleSetInspiration = async (nextInspiration: boolean) => {
    if (!sheet) return

    await setCharacterInspiration(sheet.character.id, nextInspiration)
    await refreshCurrentSheet()
  }

  const handleAddDeathSaveSuccess = async () => {
    if (!sheet) return

    await addDeathSaveSuccess(sheet.character.id)
    await refreshCurrentSheet()
  }

  const handleAddDeathSaveFailure = async () => {
    if (!sheet) return

    await addDeathSaveFailure(sheet.character.id)
    await refreshCurrentSheet()
  }

  const handleResetDeathSaves = async () => {
    if (!sheet) return

    await resetDeathSaves(sheet.character.id)
    await refreshCurrentSheet()
  }

  const handleLevelUpFixed = async () => {
    if (!sheet) return

    await levelUpCharacter(sheet.character.id, 'fixed')
    await refreshCurrentSheet()
  }

  const handleLevelUpRoll = async () => {
    if (!sheet) return

    await levelUpCharacter(sheet.character.id, 'roll')
    await refreshCurrentSheet()
  }

  const handleAddAttack = async (attack: NewAttack) => {
    if (!sheet) return

    await addAttack(sheet.character.id, attack)
    await refreshCurrentSheet()
  }

  const handleUpdateAttack = async (
    attackId: string,
    attack: Partial<NewAttack>
  ) => {
    if (!sheet) return

    await updateAttack(sheet.character.id, attackId, attack)
    await refreshCurrentSheet()
  }

  const handleDeleteAttack = async (attackId: string) => {
    if (!sheet) return

    await deleteAttack(sheet.character.id, attackId)
    await refreshCurrentSheet()
  }

  const handleAddSpell = async (spell: NewSpell) => {
    if (!sheet) return

    await addSpell(sheet.character.id, spell)
    await refreshCurrentSheet()
  }

  const handleUpdateSpell = async (spellId: string, spell: Partial<NewSpell>) => {
    if (!sheet) return

    await updateSpell(sheet.character.id, spellId, spell)
    await refreshCurrentSheet()
  }

  const handleDeleteSpell = async (spellId: string) => {
    if (!sheet) return

    await deleteSpell(sheet.character.id, spellId)
    await refreshCurrentSheet()
  }

  const handleSetSpellcastingAbility = async (ability: keyof Stats) => {
    if (!sheet) return

    await updateSpellcastingAbility(sheet.character.id, ability)
    await refreshCurrentSheet()
  }

  const handleSetSpellSlotsTotal = async (level: number, total: number) => {
    if (!sheet) return

    await setSpellSlotTotal(sheet.character.id, level, total)
    await refreshCurrentSheet()
  }

  const handleChangeSpellSlot = async (level: number, delta: number) => {
    if (!sheet) return

    if (delta > 0) {
      await useSpellSlot(sheet.character.id, level)
    }

    if (delta < 0) {
      await restoreSpellSlot(sheet.character.id, level)
    }

    await refreshCurrentSheet()
  }

  const handleEquipItem = async (item: InventoryItemForUi) => {
    if (!sheet) return

    await equipItem(sheet.character.id, item.itemId)
    await refreshCurrentSheet()
  }

  const handleUnequipItem = async (itemId: string) => {
    if (!sheet) return

    await unequipItem(sheet.character.id, itemId)
    await refreshCurrentSheet()
  }

  if (isSheetLoading && !sheet) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Загрузка персонажа...</h1>
      </div>
    )
  }

  if (sheetError && !sheet) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Ошибка загрузки</h1>
        <p className="text-red-400 mt-2">{sheetError}</p>
      </div>
    )
  }

  if (!sheet) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Персонаж не найден</h1>
        <p className="text-gray-400 mt-2">Возможно, он был удалён</p>
      </div>
    )
  }

  const isLoading = isSheetLoading || isActionLoading

  const character = sheet.character
  const derived = sheet.derived

  const baseStats: Stats = {
    strength: Number(sheet.stats.base?.strength ?? defaultStats.strength),
    dexterity: Number(sheet.stats.base?.dexterity ?? defaultStats.dexterity),
    constitution: Number(
      sheet.stats.base?.constitution ?? defaultStats.constitution
    ),
    intelligence: Number(
      sheet.stats.base?.intelligence ?? defaultStats.intelligence
    ),
    wisdom: Number(sheet.stats.base?.wisdom ?? defaultStats.wisdom),
    charisma: Number(sheet.stats.base?.charisma ?? defaultStats.charisma),
  }

  const finalStats: Stats = {
    strength: Number(sheet.stats.final?.strength ?? baseStats.strength),
    dexterity: Number(sheet.stats.final?.dexterity ?? baseStats.dexterity),
    constitution: Number(
      sheet.stats.final?.constitution ?? baseStats.constitution
    ),
    intelligence: Number(
      sheet.stats.final?.intelligence ?? baseStats.intelligence
    ),
    wisdom: Number(sheet.stats.final?.wisdom ?? baseStats.wisdom),
    charisma: Number(sheet.stats.final?.charisma ?? baseStats.charisma),
  }

  const statModifiers: Stats = {
    strength: Number(sheet.stats.modifiers.strength),
    dexterity: Number(sheet.stats.modifiers.dexterity),
    constitution: Number(sheet.stats.modifiers.constitution),
    intelligence: Number(sheet.stats.modifiers.intelligence),
    wisdom: Number(sheet.stats.modifiers.wisdom),
    charisma: Number(sheet.stats.modifiers.charisma),
  }

  const finalDerivedStats = {
    armorClass: Number(derived.armorClass ?? 10),
    initiative: Number(derived.initiative ?? statModifiers.dexterity),
    maxHp: Number(derived.maxHp ?? character.currentHp ?? 0),
  }

  const skillsToDisplay = sheet.skills ?? []
  const savingThrowsToDisplay = sheet.savingThrows ?? []

  const profileSkills = skillsToDisplay.map((skill) => ({
    name: skill.name,
    attribute: skill.ability,
    proficient: skill.proficient,
  }))

  const savingThrowProficiencies = savingThrowsToDisplay
    .filter((savingThrow) => savingThrow.proficient)
    .map((savingThrow) => savingThrow.ability)

  const deathSaves = sheet.deathSaves ?? {
    successes: 0,
    failures: 0,
  }

  const profileCharacter = {
    id: character.id,
    name: character.name ?? '',
    race: character.race ?? '',
    class: character.className ?? '',
    level: character.level ?? 1,
    alignment: character.alignment ?? '',
    background: character.background ?? '',
    description: character.description ?? '',
    avatarUrl: character.avatarUrl ?? '',
    currentHp: character.currentHp ?? 0,
    temporaryHp: character.temporaryHp ?? 0,
    speed: character.speed ?? 30,
    inspiration: character.inspiration ?? false,
    baseStats,
    derivedStats: finalDerivedStats,
    attacks: sheet.attacks ?? [],
    spells: sheet.magic.spells ?? [],
    spellSlots: sheet.magic.spellSlots ?? [],
    spellcastingAbility: sheet.magic.spellcastingAbility ?? 'intelligence',
    inventory: sheet.inventory.items ?? [],
    equippedItems: sheet.inventory.equippedItems ?? [],
    hitDice: sheet.progression.hitDice,
    skills: profileSkills,
    savingThrowProficiencies,
    deathSaves,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  } as unknown as Character

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

  const rawInventory = (sheet.inventory.items ?? []) as unknown[]

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
        effects: Array.isArray(template?.effects)
          ? (template.effects as ItemEffect[])
          : [],
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

  const passivePerception = Number(derived.passivePerception ?? 10)
  const currentHp = Number(character.currentHp ?? 0)
  const temporaryHp = Number(character.temporaryHp ?? 0)
  const proficiencyBonus = Number(derived.proficiencyBonus ?? 2)
  const inspiration = character.inspiration ?? false
  const speed = character.speed ?? 30
  const hitDice = sheet.progression.hitDice

  const spells = sheet.magic.spells ?? []
  const spellcastingAbility = sheet.magic.spellcastingAbility ?? 'intelligence'
  const spellAttackBonus = Number(derived.spellAttackBonus ?? 0)
  const spellSaveDc = Number(derived.spellSaveDc ?? 0)
  const spellSlots = sheet.magic.spellSlots ?? []

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
      <CharacterHeader
        character={character}
      />

      <ProfileSection
        character={profileCharacter}
        onUpdateCharacter={handleUpdateProfile}
        onUpdateStats={handleUpdateStats}
        isLoading={isLoading}
      />

      <CharacterSummaryBar
        armorClass={sheet.derived.armorClass}
        initiative={sheet.derived.initiative}
        speed={speed}
        proficiencyBonus={sheet.derived.proficiencyBonus}
        inspiration={inspiration}
        onToggleInspiration={() => handleSetInspiration(!inspiration)}
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
          <div className="text-gray-400 text-sm">Кости хитов</div>

          <div className="text-white text-xl font-bold">{hitDice.dice}</div>

          <div className="text-gray-300 text-sm mt-1">
            Использовано: {hitDice.used} / {hitDice.total}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void handleUseHitDie()}
              disabled={isLoading || hitDice.used >= hitDice.total}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition"
            >
              Использовать
            </button>

            <button
              type="button"
              onClick={() => void handleRestoreHitDie()}
              disabled={isLoading || hitDice.used <= 0}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition"
            >
              Восстановить
            </button>
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

            const mod = statModifiers[key]
            const baseValue = baseStats[key]
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
        {savingThrowsToDisplay.map((savingThrow) => {
          const bonus = savingThrow.bonus
          const isProficient = savingThrow.proficient

          return (
            <div
              key={savingThrow.ability}
              className="bg-gray-800 rounded-lg p-4 flex justify-between items-center"
            >
              <div className="text-white font-medium">{savingThrow.label}</div>

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
          const bonus = skill.bonus

          return (
            <div
              key={skill.name}
              className="bg-gray-800 rounded-lg p-4 flex justify-between items-center gap-4"
            >
              <div>
                <div className="text-white font-medium">{skill.name}</div>
                <div className="text-gray-400 text-sm">
                  Характеристика: {statLabels[skill.ability]}
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

              <button
                type="button"
                onClick={() => void handleAddDeathSaveSuccess()}
                disabled={isLoading || deathSaves.successes >= 3}
                className="mt-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition"
              >
                + успех
              </button>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-red-400">Провалы</span>
              {renderDeathSaveDots('failures', deathSaves.failures)}

              <button
                type="button"
                onClick={() => void handleAddDeathSaveFailure()}
                disabled={isLoading || deathSaves.failures >= 3}
                className="mt-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition"
              >
                + провал
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleResetDeathSaves()}
              disabled={
                isLoading ||
                (deathSaves.successes === 0 && deathSaves.failures === 0)
              }
              className="mt-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition"
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
        attacks={sheet.attacks ?? []}
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