import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import SectionItem from '@/ui/SectionItem'

type Character = {
  id: number
  account_id: number
  character_name: string
  race: string
  class: string
}

type Combat = {
  id: number
  character_id: number
  current_hp: number
  max_hp: number
  armor_class: number
}

type CharacterWithCombat = Character & Partial<Combat>

const CharacterRandom = () => {
  const [characters, setCharacters] = useState<CharacterWithCombat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data: charData, error: charError } = await supabase.from('characters').select('*')

    if (charError) {
      console.error('Ошибка загрузки персонажей:', charError.message)
      setLoading(false)
      return
    }

    const { data: combatData, error: combatError } = await supabase
      .from('character_combat')
      .select('*')

    if (combatError) {
      console.error('Ошибка загрузки боевых данных:', combatError.message)
      setLoading(false)
      return
    }

    const combined: CharacterWithCombat[] = (charData || []).map(char => {
      const combat = combatData?.find(c => c.character_id === char.id)
      return { ...char, ...combat }
    })

    setCharacters(combined)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    
    const charChannel = supabase
      .channel('characters-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, fetchData)
      .subscribe()

    const combatChannel = supabase
      .channel('combat-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'character_combat' },
        fetchData
      )
      .subscribe()

    return () => {
      supabase.removeChannel(charChannel)
      supabase.removeChannel(combatChannel)
    }
  }, [])

  if (loading) return <p>Загрузка...</p>

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Все персонажи (реалтайм)</h2>
      {characters.length === 0 ? (
        <p>Нет персонажей</p>
      ) : (
        <ul className="space-y-3">
          {characters.map(char => (
            <li
              key={`${char.id}-${char.character_name}-${char.current_hp}-${char.max_hp}`}
              className="border p-3 rounded-md flex flex-col gap-1"
            >
              <SectionItem key={`${char.id}-name`} title="Name:">
                {char.character_name}
              </SectionItem>
              <SectionItem key={`${char.id}-hp`} title="HP:">
                {char.current_hp ?? 0} / {char.max_hp ?? 0}
              </SectionItem>
              <SectionItem key={`${char.id}-armor`} title="Armor:">
                {char.armor_class ?? 0}
              </SectionItem>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CharacterRandom
