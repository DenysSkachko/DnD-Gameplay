import { useCharacterStats } from '@/queries/characterStatsQueries'
import {
  useCharacterSkills,
  useCreateCharacterSkills,
  useUpdateCharacterSkills,
  type CharacterSkills,
} from '@/queries/characterSkillsQueries'
import SectionItem from '@/ui/SectionItem'
import FormTitle from '@/ui/FormTitle'
import ActionButton from '@/ui/ActionButton'
import Checkbox from '@/ui/Checkbox'
import { useEditableSection } from '@/hooks/useEditableSection'

type SkillKey = keyof Omit<CharacterSkills, 'id' | 'character_id'>

type SkillMeta = {
  key: SkillKey
  label: string
  attribute: 'strength' | 'dexterity' | 'intelligence' | 'wisdom' | 'charisma'
}

const skillList: SkillMeta[] = [
  { key: 'athletics', label: 'Атлетика', attribute: 'strength' },
  { key: 'acrobatics', label: 'Акробатика', attribute: 'dexterity' },
  { key: 'sleight_of_hand', label: 'Ловкость рук', attribute: 'dexterity' },
  { key: 'stealth', label: 'Скрытность', attribute: 'dexterity' },
  { key: 'history', label: 'История', attribute: 'intelligence' },
  { key: 'arcana', label: 'Магия', attribute: 'intelligence' },
  { key: 'nature', label: 'Природа', attribute: 'intelligence' },
  { key: 'investigation', label: 'Анализ', attribute: 'intelligence' },
  { key: 'religion', label: 'Религия', attribute: 'intelligence' },
  { key: 'perception', label: 'Внимательность', attribute: 'wisdom' },
  { key: 'survival', label: 'Выживание', attribute: 'wisdom' },
  { key: 'medicine', label: 'Медицина', attribute: 'wisdom' },
  { key: 'insight', label: 'Проницательность', attribute: 'wisdom' },
  { key: 'animal_handling', label: 'Уход за животными', attribute: 'wisdom' },
  { key: 'performance', label: 'Выступление', attribute: 'charisma' },
  { key: 'intimidation', label: 'Запугивание', attribute: 'charisma' },
  { key: 'deception', label: 'Обман', attribute: 'charisma' },
  { key: 'persuasion', label: 'Убеждение', attribute: 'charisma' },
]

const CharacterSkillsSection = () => {
  const { data: stats } = useCharacterStats()
  const { data: skills } = useCharacterSkills()
  const createSkills = useCreateCharacterSkills()
  const updateSkills = useUpdateCharacterSkills()

  const {
    localItem,
    editMode,
    setEditMode,
    handleChange,
    saveSingle,
    cancelSingle,
  } = useEditableSection<CharacterSkills>({
    data: skills ?? null,
    emptyItem: Object.fromEntries(
      skillList.map((s) => [s.key, false])
    ) as Partial<CharacterSkills>,
    stripKeys: ['id', 'character_id'],
    createFn: (item) =>
      createSkills.mutateAsync(
        item as Omit<CharacterSkills, 'id' | 'character_id'>
      ),
    updateFn: (id, item) =>
      updateSkills.mutateAsync({
        id,
        ...(item as Omit<CharacterSkills, 'id' | 'character_id'>),
      }),
  })

  const computeValue = (key: SkillKey, attr: SkillMeta['attribute']) => {
    if (!stats) return 0
    const base = (stats as any)[attr] || 0
    const bonus = (stats as any).proficiency_bonus || 0
    return (localItem as any)?.[key] ? base + bonus : base
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Навыки</FormTitle>
        {editMode ? (
          <div className="flex gap-2 mt-2">
            <ActionButton type="save" onClick={saveSingle} />
            <ActionButton type="cancel" onClick={cancelSingle} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {skillList.map((s) => (
          <SectionItem key={s.key} title={s.label}>
            {!editMode ? (
              computeValue(s.key, s.attribute)
            ) : (
              <Checkbox
                checked={(localItem as any)?.[s.key] ?? false}
                onChange={(val) => handleChange(s.key, val)}
              />
            )}
          </SectionItem>
        ))}
      </div>
    </div>
  )
}

export default CharacterSkillsSection
