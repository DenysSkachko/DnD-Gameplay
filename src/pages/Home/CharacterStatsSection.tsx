
import { useState, useEffect } from 'react'
import {
  useCharacterStats,
  useCreateCharacterStats,
  useUpdateCharacterStats,
  type CharacterStat,
} from '@/queries/characterStatsQueries'
import Input from '@/ui/Input'
import FormTitle from '@/ui/FormTitle'
import SectionItem from '@/ui/SectionItem'
import {
  GiStrong,
  GiRunningShoe,
  GiMuscleUp,
  GiBrain,
  GiWisdom,
  GiCharm,
  GiStarFormation,
} from 'react-icons/gi'
import ActionButton from '@/ui/ActionButton'

const FIELD_LABELS: Record<keyof Omit<CharacterStat, 'id' | 'character_id'>, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
  proficiency_bonus: 'Бонус мастерства',
}

const FIELD_ICONS: Partial<
  Record<keyof Omit<CharacterStat, 'id' | 'character_id'>, React.ReactNode>
> = {
  strength: <GiStrong />,
  dexterity: <GiRunningShoe />,
  constitution: <GiMuscleUp />,
  intelligence: <GiBrain />,
  wisdom: <GiWisdom />,
  charisma: <GiCharm />,
  proficiency_bonus: <GiStarFormation />,
}

const CharacterStatsSection = () => {
  const { data: stats, isLoading } = useCharacterStats()
  const createStats = useCreateCharacterStats()
  const updateStats = useUpdateCharacterStats()

  const [editMode, setEditMode] = useState(false)
  const [localStats, setLocalStats] = useState<Omit<CharacterStat, 'id' | 'character_id'> | null>(null)

  useEffect(() => {
    if (stats) {
      const { id, character_id, ...rest } = stats
      setLocalStats(rest)
    }
  }, [stats])

  if (isLoading || !localStats) return <p>Загрузка характеристик...</p>

  const handleChange = (field: keyof typeof localStats, value: number) => {
    setLocalStats(prev => ({ ...prev!, [field]: value }))
  }

  const handleSave = async () => {
    if (!localStats) return
    if (stats) {
      await updateStats.mutateAsync({ id: stats.id, ...localStats })
    } else {
      await createStats.mutateAsync(localStats)
    }
    setEditMode(false)
  }

  const handleCancel = () => {
    if (stats) {
      const { id, character_id, ...rest } = stats
      setLocalStats(rest)
      setEditMode(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex justify-between items-center">
        <FormTitle>Stats</FormTitle>
        {editMode ? (
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleSave} />
            <ActionButton type="cancel" onClick={handleCancel} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      {editMode ? (
        <div className="flex flex-col gap-4 max-w-sm">
          {(Object.keys(localStats) as (keyof typeof localStats)[]).map(field => (
            <Input
              key={field}
              label={FIELD_LABELS[field]}
              type="number"
              value={localStats[field]}
              onChange={e => handleChange(field, Number(e.target.value))}
              placeholder={FIELD_LABELS[field]}
              
            />
          ))}
        </div>
      ) : (
        <>
          {(Object.keys(localStats) as (keyof typeof localStats)[]).map(field => (
            <SectionItem key={field} title={`${FIELD_LABELS[field]}:`} icon={FIELD_ICONS[field]}>
              {localStats[field]}
            </SectionItem>
          ))}
        </>
      )}
    </div>
  )
}

export default CharacterStatsSection
