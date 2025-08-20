
import { useState, useEffect } from 'react'
import {
  useCharacter,
  useCreateCharacter,
  useUpdateCharacter,
  type Character,
} from '@/queries/characterQueries'
import Input from '@/ui/Input'
import FormTitle from '@/ui/FormTitle'
import SectionItem from '@/ui/SectionItem'
import ActionButton from '@/ui/ActionButton'

const FIELD_LABELS: Record<keyof Omit<Character, 'id' | 'account_id'>, string> = {
  character_name: 'Name',
  race: 'Race',
  class: 'Class',
}

const CharacterSection = () => {
  const { data: character, isLoading } = useCharacter()
  const updateCharacter = useUpdateCharacter()
  const createCharacter = useCreateCharacter()

  const [editMode, setEditMode] = useState(false)
  const [localCharacter, setLocalCharacter] = useState<Omit<Character, 'id' | 'account_id'> | null>(
    null
  )

  useEffect(() => {
    if (character) {
      const { id, account_id, ...rest } = character
      setLocalCharacter(rest)
    }
  }, [character])

  if (isLoading || !localCharacter) return <p>Загрузка персонажа...</p>

  const handleChange = (field: keyof typeof localCharacter, value: string) => {
    if (!localCharacter) return
    setLocalCharacter(prev => ({ ...prev!, [field]: value }))
  }

  const handleSave = async () => {
    if (!localCharacter) return
    if (character) {
      await updateCharacter.mutateAsync({ id: character.id, ...localCharacter })
    } else {
      await createCharacter.mutateAsync(localCharacter)
    }
    setEditMode(false)
  }

  const handleCancel = () => {
    if (character) {
      const { id, account_id, ...rest } = character
      setLocalCharacter(rest)
      setEditMode(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md">
      <div className="flex justify-between items-center">
        <FormTitle>Main Info</FormTitle>
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
        <div className="flex flex-col gap-4">
          {(Object.keys(localCharacter) as (keyof typeof localCharacter)[]).map(field => (
            <Input
              key={field}
              label={FIELD_LABELS[field]}
              value={localCharacter[field]}
              onChange={e => handleChange(field, e.target.value)}
              placeholder={FIELD_LABELS[field]}
            />
          ))}
        </div>
      ) : (
        <>
          <SectionItem title="Имя:">{character?.character_name || ' '}</SectionItem>
          <SectionItem title="Раса:">{character?.race || ' '}</SectionItem>
          <SectionItem title="Класс:">{character?.class || ' '}</SectionItem>
        </>
      )}
    </div>
  )
}

export default CharacterSection
