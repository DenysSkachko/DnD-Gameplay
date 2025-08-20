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
import { useEditableSection } from '@/hooks/useEditableSection'

const FIELDS = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
  'proficiency_bonus',
] as const

const FIELD_LABELS: Record<typeof FIELDS[number], string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
  proficiency_bonus: 'Бонус мастерства',
}

const FIELD_ICONS: Partial<Record<typeof FIELDS[number], React.ReactNode>> = {
  strength: <GiStrong />,
  dexterity: <GiRunningShoe />,
  constitution: <GiMuscleUp />,
  intelligence: <GiBrain />,
  wisdom: <GiWisdom />,
  charisma: <GiCharm />,
  proficiency_bonus: <GiStarFormation />,
}

const CharacterStatsSection = () => {
  const { data: stats = null, isLoading } = useCharacterStats()
  const createStats = useCreateCharacterStats()
  const updateStats = useUpdateCharacterStats()

  const {
    localItem,
    editMode,
    setEditMode,
    handleChange,
    saveSingle,
    cancelSingle,
  } = useEditableSection<CharacterStat>({
    data: stats ?? null,
    emptyItem: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
      proficiency_bonus: 0,
    },
    stripKeys: ['id', 'character_id'],
    createFn: (item) =>
      createStats.mutateAsync(
        item as Omit<CharacterStat, 'id' | 'character_id'>
      ),
    updateFn: (id, item) =>
      updateStats.mutateAsync({
        id,
        ...(item as Omit<CharacterStat, 'id' | 'character_id'>),
      }),
  })

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex justify-between items-center">
        <FormTitle>Stats</FormTitle>
        {editMode ? (
          <div className="flex gap-2">
            <ActionButton type="save" onClick={saveSingle} />
            <ActionButton type="cancel" onClick={cancelSingle} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      {isLoading ? (
        <p>Загрузка характеристик...</p>
      ) : editMode ? (
        <div className="flex flex-col gap-4 max-w-sm">
          {FIELDS.map((field) => (
            <Input
              key={field}
              label={FIELD_LABELS[field]}
              type="number"
              value={(localItem as any)?.[field] ?? 0}
              onChange={(e) => handleChange(field, Number(e.target.value))}
              placeholder={FIELD_LABELS[field]}
            />
          ))}
        </div>
      ) : (
        <>
          {FIELDS.map((field) => (
            <SectionItem
              key={field}
              title={`${FIELD_LABELS[field]}:`}
              icon={FIELD_ICONS[field]}
            >
              {(localItem as any)?.[field] ?? 0}
            </SectionItem>
          ))}
        </>
      )}
    </div>
  )
}

export default CharacterStatsSection
