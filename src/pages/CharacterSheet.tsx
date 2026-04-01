import { useParams } from 'react-router-dom'
import { useCharacterStore } from '../stores/characterStore'
import { getModifier } from '../utils/stats'
import { calculateCharacter } from '../utils/calculateCharacter'
import { useItemsStore } from '../stores/itemsStore'
import type { Stats, Attack } from '../types/characters'
import { formatItemEffect } from '../utils/itemEffects'
import type { EquipmentSlot } from '../types/items'
import { Link } from 'react-router-dom'
import { calculateSkillBonus } from '../utils/skills'
import { standardSkills } from '../types/characters'
import { calculateSavingThrowBonus } from '../utils/savingThrows'
import { useState } from 'react'
import { getProficiencyBonus } from '../utils/skills'


export function CharacterSheet() {
  const { id } = useParams()
 const {
  characters,
  equipItem,
  unequipItem,
  toggleSkillProficiency,
  changeCurrentHp,
  setTemporaryHp,
  applyDamage,
  setDeathSaves,
  resetDeathSaves,
  toggleInspiration, 
  addAttack,
  deleteAttack, 
  updateAttack,
} = useCharacterStore()
  const { items } = useItemsStore()
  const character = characters.find((c) => c.id === id)
  const [tempHpInput, setTempHpInput] = useState(0)
  const [hpChangeInput, setHpChangeInput] = useState('')
  const [newAttack, setNewAttack] = useState<Omit<Attack, 'id'>>({
    name: '',
    attackType: 'melee',
    ability: 'strength',
    proficient: true,
    damageDice: '1d6',
    damageBonus: 0,
    damageType: 'slashing',
    notes: '',
    source: 'manual',
  })
  const [editingAttackId, setEditingAttackId] = useState<string | null>(null)

  const [editingAttack, setEditingAttack] = useState<Omit<Attack, 'id'>>({
    name: '',
    attackType: 'melee',
    ability: 'strength',
    proficient: true,
    damageDice: '1d6',
    damageBonus: 0,
    damageType: 'slashing',
    notes: '',
    source: 'manual',
  })

  const handleHpChange = () => {
  const rawValue = hpChangeInput.trim()

  if (!rawValue) return

  if (rawValue.startsWith('+')) {
    const healValue = Number(rawValue.slice(1))

    if (!Number.isNaN(healValue) && healValue > 0) {
      changeCurrentHp(character!.id, healValue)
    }
  } else {
    const damageValue = Math.abs(Number(rawValue))

    if (!Number.isNaN(damageValue) && damageValue > 0) {
      applyDamage(character!.id, damageValue)
    }
  }

  setHpChangeInput('')
}


  if (!character) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Персонаж не найден</h1>
        <p className="text-gray-400 mt-2">Возможно, он был удалён</p>
      </div>
    )
  }
  const { finalStats, finalDerivedStats } = calculateCharacter(
  character,
  items
  )
  const inventoryItems = items.filter((item) =>
  character.inventory.includes(item.id)
  )

  

