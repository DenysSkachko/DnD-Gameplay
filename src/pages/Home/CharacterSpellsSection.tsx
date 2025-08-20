
import { useState, useEffect } from 'react'
import {
  useCharacterSpells,
  useCreateCharacterSpell,
  useUpdateCharacterSpell,
  useDeleteCharacterSpell,
  type CharacterSpell,
} from '@/queries/characterSpellsQueries'
import Input from '@/ui/Input'
import Select from '@/ui/Select'
import Checkbox from '@/ui/Checkbox'
import FormTitle from '@/ui/FormTitle'
import ActionButton from '@/ui/ActionButton'
import SpellCard from '@/ui/SpellCard'

const levelOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const actionOptions = ['main', 'bonus']

const CharacterSpellsSection = () => {
  const { data: spells = [], isLoading, refetch } = useCharacterSpells()
  const createSpell = useCreateCharacterSpell()
  const updateSpell = useUpdateCharacterSpell()
  const deleteSpell = useDeleteCharacterSpell()

  const [localSpells, setLocalSpells] = useState<Omit<CharacterSpell, 'id' | 'character_id'>[]>([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [newSpell, setNewSpell] = useState<Omit<CharacterSpell, 'id' | 'character_id'> | null>(null)

  useEffect(() => {
    setLocalSpells(spells.map(({ id, character_id, ...rest }) => ({ ...rest })))
  }, [spells])

  if (isLoading) return <p>Loading spells...</p>

  const handleAddNew = async () => {
    if (!newSpell) return
    await createSpell.mutateAsync(newSpell)
    setNewSpell(null)
    await refetch()
  }

  const handleSaveExisting = async (idx: number) => {
    const original = spells[idx]
    if (!original) return
    await updateSpell.mutateAsync({ id: original.id, ...localSpells[idx] })
    setEditingIdx(null)
    await refetch()
  }

  const handleDeleteExisting = async (idx: number) => {
    const original = spells[idx]
    if (!original) return
    await deleteSpell.mutateAsync(original.id)
    setEditingIdx(null)
    await refetch()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Spells</FormTitle>
        <ActionButton
          type="add"
          onClick={() =>
            setNewSpell({
              name: '',
              level: 0,
              concentration: false,
              action: 'main',
              range: '',
              duration: '',
              description: '',
            })
          }
        />
      </div>

      {/* Форма добавления нового заклинания */}
      {newSpell && (
        <div className="flex flex-col gap-2">
          <Input
            label="Name"
            value={newSpell.name}
            onChange={e => setNewSpell({ ...newSpell, name: e.target.value })}
          />
          <Select
            label="Level"
            value={String(newSpell.level || 0)}
            options={levelOptions}
            onChange={val => setNewSpell({ ...newSpell, level: Number(val) })}
          />
          <Select
            label="Action Type"
            value={newSpell.action || 'main'}
            options={actionOptions}
            onChange={val => setNewSpell({ ...newSpell, action: val as 'main' | 'bonus' })}
          />
          <Input
            label="Range"
            value={newSpell.range || ''}
            onChange={e => setNewSpell({ ...newSpell, range: e.target.value })}
          />
          <Input
            label="Duration"
            value={newSpell.duration || ''}
            onChange={e => setNewSpell({ ...newSpell, duration: e.target.value })}
          />
          <Input
            label="Description"
            value={newSpell.description || ''}
            onChange={e => setNewSpell({ ...newSpell, description: e.target.value })}
          />
          <Checkbox
            checked={newSpell.concentration || false}
            onChange={val => setNewSpell({ ...newSpell, concentration: val })}
            label="Concentration"
          />
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleAddNew} />
            <ActionButton type="cancel" onClick={() => setNewSpell(null)} />
          </div>
        </div>
      )}

      {/* Список заклинаний */}
      <ul className="flex flex-col gap-2">
        {localSpells.map((s, idx) => {
          const isEditing = editingIdx === idx
          return (
            <div key={idx} className="flex flex-col gap-2">
              {!isEditing ? (
                <SpellCard
                  name={s.name ?? ''}
                  level={s.level ?? 0}
                  action={s.action ?? ''}
                  range={s.range ?? ''}
                  duration={s.duration ?? ''}
                  concentration={s.concentration ?? false}
                  description={s.description ?? ''}
                  onEdit={() => setEditingIdx(idx)}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Name"
                    value={s.name}
                    onChange={e => {
                      const copy = [...localSpells]
                      copy[idx].name = e.target.value
                      setLocalSpells(copy)
                    }}
                  />
                  <Select
                    label="Level"
                    value={String(s.level || 0)}
                    options={levelOptions}
                    onChange={val => {
                      const copy = [...localSpells]
                      copy[idx].level = Number(val)
                      setLocalSpells(copy)
                    }}
                  />
                  <Select
                    label="Action Type"
                    value={s.action || 'main'}
                    options={actionOptions}
                    onChange={val => {
                      const copy = [...localSpells]
                      copy[idx].action = val as 'main' | 'bonus'
                      setLocalSpells(copy)
                    }}
                  />
                  <Input
                    label="Range"
                    value={s.range || ''}
                    onChange={e => {
                      const copy = [...localSpells]
                      copy[idx].range = e.target.value
                      setLocalSpells(copy)
                    }}
                  />
                  <Input
                    label="Duration"
                    value={s.duration || ''}
                    onChange={e => {
                      const copy = [...localSpells]
                      copy[idx].duration = e.target.value
                      setLocalSpells(copy)
                    }}
                  />
                  <Input
                    label="Description"
                    value={s.description || ''}
                    onChange={e => {
                      const copy = [...localSpells]
                      copy[idx].description = e.target.value
                      setLocalSpells(copy)
                    }}
                  />
                  <Checkbox
                    checked={s.concentration || false}
                    onChange={val => {
                      const copy = [...localSpells]
                      copy[idx].concentration = val
                      setLocalSpells(copy)
                    }}
                    label="Concentration"
                  />
                  <div className="flex gap-2">
                    <ActionButton type="save" onClick={() => handleSaveExisting(idx)} />
                    <ActionButton type="delete" onClick={() => handleDeleteExisting(idx)} />
                    <ActionButton type="cancel" onClick={() => setEditingIdx(null)} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </ul>
    </div>
  )
}

export default CharacterSpellsSection
