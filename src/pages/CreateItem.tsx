import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { EquipmentSlot, ItemType } from '../types/items'
import type { Stats } from '../types/characters'
import { addItem } from '../api/characterApi'

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
  const [searchParams] = useSearchParams()

  // characterId приходит из ссылки:
  // /items/create?characterId=...
  const characterId = searchParams.get('characterId')

  const [name, setName] = useState('')
  const [type, setType] = useState<ItemType>('weapon')
  const [allowedSlots, setAllowedSlots] = useState<EquipmentSlot[]>([])
  const [effectType, setEffectType] = useState<EffectType>('stat')
  const [selectedStat, setSelectedStat] = useState<keyof Stats>('strength')
  const [effectValue, setEffectValue] = useState(1)

  const [weaponAttackType, setWeaponAttackType] = useState<'melee' | 'ranged'>(
    'melee'
  )
  const [weaponAbility, setWeaponAbility] = useState<keyof Stats>('strength')
  const [weaponDamageDice, setWeaponDamageDice] = useState('1d6')
  const [weaponDamageBonus, setWeaponDamageBonus] = useState(0)
  const [weaponDamageType, setWeaponDamageType] = useState('slashing')
  const [weaponNotes, setWeaponNotes] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSlot = (slot: EquipmentSlot) => {
    setAllowedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((currentSlot) => currentSlot !== slot)
        : [...prev, slot]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!characterId) {
      setError('Не найден id персонажа')
      return
    }

    if (!name.trim()) {
      setError('Введите название предмета')
      return
    }

    if (allowedSlots.length === 0) {
      setError('Выберите хотя бы один слот')
      return
    }

    const effects: unknown[] = []

    // Эффекты пока просто отправляем в notes JSON-строкой.
    // Полный effects engine будем подключать позже через ItemTemplate.
    if (effectType === 'stat') {
      effects.push({
        stat: selectedStat,
        value: effectValue,
      })
    }

    if (effectType === 'hp') {
      effects.push({
        hpBonus: effectValue,
      })
    }

    if (effectType === 'ac') {
      effects.push({
        armorClassBonus: effectValue,
      })
    }

    if (effectType === 'initiative') {
      effects.push({
        initiativeBonus: effectValue,
      })
    }

    const notesPayload = {
      type,
      allowedSlots,
      effects,
      weaponConfig:
        type === 'weapon'
          ? {
              attackType: weaponAttackType,
              ability: weaponAbility,
              damageDice: weaponDamageDice,
              damageBonus: weaponDamageBonus,
              damageType: weaponDamageType,
              notes: weaponNotes,
            }
          : undefined,
    }

    try {
      setIsSaving(true)
      setError(null)

      // Главная замена:
      // раньше предмет создавался локально в itemsStore,
      // теперь создаём его через backend.
      await addItem(characterId, {
        nameSnapshot: name.trim(),
        quantity: 1,
        isEquipped: false,
        slot: allowedSlots[0],
        notes: JSON.stringify(notesPayload),
      })

      navigate(`/character/${characterId}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось создать предмет'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Создать предмет</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 text-red-200 p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">
              Название предмета
            </label>
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

          {type === 'weapon' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Тип атаки</label>
                <select
                  value={weaponAttackType}
                  onChange={(e) =>
                    setWeaponAttackType(e.target.value as 'melee' | 'ranged')
                  }
                  className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
                >
                  <option value="melee">Ближняя</option>
                  <option value="ranged">Дальняя</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Характеристика
                </label>
                <select
                  value={weaponAbility}
                  onChange={(e) =>
                    setWeaponAbility(e.target.value as keyof Stats)
                  }
                  className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
                >
                  {Object.entries(statLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Кубик урона</label>
                <input
                  type="text"
                  value={weaponDamageDice}
                  onChange={(e) => setWeaponDamageDice(e.target.value)}
                  className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
                  placeholder="Например: 1d8"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Бонус урона</label>
                <input
                  type="number"
                  value={weaponDamageBonus}
                  onChange={(e) => setWeaponDamageBonus(Number(e.target.value))}
                  className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Тип урона</label>
                <input
                  type="text"
                  value={weaponDamageType}
                  onChange={(e) => setWeaponDamageType(e.target.value)}
                  className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
                  placeholder="Например: slashing"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Заметки к атаке
                </label>
                <textarea
                  value={weaponNotes}
                  onChange={(e) => setWeaponNotes(e.target.value)}
                  className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700"
                  rows={3}
                  placeholder="Например: versatile, thrown, finesse"
                />
              </div>
            </div>
          )}

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
            <label className="block text-gray-300 mb-2">
              Значение эффекта
            </label>
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
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition"
            >
              {isSaving ? 'Создание...' : 'Создать предмет'}
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