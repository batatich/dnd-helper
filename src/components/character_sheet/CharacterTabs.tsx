type CharacterSheetTab =
  | 'overview'
  | 'stats'
  | 'attacks'
  | 'spells'
  | 'inventory'
  | 'history'

type TabItem = {
  id: CharacterSheetTab
  label: string
}

const tabs: TabItem[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'stats', label: 'Характеристики' },
  { id: 'attacks', label: 'Атаки' },
  { id: 'spells', label: 'Заклинания' },
  { id: 'inventory', label: 'Инвентарь' },
  { id: 'history', label: 'История' },
]

type Props = {
  activeTab: CharacterSheetTab
  onChange: (tab: CharacterSheetTab) => void
}

export function CharacterTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export type { CharacterSheetTab }