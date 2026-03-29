import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useItemsStore } from '../stores/itemsStore'
import type { EquipmentSlot, Item, ItemType } from '../types/items'
import type { Stats } from '../types/characters'
import { useCharacterStore } from '../stores/characterStore'

type EffectType = 'stat' | 'hp' | 'ac' | 'initiative'

const allSlots: EquipmentSlot[] = [
  'mainHand',
  'offHand',
  'head',
  'body',
  'ring1',
  'ring2',
  'amulet',
  'boots',
]

const slotLabels: Record<EquipmentSlot, string> = {
  mainHand: 'Основная рука',
  offHand: 'Вторая рука',
  head: 'Голова',
  body: 'Тело',
  ring1: 'Кольцо 1',
  ring2: 'Кольцо 2',
  amulet: 'Амулет',
  boots: 'Обувь',
}

const statLabels: Record<keyof Stats, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
}

const itemTypes: ItemType[] = [
  'weapon',
  'armor',
  'helmet',
  'ring',
  'amulet',
  'boots',
]

export function CreateItem() {
  const navigate = useNavigate()
  const { addItem } = useItemsStore()
  const { characters, updateCharacter } = useCharacterStore()
  const [searchParams] = useSearchParams()
  const characterId = searchParams.get('characterId')

  const [name, setName] = useState('')
  const [type, setType] = useState<ItemType>('weapon')
  const [allowedSlots, setAllowedSlots] = useState<EquipmentSlot[]>([])
  const [effectType, setEffectType] = useState<EffectType>('stat')
  const [selectedStat, setSelectedStat] = useState<keyof Stats>('strength')
  const [effectValue, setEffectValue] = useState(1)

  const toggleSlot = (slot: EquipmentSlot) => {
    setAllowedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((currentSlot) => currentSlot !== slot)
        : [...prev, slot]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Введите название предмета')
      return
    }

    if (allowedSlots.length === 0) {
      alert('Выберите хотя бы один слот')
      return
    }

    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      type,
      allowedSlots,
      effects: [],
    }

    if (effectType === 'stat') {
      newItem.effects.push({
        stat: selectedStat,
        value: effectValue,
      })
    }

    if (effectType === 'hp') {
      newItem.effects.push({
        hpBonus: effectValue,
      })
    }

    if (effectType === 'ac') {
      newItem.effects.push({
        armorClassBonus: effectValue,
      })
    }

    if (effectType === 'initiative') {
      newItem.effects.push({
        initiativeBonus: effectValue,
      })
    }

    addItem(newItem)

    if (characterId) {
        const character = characters.find((c) => c.id === characterId)

    if (character) {
        updateCharacter(character.id, {
        inventory: [...character.inventory, newItem.id],
        })

    navigate(`/character/${character.id}`)
    return
  }
}

navigate('/characters')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Создать предмет</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Название предмета</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
              placeholder="Например: Ring of Frost"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Тип предмета</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ItemType)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
            >
              {itemTypes.map((itemType) => (
                <option key={itemType} value={itemType}>
                  {itemType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Доступные слоты</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={`rounded-lg p-3 text-sm transition ${
                    allowedSlots.includes(slot)
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-900 text-gray-300 border border-gray-700'
                  }`}
                >
                  {slotLabels[slot]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Тип эффекта</label>
            <select
              value={effectType}
              onChange={(e) => setEffectType(e.target.value as EffectType)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
            >
              <option value="stat">Бонус к характеристике</option>
              <option value="hp">Бонус к HP</option>
              <option value="ac">Бонус к AC</option>
              <option value="initiative">Бонус к инициативе</option>
            </select>
          </div>

          {effectType === 'stat' && (
            <div>
              <label className="block text-gray-300 mb-2">Характеристика</label>
              <select
                value={selectedStat}
                onChange={(e) => setSelectedStat(e.target.value as keyof Stats)}
                className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
              >
                {Object.entries(statLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2">Значение эффекта</label>
            <input
              type="number"
              value={effectValue}
              onChange={(e) => setEffectValue(Number(e.target.value))}
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
              min="1"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Создать предмет
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition"
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}