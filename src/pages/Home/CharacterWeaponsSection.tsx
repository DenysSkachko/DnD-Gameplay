import {
  useCharacterWeapons,
  useCreateWeapon,
  useUpdateWeapon,
  useDeleteWeapon,
  type CharacterWeapon,
} from '@/queries/characterWeaponsQueries'
import { useCharacterStats, type CharacterStat } from '@/queries/characterStatsQueries'
import Input from '@/ui/Input'
import FormTitle from '@/ui/FormTitle'
import ActionButton from '@/ui/ActionButton'
import Select from '@/ui/Select'
import Checkbox from '@/ui/Checkbox'
import WeaponCard from '@/ui/WeaponCard'
import { useEditableSection } from '@/hooks/useEditableSection'

const diceOptions = ['d4', 'd6', 'd8', 'd10']

const CharacterWeaponsSection = () => {
  const { data: weapons = [], isLoading } = useCharacterWeapons()
  const { data: stats } = useCharacterStats()
  const createWeapon = useCreateWeapon()
  const updateWeapon = useUpdateWeapon()
  const deleteWeapon = useDeleteWeapon()

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
  } = useEditableSection<CharacterWeapon>({
    data: weapons,
    emptyItem: {
      name: '',
      damage_dice: '',
      damage_stat: '',
      extra_damage: null,
      use_proficiency: false,
    },
    stripKeys: ['id', 'character_id'],
    createFn: item =>
      createWeapon.mutateAsync(
        item as Omit<CharacterWeapon, 'id' | 'character_id' | 'attack_bonus' | 'damage'>
      ),
    updateFn: (id, item) =>
      updateWeapon.mutateAsync({
        id,
        ...(item as Omit<CharacterWeapon, 'id' | 'character_id' | 'attack_bonus' | 'damage'>),
      }),
    deleteFn: id => deleteWeapon.mutateAsync(id),
  })

  if (isLoading) return <p>Loading weapons...</p>

  const statOptions = stats
    ? Object.keys(stats).filter(
        k => k !== 'id' && k !== 'character_id' && k !== 'proficiency_bonus'
      )
    : []

  const calcDamageAndAttack = (
    w: Omit<CharacterWeapon, 'id' | 'character_id' | 'attack_bonus' | 'damage'>
  ) => {
    if (!w.damage_dice || !w.damage_stat) return { damage: '-', attack_bonus: 0 }
    const statValue = Number((stats as any)[w.damage_stat as keyof CharacterStat] || 0)
    const damageStr = `${w.damage_dice} + ${statValue}${
      w.extra_damage ? ` + ${w.extra_damage}` : ''
    }`
    const attackBonus =
      statValue + (w.use_proficiency ? Number((stats as any).proficiency_bonus || 0) : 0)
    return { damage: damageStr, attack_bonus: attackBonus }
  }

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
        <FormTitle>Weapons</FormTitle>
        <ActionButton type="add" onClick={startAdd} />
      </div>

      {newItem && (
        <div className="flex flex-col gap-2 border p-3 rounded-md">
          <Input
            label="Name"
            value={(newItem as any).name}
            onChange={e => Object.assign(newItem, { name: e.target.value })}
          />
          <Select
            label="Damage Dice"
            value={(newItem as any).damage_dice}
            options={diceOptions}
            onChange={val => Object.assign(newItem, { damage_dice: val })}
          />
          <Select
            label="Damage Stat"
            value={(newItem as any).damage_stat}
            options={statOptions}
            onChange={val => Object.assign(newItem, { damage_stat: val })}
          />
          <Input
            label="Extra Damage"
            type="number"
            value={(newItem as any).extra_damage}
            onChange={e => Object.assign(newItem, { extra_damage: Number(e.target.value) })}
          />
          <Checkbox
            checked={(newItem as any).use_proficiency}
            onChange={val => Object.assign(newItem, { use_proficiency: val })}
            label="Add proficiency bonus"
          />
          <div className="flex gap-2">
            <ActionButton type="save" onClick={handleAddNew} />
            <ActionButton type="cancel" onClick={cancelAdd} />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {localList.map((w, idx) => {
          const isEditing = editingIdx === idx
          const { damage, attack_bonus } = calcDamageAndAttack(w as any)
          return (
            <div key={idx} className="flex flex-col gap-2">
              {!isEditing ? (
                <div className="flex justify-between items-center relative">
                  <WeaponCard
                    name={(w as any).name}
                    damage={damage}
                    attack_bonus={attack_bonus}
                    onEdit={() => setEditingIdx(idx)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Name"
                    value={(w as any).name}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).name = e.target.value
                      setLocalList(copy)
                    }}
                  />
                  <Select
                    label="Damage Dice"
                    value={(w as any).damage_dice}
                    options={diceOptions}
                    onChange={val => {
                      const copy = [...localList]
                      ;(copy[idx] as any).damage_dice = val
                      setLocalList(copy)
                    }}
                  />
                  <Select
                    label="Damage Stat"
                    value={(w as any).damage_stat}
                    options={statOptions}
                    onChange={val => {
                      const copy = [...localList]
                      ;(copy[idx] as any).damage_stat = val
                      setLocalList(copy)
                    }}
                  />
                  <Input
                    label="Extra Damage"
                    type="number"
                    value={(w as any).extra_damage}
                    onChange={e => {
                      const copy = [...localList]
                      ;(copy[idx] as any).extra_damage = Number(e.target.value)
                      setLocalList(copy)
                    }}
                  />
                  <Checkbox
                    checked={(w as any).use_proficiency}
                    onChange={val => {
                      const copy = [...localList]
                      ;(copy[idx] as any).use_proficiency = val
                      setLocalList(copy)
                    }}
                    label="Add proficiency bonus"
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

export default CharacterWeaponsSection
