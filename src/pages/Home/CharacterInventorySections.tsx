import {
  useCharacterInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  type CharacterInventory,
} from '@/queries/characterInventoryQueries'
import Input from '@/ui/Input'
import FormTitle from '@/ui/FormTitle'
import ActionButton from '@/ui/ActionButton'
import InventoryCard from '@/ui/InventoryCard'
import { useEditableSection } from '@/hooks/useEditableSection'

const CharacterInventorySection = () => {
  const { data: inventory = [], isLoading } = useCharacterInventory()
  const createItem = useCreateInventoryItem()
  const updateItem = useUpdateInventoryItem()
  const deleteItem = useDeleteInventoryItem()

  const {
    localList,
    setLocalList,
    editingIdx,
    setEditingIdx,
    newItem,
    startAdd,
    cancelAdd,
    addNew,
    saveExisting,
    deleteExisting,
  } = useEditableSection<CharacterInventory>({
    data: inventory,
    emptyItem: { item_name: '', quantity: 1, description: '', gold: 0 },
    stripKeys: ['id', 'character_id'],
    createFn: (item) => createItem.mutateAsync(item as Omit<CharacterInventory, 'id' | 'character_id'>),
    updateFn: (id, item) => updateItem.mutateAsync({ id, ...(item as Omit<CharacterInventory, 'id' | 'character_id'>) }),
    deleteFn: (id) => deleteItem.mutateAsync(id),
  })

  if (isLoading) return <p>Loading inventory...</p>

  const handleAddNew = async () => {
    await addNew()
  }

  const handleSaveExisting = async (idx: number) => {
    await saveExisting(idx)
  }

  const handleDeleteExisting = async (idx: number) => {
    await deleteExisting(idx)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Inventory</FormTitle>
        <ActionButton type="add" onClick={startAdd} />
      </div>

      {newItem && (
        <div className="flex flex-col gap-2 border p-3 rounded-md">
          <Input
            label="Название предмета"
            value={(newItem as any).item_name}
            onChange={_e => (setLocalList as any)((prev: any) => prev)}
          />
          <Input
            type="number"
            label="Количество"
            value={(newItem as any).quantity ?? 1}
            onChange={e => Object.assign(newItem, { quantity: Number(e.target.value) })}
          />
          <Input
            type="number"
            label="Стоимость (Gold)"
            value={(newItem as any).gold ?? 0}
            onChange={e => Object.assign(newItem, { gold: Number(e.target.value) })}
          />
          <Input
            label="Описание"
            value={(newItem as any).description || ''}
            onChange={e => Object.assign(newItem, { description: e.target.value })}
          />
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleAddNew} />
            <ActionButton type="cancel" onClick={cancelAdd} />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {localList.map((item, idx) => {
          const isEditing = editingIdx === idx
          return (
            <div key={idx} className="flex flex-col gap-2">
              {!isEditing ? (
                <div className="flex justify-between items-center relative">
                  <InventoryCard
                    name={(item as any).item_name}
                    quantity={(item as any).quantity ?? 0}
                    gold={(item as any).gold ?? 0}
                    description={(item as any).description || ' '}
                    onEdit={() => setEditingIdx(idx)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Название предмета"
                    value={(item as any).item_name}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).item_name = e.target.value
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    type="number"
                    label="Количество"
                    value={(item as any).quantity ?? 1}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).quantity = Number(e.target.value)
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    type="number"
                    label="Стоимость (Gold)"
                    value={(item as any).gold ?? 0}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).gold = Number(e.target.value)
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    label="Описание"
                    value={(item as any).description || ''}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).description = e.target.value
                      setLocalList(copy)
                    }}
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

export default CharacterInventorySection
