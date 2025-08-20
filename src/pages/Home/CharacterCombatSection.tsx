import {
  useCharacterCombat,
  useUpdateCharacterCombat,
  useCreateCharacterCombat,
  type CharacterCombat,
} from '@/queries/characterCombatQueries'
import Input from '@/ui/Input'
import FormTitle from '@/ui/FormTitle'
import ActionButton from '@/ui/ActionButton'
import Checkbox from '@/ui/Checkbox'
import SectionItem from '@/ui/SectionItem'
import { useEditableSection } from '@/hooks/useEditableSection'

const FIELD_LABELS: Record<string, string> = {
  current_hp: 'Current HP',
  max_hp: 'Max HP',
  armor_class: 'Armor Class',
  speed: 'Speed',
  initiative: 'Initiative',
}

const FIELDS = Object.keys(FIELD_LABELS) as (keyof CharacterCombat)[]

const CharacterCombatSection = () => {
  const { data: combat = null, isLoading } = useCharacterCombat()
  const updateCombat = useUpdateCharacterCombat()
  const createCombat = useCreateCharacterCombat()

  const {
    localItem,
    editMode,
    setEditMode,
    handleChange,
    saveSingle,
    cancelSingle,
  } = useEditableSection<CharacterCombat>({
    data: combat ?? null,
    emptyItem: {
      current_hp: null,
      max_hp: null,
      armor_class: null,
      speed: null,
      initiative: null,
      inspiration: false,
    },
    stripKeys: ['id', 'character_id'],
    createFn: (item) =>
      createCombat.mutateAsync(
        item as Omit<CharacterCombat, 'id' | 'character_id'>
      ),
    updateFn: (id, item) =>
      updateCombat.mutateAsync({
        id,
        ...(item as Omit<CharacterCombat, 'id' | 'character_id'>),
      }),
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Combat</FormTitle>
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
        <p>Загрузка боевых данных...</p>
      ) : editMode ? (
        <div className="flex flex-col gap-3 max-w-sm">
          {FIELDS.map((f) => (
            <Input
              key={f}
              type="number"
              value={(localItem as any)?.[f] ?? ''}
              onChange={(e) =>
                handleChange(f, e.target.value === '' ? null : Number(e.target.value))
              }
              label={FIELD_LABELS[f]}
            />
          ))}
          <Checkbox
            checked={(localItem as any)?.inspiration ?? false}
            onChange={(val) => handleChange('inspiration', val)}
            label="Inspiration"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <SectionItem title="Current HP / Max HP">
            {(localItem as any)?.current_hp ?? '-'} / {(localItem as any)?.max_hp ?? '-'}
          </SectionItem>
          <SectionItem title="Armor Class">
            {(localItem as any)?.armor_class ?? '-'}
          </SectionItem>
          <SectionItem title="Speed">
            {(localItem as any)?.speed ?? '-'}
          </SectionItem>
          <SectionItem title="Initiative">
            {(localItem as any)?.initiative ?? '-'}
          </SectionItem>
          <SectionItem title="Inspiration">
            {(localItem as any)?.inspiration ? 'Yes' : 'No'}
          </SectionItem>
        </div>
      )}
    </div>
  )
}

export default CharacterCombatSection
