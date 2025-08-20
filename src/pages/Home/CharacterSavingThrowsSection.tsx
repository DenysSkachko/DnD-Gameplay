import { useState, useEffect } from 'react'
import { useCharacterStats } from '@/queries/characterStatsQueries'
import {
  useCharacterSavingThrows,
  useCreateCharacterSavingThrows,
  useUpdateCharacterSavingThrows,
  type CharacterSavingThrow,
} from '@/queries/characterSavingThrowsQueries'
import SectionItem from '@/ui/SectionItem'
import ButtonEdit from '@/ui/ActionButton'
import Checkbox from '@/ui/Checkbox'
import FormTitle from '@/ui/FormTitle'

const FIELD_LABELS: Record<keyof Omit<CharacterSavingThrow, 'id' | 'character_id'>, string> = {
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

  const [editMode, setEditMode] = useState(false)
  const [localThrows, setLocalThrows] = useState<Omit<CharacterSavingThrow, 'id' | 'character_id'>>(
    {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    }
  )

  useEffect(() => {
    if (savingThrows) {
      const { id, character_id, ...rest } = savingThrows
      setLocalThrows(rest)
    }
  }, [savingThrows])

  const computeValue = (key: keyof typeof localThrows) => {
    if (!stats) return 0
    const statValue = stats[key as keyof typeof stats] as number
    const bonus = stats.proficiency_bonus || 0
    return localThrows[key] ? statValue + bonus : statValue
  }

  const handleSave = async () => {
    if (!savingThrows) {
      await createSavingThrows.mutateAsync(localThrows)
    } else {
      await updateSavingThrows.mutateAsync({ id: savingThrows.id, ...localThrows })
    }
    setEditMode(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Saving Throws</FormTitle>

        {editMode ? (
          <div className="flex gap-2 mt-2">
            <ButtonEdit type="save" onClick={handleSave} />
            <ButtonEdit type="cancel" onClick={() => setEditMode(false)} />
          </div>
        ) : (
          <ButtonEdit type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      {Object.keys(localThrows).map(key => {
        const k = key as keyof typeof localThrows
        return (
          <SectionItem key={k} title={FIELD_LABELS[k]}>
            {!editMode ? (
              computeValue(k)
            ) : (
              <Checkbox
                checked={localThrows[k]}
                onChange={val =>
                  setLocalThrows({
                    ...localThrows,
                    [k]: val,
                  })
                }
              />
            )}
          </SectionItem>
        )
      })}
    </div>
  )
}

export default CharacterSavingThrowsSection
