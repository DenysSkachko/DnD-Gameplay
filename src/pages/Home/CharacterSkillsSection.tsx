import { useState, useEffect } from 'react'
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

type SkillMeta = {
  key: keyof Omit<CharacterSkills, 'id' | 'character_id'>
  label: string
  attribute: keyof typeof statsDefaults
}

const statsDefaults = {
  strength: 0,
  dexterity: 0,
  intelligence: 0,
  wisdom: 0,
  charisma: 0,
  proficiency_bonus: 0,
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

  const [editMode, setEditMode] = useState(false)
  const [localSkills, setLocalSkills] = useState<Omit<CharacterSkills, 'id' | 'character_id'>>(
    {} as any
  )

  useEffect(() => {
    if (skills) {
      const { id, character_id, ...rest } = skills
      setLocalSkills(rest)
    } else {
      const emptySkills: any = {}
      skillList.forEach(s => (emptySkills[s.key] = false))
      setLocalSkills(emptySkills)
    }
  }, [skills])

  const computeValue = (key: keyof typeof localSkills, attr: keyof typeof statsDefaults) => {
    if (!stats) return 0
    const base = stats[attr] || 0
    const bonus = stats.proficiency_bonus || 0
    return localSkills[key] ? base + bonus : base
  }

  const handleSave = async () => {
    if (!skills) {
      await createSkills.mutateAsync(localSkills)
    } else {
      await updateSkills.mutateAsync({ id: skills.id, ...localSkills })
    }
    setEditMode(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Навыки</FormTitle>

        {editMode ? (
          <div className="flex gap-2 mt-2">
            <ActionButton type="save" onClick={handleSave} />
            <ActionButton type="cancel" onClick={() => setEditMode(false)} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {skillList.map(s => (
          <SectionItem key={s.key} title={s.label}>
            {!editMode ? (
              computeValue(s.key, s.attribute)
            ) : (
              <Checkbox
                checked={localSkills[s.key]}
                onChange={val =>
                  setLocalSkills({
                    ...localSkills,
                    [s.key]: val,
                  })
                }
              />
            )}
          </SectionItem>
        ))}
      </div>
    </div>
  )
}

export default CharacterSkillsSection
