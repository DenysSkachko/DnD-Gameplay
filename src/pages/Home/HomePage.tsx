
import { useState } from 'react'
import CharacterCombatSection from './CharacterCombatSection'
import CharacterInventorySection from './CharacterInventorySections'
import CharacterSavingThrowsSection from './CharacterSavingThrowsSection'
import CharacterSection from './CharacterSection'
import CharacterSkillsSection from './CharacterSkillsSection'
import CharacterStatsSection from './CharacterStatsSection'
import CharacterWeaponsSection from './CharacterWeaponsSection'
import CharacterSpellsSection from './CharacterSpellsSection'

const tabs = [
  { name: 'Character', component: <CharacterSection /> },

  { name: 'Stats', component: <CharacterStatsSection /> },
  { name: 'Skills', component: <CharacterSkillsSection /> },
  { name: 'Saving', component: <CharacterSavingThrowsSection /> },
  { name: 'Inventory', component: <CharacterInventorySection /> },
  { name: 'Weapons', component: <CharacterWeaponsSection /> },
  { name: 'Spells', component: <CharacterSpellsSection /> },
  { name: 'Combat', component: <CharacterCombatSection /> },
]

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].name)

  return (
    <div className="min-h-screen p-4 bg-dark">
      {/* Табы */}
      <div className="flex flex-wrap gap-2 mb-4 w-full">
  {tabs.map(tab => (
    <button
      key={tab.name}
      onClick={() => setActiveTab(tab.name)}
      className={`flex-1 min-w-[30%] px-4 py-2 rounded-md font-medium transition-colors text-center
        ${
          activeTab === tab.name
            ? 'bg-white text-black'
            : 'bg-white/20 text-white hover:bg-white/40'
        }`}
    >
      {tab.name}
    </button>
  ))}
</div>

      {/* Контент активной вкладки */}
      <div>
        {tabs.map(
          tab =>
            tab.name === activeTab && (
              <div key={tab.name} className="space-y-6">
                {tab.component}
              </div>
            )
        )}
      </div>
    </div>
  )
}

export default HomePage
