import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getModifier } from '../utils/stats'
import { calculateCharacter } from '../utils/calculateCharacter'
import { useItemsStore } from '../stores/itemsStore'
import type { Stats, NewAttack, Character } from '../types/characters'
import { formatItemEffect } from '../utils/itemEffects'
import type { EquipmentSlot } from '../types/items'
import { Link } from 'react-router-dom'
import { calculateSkillBonus } from '../utils/skills'
import { standardSkills } from '../types/characters'
import { calculateSavingThrowBonus } from '../utils/savingThrows'
import { getProficiencyBonus } from '../utils/skills'
import { AttackSection } from '../components/AttackSection'
import { SpellSection } from '../components/SpellSection'
import type { NewSpell } from '../types/characters'
import { ProfileSection } from '../components/ProfileSection'

const API_URL = 'http://localhost:3000'

const defaultStats: Stats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

type ServerCharacter = Partial<Character> & {
  id: string
}

export function CharacterSheet() {
  const { id } = useParams()
  const { items } = useItemsStore()

  const [character, setCharacter] = useState<Character | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [tempHpInput, setTempHpInput] = useState(0)
  const [hpChangeInput, setHpChangeInput] = useState('')

  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) {
        setCharacter(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/characters/${id}`)

        if (!response.ok) {
          throw new Error(`Ошибка загрузки персонажа: ${response.status}`)
        }

        const data = (await response.json()) as ServerCharacter

        const safeCharacter: Character = {
          id: data.id,
          name: data.name ?? 'Без имени',
          race: data.race ?? '',
          class: (data as Partial<Character>).class ?? '',
          level: data.level ?? 1,
          description: data.description ?? '',
          alignment: data.alignment ?? '',
          background: data.background ?? '',
          avatarUrl: data.avatarUrl ?? '',
          baseStats: data.baseStats ?? defaultStats,
          currentHp: data.currentHp ?? 0,
          temporaryHp: data.temporaryHp ?? 0,
          speed: data.speed ?? 30,
          inspiration: data.inspiration ?? false,
          inventory: data.inventory ?? [],
          equippedItems: data.equippedItems ?? {
            mainHand: null,
            offHand: null,
            head: null,
            body: null,
            ring1: null,
            ring2: null,
            amulet: null,
            boots: null,
          },
          skills: data.skills ?? standardSkills,
          savingThrowProficiencies: data.savingThrowProficiencies ?? [],
          attacks: data.attacks ?? [],
          spells: data.spells ?? [],
          spellSlots: data.spellSlots ?? [],
          spellcastingAbility: data.spellcastingAbility ?? 'intelligence',
          deathSaves: data.deathSaves ?? { successes: 0, failures: 0 },
          //hitDice: data.hitDice ?? { used: 0 },
          hitDice: data.hitDice ?? {
            total: data.level ?? 1,
            used: 0,
            dice: `${data.level ?? 1}d8`,
          },

          derivedStats: data.derivedStats ?? {
            armorClass: 10,
            initiative: 0,
            maxHp: data.currentHp ?? 0,
          },
          createdAt: data.createdAt ?? new Date().toISOString(),
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        }

        setCharacter(safeCharacter)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Не удалось загрузить персонажа'
        )
        setCharacter(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadCharacter()
  }, [id])

  const handleAddSpell = (_spell: NewSpell) => {}

  const handleDeleteSpell = (_spellId: string) => {}

  const handleUpdateSpell = (
    _spellId: string,
    _spell: Partial<NewSpell>
  ) => {}

  const handleSetSpellcastingAbility = (_ability: keyof Stats) => {}

  const handleSetSpellSlotsTotal = (_level: number, _total: number) => {}

  const handleChangeSpellSlot = (_level: number, _delta: number) => {}

  const handleUpdateProfile = (_updates: Partial<Character>) => {}

  const handleHpChange = () => {
    setHpChangeInput('')
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Загрузка персонажа...</h1>
      </div>
    )
  }

  if (error) {
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

  const { finalStats, finalDerivedStats } = calculateCharacter(character, items)

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

  const handleEquipItem = (_item: typeof items[number], _slot: EquipmentSlot) => {}

  const handleUnequipItem = (_slot: EquipmentSlot) => {}

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
    ? 10 + calculateSkillBonus(perceptionSkill, finalStats, character.level)
    : 10

  const currentHp = character.currentHp ?? finalDerivedStats.maxHp
  const temporaryHp = character.temporaryHp ?? 0
  const deathSaves = character.deathSaves ?? { successes: 0, failures: 0 }
  const proficiencyBonus = getProficiencyBonus(character.level)
  const inspiration = character.inspiration ?? false
  const speed = character.speed ?? 30
  const hitDice = {
    total: character.level,
    used: character.hitDice?.used ?? 0,
    dice: `${character.level}d8`,
  }

  const spells = character.spells ?? []
  const spellcastingAbility = character.spellcastingAbility ?? 'intelligence'
  const spellcastingModifier = getModifier(finalStats[spellcastingAbility])
  const spellAttackBonus = spellcastingModifier + proficiencyBonus
  const spellSaveDc = 8 + spellcastingModifier + proficiencyBonus
  const spellSlots = character.spellSlots

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

  const handleAddAttack = (_attack: NewAttack) => {}

  const handleDeleteAttack = (_attackId: string) => {}

  const handleUpdateAttack = (
    _attackId: string,
    _attack: Partial<NewAttack>
  ) => {}

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ProfileSection
        character={character}
        onUpdateCharacter={handleUpdateProfile}
      />

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
            className="mt-3 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition opacity-60 cursor-not-allowed"
            disabled
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
                  className={`px-3 py-1 rounded text-sm transition opacity-60 cursor-not-allowed ${
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
              onClick={handleHpChange}
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
              className="bg-cyan-600 hover:bg-cyan-700 px-3 py-2 rounded-lg text-sm transition opacity-60 cursor-not-allowed"
              disabled
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
              className="mt-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition opacity-60 cursor-not-allowed"
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

      {character && (
        <AttackSection
          attacks={character.attacks}
          proficiencyBonus={proficiencyBonus}
          finalStats={finalStats}
          onAddAttack={handleAddAttack}
          onDeleteAttack={handleDeleteAttack}
          onUpdateAttack={handleUpdateAttack}
        />
      )}

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
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition opacity-60 cursor-not-allowed"
                disabled
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
                    disabled
                    className="px-3 py-1 rounded text-sm transition bg-gray-600 cursor-not-allowed"
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