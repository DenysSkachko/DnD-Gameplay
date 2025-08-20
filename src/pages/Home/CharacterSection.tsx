import { useEffect } from 'react'
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
import { useEditableSection } from '@/hooks/useEditableSection'

const FIELDS = ['character_name', 'race', 'class'] as const
const FIELD_LABELS: Record<typeof FIELDS[number], string> = {
  character_name: 'Name',
  race: 'Race',
  class: 'Class',
}

const CharacterSection = () => {
  const { data: character, isLoading } = useCharacter()
  const createCharacter = useCreateCharacter()
  const updateCharacter = useUpdateCharacter()

  const {
    localItem,
    setLocalItem,
    editMode,
    setEditMode,
    handleChange,
    saveSingle,
    cancelSingle,
  } = useEditableSection<Character>({
    data: character ?? null,
    emptyItem: { character_name: '', race: '', class: '' },
    stripKeys: ['id', 'account_id'],
    createFn: (item) => createCharacter.mutateAsync(item as Omit<Character, 'id' | 'account_id'>),
    updateFn: (id, item) => updateCharacter.mutateAsync({ id, ...(item as Omit<Character, 'id' | 'account_id'>) }),
  })

  useEffect(() => {
    if (!character && !isLoading) {
      setLocalItem({ character_name: '', race: '', class: '' })
      setEditMode(true)
    }
  }, [character, isLoading, setEditMode, setLocalItem])

  if (isLoading) return <p className="text-gray-400 italic">Проверяем персонажа...</p>

  return (
    <div className="flex flex-col gap-3 rounded-md">
      <div className="flex justify-between items-center">
        <FormTitle>Main Info</FormTitle>
        {editMode ? (
          <div className="flex gap-2">
            <ActionButton type="save" onClick={saveSingle} />
            <ActionButton type="cancel" onClick={cancelSingle} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      {editMode && localItem ? (
        <div className="flex flex-col gap-4">
          {FIELDS.map((field) => (
            <Input
              key={field}
              label={FIELD_LABELS[field]}
              value={(localItem as any)[field] ?? ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={FIELD_LABELS[field]}
            />
          ))}
        </div>
      ) : character ? (
        <>
          <SectionItem title="Имя:">{character.character_name}</SectionItem>
          <SectionItem title="Раса:">{character.race}</SectionItem>
          <SectionItem title="Класс:">{character.class}</SectionItem>
        </>
      ) : (
        <p className="text-gray-400 italic">Персонаж ещё не создан</p>
      )}
    </div>
  )
}

export default CharacterSection
