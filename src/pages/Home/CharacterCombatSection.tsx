import { useState, useEffect } from 'react'
import {
  useCharacterCombat,
  useUpdateCharacterCombat,
  useCreateCharacterCombat,
} from '@/queries/characterCombatQueries'
import Input from '@/ui/Input'
import FormTitle from '@/ui/FormTitle'
import ActionButton from '@/ui/ActionButton'
import Checkbox from '@/ui/Checkbox'
import { Link } from 'react-router-dom'
import SectionItem from '@/ui/SectionItem'

const CharacterCombatSection = () => {
  const { data: combat, isLoading } = useCharacterCombat()
  const updateCombat = useUpdateCharacterCombat()
  const createCombat = useCreateCharacterCombat()

  const [editMode, setEditMode] = useState(false)
  const [localCombat, setLocalCombat] = useState({
    current_hp: 0,
    max_hp: 0,
    armor_class: 0,
    speed: 0,
    initiative: 0,
    inspiration: false,
  })

  useEffect(() => {
    if (combat) {
      setLocalCombat({
        current_hp: combat.current_hp || 0,
        max_hp: combat.max_hp || 0,
        armor_class: combat.armor_class || 0,
        speed: combat.speed || 0,
        initiative: combat.initiative || 0,
        inspiration: combat.inspiration || false,
      })
    }
  }, [combat])

  const handleSave = async () => {
    try {
      if (combat) {
        await updateCombat.mutateAsync({ id: combat.id, ...localCombat })
      } else {
        await createCombat.mutateAsync(localCombat)
      }
      setEditMode(false)
    } catch (error) {
      console.error('Ошибка при сохранении боевых данных:', error)
    }
  }

  if (isLoading) return <div>Загрузка боевых данных...</div>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Combat</FormTitle>
        {editMode ? (
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleSave} />
            <ActionButton type="cancel" onClick={() => setEditMode(false)} />
          </div>
        ) : (
          <ActionButton type="edit" onClick={() => setEditMode(true)} />
        )}
      </div>

      {!editMode ? (
        <>
          {combat ? (
            <div className="flex flex-col gap-2">
              <SectionItem title="Current HP/ Max HP">{combat.current_hp} / {combat.max_hp}</SectionItem>
              <SectionItem title="Armor Class">{combat.armor_class}</SectionItem>
              <SectionItem title="Speed">{combat.speed}</SectionItem>
              <SectionItem title="Initiative">{combat.initiative}</SectionItem>
              <SectionItem title="Inspiration">{combat.inspiration ? 'Yes' : 'No'}</SectionItem>
            </div>
          ) : (
            <ActionButton type="add" onClick={() => setEditMode(true)} />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            type="number"
            value={localCombat.current_hp}
            onChange={e => setLocalCombat({ ...localCombat, current_hp: Number(e.target.value) })}
            label="Current HP"
          />
          <Input
            type="number"
            value={localCombat.max_hp}
            onChange={e => setLocalCombat({ ...localCombat, max_hp: Number(e.target.value) })}
            label="Max HP"
          />
          <Input
            type="number"
            value={localCombat.armor_class}
            onChange={e => setLocalCombat({ ...localCombat, armor_class: Number(e.target.value) })}
            label="Armor Class"
          />
          <Input
            type="number"
            value={localCombat.speed}
            onChange={e => setLocalCombat({ ...localCombat, speed: Number(e.target.value) })}
            label="Speed"
          />
          <Input
            type="number"
            value={localCombat.initiative}
            onChange={e => setLocalCombat({ ...localCombat, initiative: Number(e.target.value) })}
            label="Initiative"
          />
          <Checkbox
            checked={localCombat.inspiration}
            onChange={val => setLocalCombat({ ...localCombat, inspiration: val })}
            label="Inspiration"
          />
        </div>
      )}

      {/* <Link to="/combat" className="text-accent underline mt-2">
        Перейти в бой
      </Link> */}
    </div>
  )
}

export default CharacterCombatSection
