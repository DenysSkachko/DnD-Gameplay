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
import { useEditableSection } from '@/hooks/useEditableSection'

const levelOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const actionOptions = ['main', 'bonus']

const CharacterSpellsSection = () => {
  const { data: spells = [], isLoading, refetch } = useCharacterSpells()
  const createSpell = useCreateCharacterSpell()
  const updateSpell = useUpdateCharacterSpell()
  const deleteSpell = useDeleteCharacterSpell()

  const {
    localList,
    setLocalList,
    editingIdx,
    setEditingIdx,
    newItem,
    setNewItem,
    startAdd,
    cancelAdd,
    addNew,
    saveExisting,
    deleteExisting,
  } = useEditableSection<CharacterSpell>({
    data: spells,
    emptyItem: {
      name: '',
      level: 0,
      concentration: false,
      action: 'main' as 'main' | 'bonus',
      range: '',
      duration: '',
      description: '',
    },
    stripKeys: ['id', 'character_id'],
    createFn: (item) => createSpell.mutateAsync(item as Omit<CharacterSpell, 'id' | 'character_id'>),
    updateFn: (id, item) => updateSpell.mutateAsync({ id, ...(item as Omit<CharacterSpell, 'id' | 'character_id'>) }),
    deleteFn: (id) => deleteSpell.mutateAsync(id),
  })

  if (isLoading) return <p>Loading spells...</p>

  const handleAddNew = async () => {
    await addNew()
    await refetch()
  }
  const handleSaveExisting = async (idx: number) => {
    await saveExisting(idx)
    await refetch()
  }
  const handleDeleteExisting = async (idx: number) => {
    await deleteExisting(idx)
    await refetch()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Spells</FormTitle>
        <ActionButton type="add" onClick={startAdd} />
      </div>

      {newItem && (
        <div className="flex flex-col gap-2">
          <Input
            label="Name"
            value={(newItem as any).name}
            onChange={e => setNewItem({ ...(newItem as any), name: e.target.value })}
          />
          <Select
            label="Level"
            value={String((newItem as any).level || 0)}
            options={levelOptions}
            onChange={val => setNewItem({ ...(newItem as any), level: Number(val) })}
          />
          <Select
            label="Action Type"
            value={(newItem as any).action || 'main'}
            options={actionOptions}
            onChange={val => setNewItem({ ...(newItem as any), action: val as 'main' | 'bonus' })}
          />
          <Input
            label="Range"
            value={(newItem as any).range || ''}
            onChange={e => setNewItem({ ...(newItem as any), range: e.target.value })}
          />
          <Input
            label="Duration"
            value={(newItem as any).duration || ''}
            onChange={e => setNewItem({ ...(newItem as any), duration: e.target.value })}
          />
          <Input
            label="Description"
            value={(newItem as any).description || ''}
            onChange={e => setNewItem({ ...(newItem as any), description: e.target.value })}
          />
          <Checkbox
            checked={(newItem as any).concentration || false}
            onChange={val => setNewItem({ ...(newItem as any), concentration: val })}
            label="Concentration"
          />
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleAddNew} />
            <ActionButton type="cancel" onClick={cancelAdd} />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {localList.map((s, idx) => {
          const isEditing = editingIdx === idx
          return (
            <div key={idx} className="flex flex-col gap-2">
              {!isEditing ? (
                <SpellCard
                  name={(s as any).name ?? ''}
                  level={(s as any).level ?? 0}
                  action={(s as any).action ?? ''}
                  range={(s as any).range ?? ''}
                  duration={(s as any).duration ?? ''}
                  concentration={(s as any).concentration ?? false}
                  description={(s as any).description ?? ''}
                  onEdit={() => setEditingIdx(idx)}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Name"
                    value={(s as any).name}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).name = e.target.value
                      setLocalList(copy)
                    }}
                  />
                  <Select
                    label="Level"
                    value={String((s as any).level || 0)}
                    options={levelOptions}
                    onChange={val => {
                      const copy = [...localList]
                      ;(copy[idx] as any).level = Number(val)
                      setLocalList(copy)
                    }}
                  />
                  <Select
                    label="Action Type"
                    value={(s as any).action || 'main'}
                    options={actionOptions}
                    onChange={val => {
                      const copy = [...localList]
                      ;(copy[idx] as any).action = val as 'main' | 'bonus'
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    label="Range"
                    value={(s as any).range || ''}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).range = e.target.value
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    label="Duration"
                    value={(s as any).duration || ''}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).duration = e.target.value
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    label="Description"
                    value={(s as any).description || ''}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).description = e.target.value
                      setLocalList(copy)
                    }}
                  />
                  <Checkbox
                    checked={(s as any).concentration || false}
                    onChange={val => {
                      const copy = [...localList]
                      ;(copy[idx] as any).concentration = val
                      setLocalList(copy)
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
