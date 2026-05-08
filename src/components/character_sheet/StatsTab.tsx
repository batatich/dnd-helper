import type { ReactNode } from 'react'
import type { Stats } from '../../types/characters'

type HitDice = {
  total: number
  used: number
  dice: string
}

type DeathSaves = {
  successes: number
  failures: number
}

type DerivedStats = {
  maxHp: number
  armorClass: number
  initiative: number
}

type SavingThrowView = {
  ability: keyof Stats
  label: string
  proficient: boolean
  bonus: number
}

type SkillView = {
  name: string
  ability: keyof Stats
  proficient: boolean
  bonus: number
}

type Props = {
  level: number
  isLoading: boolean

  proficiencyBonus: number
  inspiration: boolean
  speed: number
  hitDice: HitDice

  baseStats: Stats
  finalStats: Stats
  statModifiers: Stats

  currentHp: number
  temporaryHp: number
  finalDerivedStats: DerivedStats
  deathSaves: DeathSaves

  hpChangeInput: string
  tempHpInput: number

  savingThrowsToDisplay: SavingThrowView[]
  skillsToDisplay: SkillView[]
  passivePerception: number

  statLabels: Record<keyof Stats, string>
  statLabelsUppercase: Record<keyof Stats, string>

  setHpChangeInput: (value: string) => void
  setTempHpInput: (value: number) => void

  handleLevelUpFixed: () => Promise<void>
  handleLevelUpRoll: () => Promise<void>
  handleSetInspiration: (nextInspiration: boolean) => Promise<void>
  handleUseHitDie: () => Promise<void>
  handleRestoreHitDie: () => Promise<void>
  handleHpChange: () => Promise<void>
  handleSetTempHp: () => Promise<void>
  handleAddDeathSaveSuccess: () => Promise<void>
  handleAddDeathSaveFailure: () => Promise<void>
  handleResetDeathSaves: () => Promise<void>
  renderDeathSaveDots: (
    type: 'successes' | 'failures',
    count: number
  ) => ReactNode
}

export function StatsTab({
  level,
  isLoading,
  proficiencyBonus,
  inspiration,
  speed,
  hitDice,
  baseStats,
  finalStats,
  statModifiers,
  currentHp,
  temporaryHp,
  finalDerivedStats,
  deathSaves,
  hpChangeInput,
  tempHpInput,
  savingThrowsToDisplay,
  skillsToDisplay,
  passivePerception,
  statLabels,
  statLabelsUppercase,
  setHpChangeInput,
  setTempHpInput,
  handleLevelUpFixed,
  handleLevelUpRoll,
  handleSetInspiration,
  handleUseHitDie,
  handleRestoreHitDie,
  handleHpChange,
  handleSetTempHp,
  handleAddDeathSaveSuccess,
  handleAddDeathSaveFailure,
  handleResetDeathSaves,
  renderDeathSaveDots,
}: Props) {
  return (
    <div className="mt-6 space-y-6">
              <div className="bg-gray-800 rounded-lg p-4 mt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-white text-lg font-bold">Повышение уровня</h2>
      
                    <p className="text-gray-400 text-sm mt-1">
                      Текущий уровень: {level}. Выберите способ увеличения HP.
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
      
              <h2 className="text-white text-xl font-bold mt-8 mb-4">
                Основные параметры
              </h2>
      
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    type="button"
                    onClick={() => void handleSetInspiration(!inspiration)}
                    disabled={isLoading}
                    className="mt-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition"
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
                        <div className="text-gray-400 text-sm">
                          {statLabelsUppercase[key]}
                        </div>
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
              Боевые параметры
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
                    type="button"
                    onClick={() => void handleHpChange()}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm transition"
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
                    type="button"
                    onClick={() => void handleSetTempHp()}
                    disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm transition"
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
    </div>
  )
}