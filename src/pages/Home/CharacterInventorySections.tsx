import { useState, useEffect } from 'react'
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

const CharacterInventorySection = () => {
  const { data: inventory = [], isLoading } = useCharacterInventory()
  const createItem = useCreateInventoryItem()
  const updateItem = useUpdateInventoryItem()
  const deleteItem = useDeleteInventoryItem()

  const [localItems, setLocalItems] = useState<Omit<CharacterInventory, 'id' | 'character_id'>[]>(
    []
  )
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<Omit<CharacterInventory, 'id' | 'character_id'> | null>(
    null
  )

  useEffect(() => {
    if (inventory.length && localItems.length === 0) {
      setLocalItems(inventory.map(({ id, character_id, ...rest }) => ({ ...rest })))
    }
  }, [inventory])

  if (isLoading) return <p>Loading inventory...</p>

  const handleAddNew = async () => {
    if (!newItem) return
    await createItem.mutateAsync(newItem)
    setLocalItems(prev => [...prev, newItem])
    setNewItem(null)
  }

  const handleSaveExisting = async (idx: number) => {
    const original = inventory[idx]
    if (original) {
      await updateItem.mutateAsync({ id: original.id, ...localItems[idx] })
    }
    setEditingIdx(null)
    setLocalItems(prev => [...prev])
  }

  const handleDeleteExisting = async (idx: number) => {
    const original = inventory[idx]
    if (original) await deleteItem.mutateAsync(original.id)
    setEditingIdx(null)
    setLocalItems(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Inventory</FormTitle>
        <ActionButton
          type="add"
          onClick={() => setNewItem({ item_name: '', quantity: 1, description: '', gold: 0 })}
        />
      </div>

      {newItem && (
        <div className="flex flex-col gap-2 border p-3 rounded-md">
          <Input
            label="Название предмета"
            value={newItem.item_name}
            onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
          />
          <Input
            type="number"
            label="Количество"
            value={newItem.quantity ?? 1}
            onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          />
          <Input
            type="number"
            label="Стоимость (Gold)"
            value={newItem.gold ?? 0}
            onChange={e => setNewItem({ ...newItem, gold: Number(e.target.value) })}
          />
          <Input
            label="Описание"
            value={newItem.description || ''}
            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
          />
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleAddNew} />
            <ActionButton type="cancel" onClick={() => setNewItem(null)} />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {localItems.map((item, idx) => {
          const isEditing = editingIdx === idx
          return (
            <div key={idx} className="flex flex-col gap-2">
              {!isEditing ? (
                <div className="flex justify-between items-center relative">
                  <InventoryCard
                    name={item.item_name}
                    quantity={item.quantity ?? 0} 
                    gold={item.gold ?? 0}
                    description={item.description || ' '}
                    onEdit={() => setEditingIdx(idx)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Название предмета"
                    value={item.item_name}
                    onChange={e => {
                      const copy = [...localItems]
                      copy[idx].item_name = e.target.value
                      setLocalItems(copy)
                    }}
                  />
                  <Input
                    type="number"
                    label="Количество"
                    value={item.quantity ?? 1}
                    onChange={e => {
                      const copy = [...localItems]
                      copy[idx].quantity = Number(e.target.value)
                      setLocalItems(copy)
                    }}
                  />
                  <Input
                    type="number"
                    label="Стоимость (Gold)"
                    value={item.gold ?? 0}
                    onChange={e => {
                      const copy = [...localItems]
                      copy[idx].gold = Number(e.target.value)
                      setLocalItems(copy)
                    }}
                  />
                  <Input
                    label="Описание"
                    value={item.description || ''}
                    onChange={e => {
                      const copy = [...localItems]
                      copy[idx].description = e.target.value
                      setLocalItems(copy)
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
