import { useCharacterStats } from '@/queries/characterStatsQueries'
import {
  useCharacterSavingThrows,
  useCreateCharacterSavingThrows,
  useUpdateCharacterSavingThrows,
  type CharacterSavingThrow,
} from '@/queries/characterSavingThrowsQueries'
import SectionItem from '@/ui/SectionItem'
import ActionButton from '@/ui/ActionButton'
import Checkbox from '@/ui/Checkbox'
import FormTitle from '@/ui/FormTitle'
import { useEditableSection } from '@/hooks/useEditableSection'

const FIELDS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
const FIELD_LABELS: Record<typeof FIELDS[number], string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
}

const CharacterSavingThrowsSection = () => {
  const { data: stats } = useCharacterStats()
  const { data: savingThrows } = useCharacterSavingThrows()

  const createSavingThrows = useCreateCharacterSavingThrows()
  const updateSavingThrows = useUpdateCharacterSavingThrows()

  const {
    localItem,
    editMode,
    setEditMode,
    handleChange,
    saveSingle,
    cancelSingle,
  } = useEditableSection<CharacterSavingThrow>({
    data: savingThrows ?? null,
    emptyItem: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    stripKeys: ['id', 'character_id'],
    createFn: (item) =>
      createSavingThrows.mutateAsync(item as Omit<CharacterSavingThrow, 'id' | 'character_id'>),
    updateFn: (id, item) =>
      updateSavingThrows.mutateAsync({
        id,
        ...(item as Omit<CharacterSavingThrow, 'id' | 'character_id'>),
      }),
  })

  const computeValue = (key: typeof FIELDS[number]) => {
    if (!stats) return 0
    const statValue = (stats as any)[key] as number
    const bonus = (stats as any).proficiency_bonus || 0
    return (localItem as any)?.[key] ? statValue + bonus : statValue
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Saving Throws</FormTitle>
        {editMode ? (
          <div className="flex gap-2 mt-2">
            <ActionButton type="save" onClick={saveSingle} />
            <ActionButton type="cancel" onClick={cancelSingle} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      {FIELDS.map((k) => (
        <SectionItem key={k} title={FIELD_LABELS[k]}>
          {!editMode ? (
            computeValue(k)
          ) : (
            <Checkbox
              checked={(localItem as any)?.[k] ?? false}
              onChange={(val) => handleChange(k, val)}
            />
          )}
        </SectionItem>
      ))}
    </div>
  )
}

export default CharacterSavingThrowsSection
