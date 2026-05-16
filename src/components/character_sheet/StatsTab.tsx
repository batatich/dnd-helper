import type { ReactNode } from 'react'
import type { Stats } from '../../types/characters'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

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

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-white text-xl font-bold">
      {children}
    </h2>
  )
}
function StatInfoCard({
  label,
  value,
  children,
}: {
  label: string
  value: string | number
  children?: ReactNode
}) {
  return (
    <Card className="text-center">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-white text-xl font-bold">{value}</div>
      {children}
    </Card>
  )
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
            <Card>
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
                    <Button
                        type="button"
                        onClick={() => void handleLevelUpFixed()}
                        disabled={isLoading}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + уровень: фикс +5 HP
                    </Button>
      
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleLevelUpRoll()}
                        disabled={isLoading}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + уровень: бросить 1d8
                    </Button>
                  </div>
                </div>
              </Card>
      
              <SectionTitle>Основные параметры</SectionTitle>
      
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatInfoCard
                    label="Бонус мастерства"
                    value={`+${proficiencyBonus}`}
                />
      
                <Card className="text-center">
                  <div className="text-gray-400 text-sm">Вдохновение</div>
                  <div className="text-white text-xl font-bold">
                    {inspiration ? 'Есть' : 'Нет'}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleSetInspiration(!inspiration)}
                    disabled={isLoading}
                    className="mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inspiration ? 'Снять' : 'Выдать'}
                  </Button>
                </Card>
      
                <StatInfoCard
                    label="Скорость"
                    value={`${speed} фт.`}
                />
      
                <Card className="text-center">
                  <div className="text-gray-400 text-sm">Кости хитов</div>
      
                  <div className="text-white text-xl font-bold">{hitDice.dice}</div>
      
                  <div className="text-gray-300 text-sm mt-1">
                    Использовано: {hitDice.used} / {hitDice.total}
                  </div>
      
                  <div className="mt-3 flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleUseHitDie()}
                        disabled={isLoading || hitDice.used >= hitDice.total}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Использовать
                    </Button>
      
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleRestoreHitDie()}
                        disabled={isLoading || hitDice.used <= 0}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Восстановить
                    </Button>
                  </div>
                </Card>
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
      
              <SectionTitle>Спасброски</SectionTitle>
      
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
      
              <SectionTitle>Навыки</SectionTitle>
      
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
      
            <Card className="text-center">
                <div className="text-gray-400 text-sm">Пассивное восприятие</div>
                <div className="text-white text-xl font-bold">{passivePerception}</div>
            </Card>
      
                <SectionTitle>Боевые параметры</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="text-center">
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
            
                        <Button
                            type="button"
                            onClick={() => void handleHpChange()}
                            disabled={isLoading}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Применить
                        </Button>
                    </div>
      
                    <div className="mt-3 flex items-center gap-2 justify-center">
                        <input
                            type="number"
                            value={tempHpInput}
                            onChange={(e) => setTempHpInput(Number(e.target.value))}
                            className="w-24 bg-gray-700 text-white rounded-lg p-2 text-center"
                            min="0"
                        />
            
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void handleSetTempHp()}
                            disabled={isLoading}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Временные
                        </Button>
                    </div>
              </Card>
      
              <div className="bg-gray-800 p-4 rounded text-center">
                <div className="text-gray-400 text-sm mb-3">Спасброски от смерти</div>
      
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-green-400">Успехи</span>
                    {renderDeathSaveDots('successes', deathSaves.successes)}
      
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleAddDeathSaveSuccess()}
                        disabled={isLoading || deathSaves.successes >= 3}
                        className="mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + успех
                    </Button>
                  </div>
      
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-red-400">Провалы</span>
                    {renderDeathSaveDots('failures', deathSaves.failures)}
      
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleAddDeathSaveFailure()}
                        disabled={isLoading || deathSaves.failures >= 3}
                        className="mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + провал
                    </Button>
                  </div>
      
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleResetDeathSaves()}
                        disabled={
                            isLoading ||
                            (deathSaves.successes === 0 && deathSaves.failures === 0)
                        }
                        className="mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Сбросить
                    пш</Button>
                </div>
              </div>
      
            <StatInfoCard
                label="Класс брони"
                value={finalDerivedStats.armorClass}
            />
      
            <StatInfoCard
                label="Инициатива"
                value={
                    finalDerivedStats.initiative >= 0
                    ? `+${finalDerivedStats.initiative}`
                    : finalDerivedStats.initiative
                }
            />
        </div>
    </div>
  )
}