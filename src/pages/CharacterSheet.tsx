import { useParams } from 'react-router-dom'
import { useCharacterStore } from '../stores/characterStore'
import { getModifier } from '../utils/stats'
import { calculateCharacter } from '../utils/calculateCharacter'
import { useItemsStore } from '../stores/itemsStore'
import type { Stats } from '../types/characters'
import { formatItemEffect } from '../utils/itemEffects'
import type { EquipmentSlot } from '../types/items'
import { Link } from 'react-router-dom'
import { calculateSkillBonus } from '../utils/skills'
import { standardSkills } from '../types/characters'
import { calculateSavingThrowBonus } from '../utils/savingThrows'
import { useState } from 'react'

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
} = useCharacterStore()
  const { items } = useItemsStore()
  const character = characters.find((c) => c.id === id)
  const [tempHpInput, setTempHpInput] = useState(0)
  const [hpChangeInput, setHpChangeInput] = useState('')

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

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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