const equippedEntries = (
  Object.entries(character.equippedItems) as [EquipmentSlot, string | null][]
).map(([slot, itemId]) => {
  const item = items.find((i) => i.id === itemId) || null

  return {
    slot,
    item,
  }
})
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
  const handleEquipItem = (item: typeof items[number], slot: EquipmentSlot) => {
  const currentItemId = character.equippedItems[slot]

  if (currentItemId && currentItemId !== item.id) {
    const confirmReplace = confirm(
      'В этом слоте уже есть предмет. Заменить его?'
    )

    if (!confirmReplace) return
  }

  const currentSlot = Object.entries(character.equippedItems).find(
    ([, id]) => id === item.id
  )?.[0] as EquipmentSlot | undefined

  if (currentSlot) {
    unequipItem(character.id, currentSlot)
  }

  equipItem(character.id, item, slot)
}
  const handleUnequipItem = (slot: EquipmentSlot) => {
  unequipItem(character.id, slot)
  }
  const isItemEquipped = (itemId: string) => {
  return Object.values(character.equippedItems).includes(itemId)
  }
  const getEquippedSlot = (itemId: string): EquipmentSlot | null => {
  const entry = (
    Object.entries(character.equippedItems) as [EquipmentSlot, string | null][]
  ).find(([, equippedItemId]) => equippedItemId === itemId)

  return entry ? entry[0] : null
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
  ? 10 +
    calculateSkillBonus(
      perceptionSkill,
      finalStats,
      character.level
    )
  : 10
    const currentHp = character.currentHp ?? finalDerivedStats.maxHp
    const temporaryHp = character.temporaryHp ?? 0
    const deathSaves = character.deathSaves ?? { successes: 0, failures: 0 }
    const proficiencyBonus = getProficiencyBonus(character.level)
    const inspiration =character.inspiration ?? false
    const speed = character.speed ?? 30
    const hitDice = character.hitDice ?? {
      total: 1,
      used: 0,
      dice: '1d8',
    }
    const attacks = character.attacks ?? []
    
  const renderDeathSaveDots = (
    type: 'successes' | 'failures',
    value: number
  ) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((dot) => (
          <button
            key={dot}
            type="button"
            onClick={() =>
              setDeathSaves(character.id, {
                ...deathSaves,
                [type]: dot,
              })
            }
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
  }
  
  const getAttackBonus = (attack: Attack) => {
  const abilityModifier = getModifier(finalStats[attack.ability])
  return abilityModifier + (attack.proficient ? proficiencyBonus : 0)
}
const handleAddAttack = () => {
  if (!newAttack.name.trim()) return

  addAttack(character.id, {
    id: crypto.randomUUID(),
    ...newAttack,
  })

  setNewAttack({
    name: '',
    attackType: 'melee',
    ability: 'strength',
    proficient: true,
    damageDice: '1d6',
    damageBonus: 0,
    damageType: 'slashing',
    notes: '',
    source: 'manual',
  })
}
const handleStartEditAttack = (attack: Attack) => {
  if (attack.source !== 'manual') return

  setEditingAttackId(attack.id)
  setEditingAttack({
    name: attack.name,
    attackType: attack.attackType,
    ability: attack.ability,
    proficient: attack.proficient,
    damageDice: attack.damageDice,
    damageBonus: attack.damageBonus,
    damageType: attack.damageType,
    notes: attack.notes,
    source: attack.source,
    itemId: attack.itemId,
  })
  } 
  const handleSaveAttackEdit = () => {
  if (!editingAttackId) return
  if (!editingAttack.name.trim()) return

  updateAttack(character.id, editingAttackId, editingAttack)
  setEditingAttackId(null)
}
const handleCancelAttackEdit = () => {
  setEditingAttackId(null)
}



  return (
  <div className="p-6 max-w-6xl mx-auto">
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h1 className="text-3xl font-bold text-white">{character.name}</h1>

      <div className="text-gray-300 mt-2">
        {character.race} • {character.class} уровень {character.level}
      </div>

      {(character.alignment || character.background) && (
        <div className="text-gray-400 mt-2 text-sm">
          {[character.alignment, character.background].filter(Boolean).join(' • ')}
        </div>
      )}

      {character.avatarUrl && (
        <img
          src={character.avatarUrl}
          alt={`${character.name} avatar`}
          className="mt-4 w-32 h-32 object-cover rounded-lg border border-gray-700"
        />
      )}

      {character.description && (
        <p className="text-gray-300 mt-4 whitespace-pre-line">
          {character.description}
        </p>
      )}
    </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    <div className="bg-gray-800 p-4 rounded text-center">
  <div className="text-gray-400 text-sm">Бонус мастерства</div>
  <div className="text-white text-xl font-bold">
    +{proficiencyBonus}
  </div>
</div>

<div className="bg-gray-800 p-4 rounded text-center">
  <div className="text-gray-400 text-sm">Вдохновение</div>
  <div className="text-white text-xl font-bold">
    {inspiration ? 'Есть' : 'Нет'}
  </div>
  <button
    onClick={() => toggleInspiration(character.id)}
    className="mt-3 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition"
  >
    {inspiration ? 'Снять' : 'Выдать'}
  </button>
</div>

<div className="bg-gray-800 p-4 rounded text-center">
  <div className="text-gray-400 text-sm">Скорость</div>
  <div className="text-white text-xl font-bold">
    {speed} фт.
  </div>
</div>

<div className="bg-gray-800 p-4 rounded text-center">
  <div className="text-gray-400 text-sm">Кости хитов</div>
  <div className="text-white text-xl font-bold">
    {hitDice.dice}
  </div>
  <div className="text-gray-300 text-sm mt-1">
    Использовано: {hitDice.used} / {hitDice.total}
  </div>
</div>
</div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
        <div>
          <div className="text-white font-medium">
            {statLabels[stat]}
          </div>
        </div>

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
      onClick={() => toggleSkillProficiency(character.id, skill.name)}
      className={`px-3 py-1 rounded text-sm transition ${
        skill.proficient
          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      }`}
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

<div className="bg-gray-800 rounded-lg p-4 text-center">
  <div className="text-gray-400 text-sm">
    Пассивное восприятие
  </div>
  <div className="text-white text-xl font-bold">
    {passivePerception}
  </div>
</div>

    <h2 className="text-white text-xl font-bold mt-8 mb-4">
      Производные характеристики
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-800 p-4 rounded text-center">
  <div className="text-gray-400 text-sm">Хиты</div>
  <div className="text-white text-xl font-bold">
    {currentHp} / {finalDerivedStats.maxHp}
  </div>

  {temporaryHp > 0 && (
    <div className="text-cyan-400 text-sm mt-1">
      Временные хиты: {temporaryHp}
    </div>
  )}
</div>
<div className="mt-3 flex items-center gap-2 justify-center">
  <input
  type="text"
  value={hpChangeInput}
  onChange={(e) => setHpChangeInput(e.target.value)}
  placeholder="+5 лечение / 5 урон"
  className="w-24 bg-gray-700 text-white rounded p-1 text-center"
/>

<button
  onClick={handleHpChange}
  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition"
>
  Применить
</button>
</div>


<div className="mt-3 flex items-center gap-2 justify-center">
  <input
    type="number"
    value={tempHpInput}
    onChange={(e) => setTempHpInput(Number(e.target.value))}
    className="w-20 bg-gray-700 text-white rounded p-1 text-center"
    min="0"
  />
  <button
    onClick={() => setTemporaryHp(character.id, tempHpInput)}
    className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm transition"
  >
    Временные
  </button>
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
      onClick={() => resetDeathSaves(character.id)}
      className="mt-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition"
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

    <h2 className="text-white text-xl font-bold mt-8 mb-4">Атаки</h2>
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
    <input
      type="text"
      value={newAttack.name}
      onChange={(e) =>
        setNewAttack({ ...newAttack, name: e.target.value })
      }
      placeholder="Название атаки"
      className="bg-gray-700 text-white rounded p-2"
    />

    <select
      value={newAttack.attackType}
      onChange={(e) =>
        setNewAttack({
          ...newAttack,
          attackType: e.target.value as Attack['attackType'],
        })
      }
      className="bg-gray-700 text-white rounded p-2"
    >
      <option value="melee">Ближняя</option>
      <option value="ranged">Дальняя</option>
      <option value="spell">Заклинание</option>
    </select>

    <select
      value={newAttack.ability}
      onChange={(e) =>
        setNewAttack({
          ...newAttack,
          ability: e.target.value as keyof Stats,
        })
      }
      className="bg-gray-700 text-white rounded p-2"
    >
      <option value="strength">Сила</option>
      <option value="dexterity">Ловкость</option>
      <option value="constitution">Телосложение</option>
      <option value="intelligence">Интеллект</option>
      <option value="wisdom">Мудрость</option>
      <option value="charisma">Харизма</option>
    </select>

    <input
      type="text"
      value={newAttack.damageDice}
      onChange={(e) =>
        setNewAttack({ ...newAttack, damageDice: e.target.value })
      }
      placeholder="Урон, например 1d8"
      className="bg-gray-700 text-white rounded p-2"
    />

    <input
      type="number"
      value={newAttack.damageBonus}
      onChange={(e) =>
        setNewAttack({
          ...newAttack,
          damageBonus: Number(e.target.value),
        })
      }
      placeholder="Бонус урона"
      className="bg-gray-700 text-white rounded p-2"
    />

    <input
      type="text"
      value={newAttack.damageType}
      onChange={(e) =>
        setNewAttack({ ...newAttack, damageType: e.target.value })
      }
      placeholder="Тип урона"
      className="bg-gray-700 text-white rounded p-2"
    />
    <label className="flex items-center gap-2 text-white">
      <input
        type="checkbox"
        checked={newAttack.proficient}
        onChange={(e) =>
          setNewAttack({
            ...newAttack,
            proficient: e.target.checked,
          })
        }
      />
      Владение
    </label>

    <button
      type="button"
      onClick={handleAddAttack}
      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
    >
      Добавить атаку
    </button>
  </div>

  <textarea
    value={newAttack.notes}
    onChange={(e) =>
      setNewAttack({ ...newAttack, notes: e.target.value })
    }
    placeholder="Заметки к атаке"
    className="mt-3 w-full bg-gray-700 text-white rounded p-2"
    rows={2}
  />
</div>
{attacks.length === 0 ? (
  <div className="bg-gray-800 rounded-lg p-4 text-gray-400">
    Атак пока нет
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    {attacks.map((attack) => {
      const attackBonus = getAttackBonus(attack)

      if (editingAttackId === attack.id && attack.source === 'manual') {
  return (
    <div
      key={attack.id}
      className="bg-gray-800 rounded-lg p-4 space-y-3"
    >
      <input
        type="text"
        value={editingAttack.name}
        onChange={(e) =>
          setEditingAttack({ ...editingAttack, name: e.target.value })
        }
        placeholder="Название атаки"
        className="w-full bg-gray-700 text-white rounded p-2"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          value={editingAttack.attackType}
          onChange={(e) =>
            setEditingAttack({
              ...editingAttack,
              attackType: e.target.value as Attack['attackType'],
            })
          }
          className="bg-gray-700 text-white rounded p-2"
        >
          <option value="melee">Ближняя</option>
          <option value="ranged">Дальняя</option>
          <option value="spell">Заклинание</option>
        </select>

        <select
          value={editingAttack.ability}
          onChange={(e) =>
            setEditingAttack({
              ...editingAttack,
              ability: e.target.value as keyof Stats,
            })
          }
          className="bg-gray-700 text-white rounded p-2"
        >
          <option value="strength">Сила</option>
          <option value="dexterity">Ловкость</option>
          <option value="constitution">Телосложение</option>
          <option value="intelligence">Интеллект</option>
          <option value="wisdom">Мудрость</option>
          <option value="charisma">Харизма</option>
        </select>

        <input
          type="text"
          value={editingAttack.damageDice}
          onChange={(e) =>
            setEditingAttack({
              ...editingAttack,
              damageDice: e.target.value,
            })
          }
          placeholder="Кубик урона"
          className="bg-gray-700 text-white rounded p-2"
        />

        <input
          type="number"
          value={editingAttack.damageBonus}
          onChange={(e) =>
            setEditingAttack({
              ...editingAttack,
              damageBonus: Number(e.target.value),
            })
          }
          placeholder="Бонус урона"
          className="bg-gray-700 text-white rounded p-2"
        />

        <input
          type="text"
          value={editingAttack.damageType}
          onChange={(e) =>
            setEditingAttack({
              ...editingAttack,
              damageType: e.target.value,
            })
          }
          placeholder="Тип урона"
          className="bg-gray-700 text-white rounded p-2"
        />

        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={editingAttack.proficient}
            onChange={(e) =>
              setEditingAttack({
                ...editingAttack,
                proficient: e.target.checked,
              })
            }
          />
          Владение
        </label>
      </div>

      <textarea
        value={editingAttack.notes}
        onChange={(e) =>
          setEditingAttack({
            ...editingAttack,
            notes: e.target.value,
          })
        }
        placeholder="Заметки"
        className="w-full bg-gray-700 text-white rounded p-2"
        rows={2}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSaveAttackEdit}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition"
        >
          Сохранить
        </button>

        <button
          type="button"
          onClick={handleCancelAttackEdit}
          className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition"
        >
          Отмена
        </button>
      </div>
    </div>
  )
}

      return (
        <div
          key={attack.id}
          className="bg-gray-800 rounded-lg p-4 flex justify-between gap-4"
        >
          <div>
            <div className="text-white font-semibold text-lg">
              {attack.name}
            </div>

            <div className="text-gray-400 text-sm mt-1">
              Тип: {attack.attackType}
            </div>

            <div className="text-gray-300 mt-2">
              Попадание:{' '}
              <span className="text-green-400 font-bold">
                {attackBonus >= 0 ? `+${attackBonus}` : attackBonus}
              </span>
            </div>

            <div className="text-gray-300">
              Урон:{' '}
              <span className="text-white">
                {attack.damageDice}
                {attack.damageBonus !== 0
                  ? attack.damageBonus > 0
                    ? ` + ${attack.damageBonus}`
                    : ` - ${Math.abs(attack.damageBonus)}`
                  : ''}
              </span>{' '}
              ({attack.damageType})
            </div>

            <div className="text-gray-400 text-sm">
              Характеристика: {statLabels[attack.ability]}
            </div>

            {attack.proficient && (
              <div className="text-yellow-400 text-sm mt-1">
                Владение
              </div>
            )}

            {attack.notes && (
              <div className="text-gray-400 text-sm mt-2 whitespace-pre-line">
                {attack.notes}
              </div>
            )}
          </div>

          {attack.source === 'item' && (
      <div className="text-cyan-400 text-sm mt-1">
        От оружия
      </div>
    )}
<div className="flex flex-col gap-2">
  {attack.source === 'manual' ? (
    <>
      <button
        type="button"
        onClick={() => handleStartEditAttack(attack)}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
      >
        Редактировать
      </button>

      <button
        type="button"
        onClick={() => deleteAttack(character.id, attack.id)}
        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
      >
        Удалить
      </button>
    </>
  ) : (
    <div className="text-xs text-gray-400">
      Снимите оружие
    </div>
  )}
</div>
        </div>
      )
    })}
  </div>
)}

    <h2 className="text-white text-xl font-bold mt-8 mb-4">Экипировка</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {equippedEntries.map(({ slot, item }) => (
        <div
          key={slot}
          className="bg-gray-800 rounded-lg p-4 flex justify-between items-center gap-4"
        >
          <div>
            <div className="text-gray-400 text-sm">{slotLabels[slot] || slot}</div>

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
              onClick={() => handleUnequipItem(slot)}
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
                  onClick={() => handleEquipItem(item, slot)}
                  disabled={isItemEquipped(item.id)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    isItemEquipped(item.id)
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
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