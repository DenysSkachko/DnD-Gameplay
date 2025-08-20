import { useState, useEffect } from 'react'
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

const diceOptions = ['d4', 'd6', 'd8', 'd10']

const CharacterWeaponsSection = () => {
  const { data: weapons = [], isLoading } = useCharacterWeapons()
  const { data: stats } = useCharacterStats()
  const createWeapon = useCreateWeapon()
  const updateWeapon = useUpdateWeapon()
  const deleteWeapon = useDeleteWeapon()

  const [localWeapons, setLocalWeapons] = useState<
    Omit<CharacterWeapon, 'id' | 'character_id' | 'attack_bonus' | 'damage'>[]
  >([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [newWeapon, setNewWeapon] = useState<Omit<
    CharacterWeapon,
    'id' | 'character_id' | 'attack_bonus' | 'damage'
  > | null>(null)

  useEffect(() => {
    if (weapons.length && localWeapons.length === 0) {
      setLocalWeapons(weapons.map(({ id, character_id, ...rest }) => ({ ...rest })))
    }
  }, [weapons])

  if (isLoading || !stats) return <p>Loading weapons...</p>

  const statOptions = Object.keys(stats).filter(
    k => k !== 'id' && k !== 'character_id' && k !== 'proficiency_bonus'
  )

  const calcDamageAndAttack = (
    w: Omit<CharacterWeapon, 'id' | 'character_id' | 'attack_bonus' | 'damage'>
  ) => {
    if (!w.damage_dice || !w.damage_stat) return { damage: '-', attack_bonus: 0 }
    const statValue = Number(stats[w.damage_stat as keyof CharacterStat] || 0)
    const damageStr = `${w.damage_dice} + ${statValue}${
      w.extra_damage ? ` + ${w.extra_damage}` : ''
    }`
    const attackBonus = statValue + (w.use_proficiency ? Number(stats.proficiency_bonus || 0) : 0)
    return { damage: damageStr, attack_bonus: attackBonus }
  }

  const handleSaveExisting = async (idx: number) => {
    const original = weapons[idx]
    if (original) {
      await updateWeapon.mutateAsync({ id: original.id, ...localWeapons[idx] })
      setLocalWeapons(prev => {
        const copy = [...prev]
        copy[idx] = { ...copy[idx] }
        return copy
      })
    }
    setEditingIdx(null)
  }

  const handleDeleteExisting = async (idx: number) => {
    const original = weapons[idx]
    if (original) await deleteWeapon.mutateAsync(original.id)
    setEditingIdx(null)
    setLocalWeapons(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <FormTitle>Weapons</FormTitle>
        <ActionButton
          type="add"
          onClick={() =>
            setNewWeapon({
              name: '',
              damage_dice: '',
              damage_stat: '',
              extra_damage: 0,
              use_proficiency: false,
            })
          }
        />
      </div>

      {newWeapon && (
        <div className="flex flex-col gap-2 border p-3 rounded-md">
          <Input
            label="Name"
            value={newWeapon.name}
            onChange={e => setNewWeapon({ ...newWeapon, name: e.target.value })}
          />
          <Select
            label="Damage Dice"
            value={newWeapon.damage_dice}
            options={diceOptions}
            onChange={val => setNewWeapon({ ...newWeapon, damage_dice: val })}
          />
          <Select
            label="Damage Stat"
            value={newWeapon.damage_stat}
            options={statOptions}
            onChange={val => setNewWeapon({ ...newWeapon, damage_stat: val })}
          />
          <Input
            label="Extra Damage"
            type="number"
            value={newWeapon.extra_damage}
            onChange={e => setNewWeapon({ ...newWeapon, extra_damage: Number(e.target.value) })}
          />
          <Checkbox
            checked={newWeapon.use_proficiency}
            onChange={val => setNewWeapon({ ...newWeapon, use_proficiency: val })}
            label="Add proficiency bonus"
          />
          <div className="flex gap-2">
            <ActionButton
              type="save"
              onClick={async () => {
                if (newWeapon) {
                  await createWeapon.mutateAsync(newWeapon)
                  setLocalWeapons(prev => [...prev, newWeapon])
                  setNewWeapon(null)
                }
              }}
            />
            <ActionButton type="cancel" onClick={() => setNewWeapon(null)} />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {localWeapons.map((w, idx) => {
          const isEditing = editingIdx === idx
          const { damage, attack_bonus } = calcDamageAndAttack(w)
          return (
            <div key={idx} className="flex flex-col gap-2">
              {!isEditing ? (
                <div
                  className="flex justify-between items-center relative"
                  onClick={() => setEditingIdx(idx)}
                >
                  <WeaponCard
                    name={w.name}
                    damage={damage}
                    attack_bonus={attack_bonus}
                  ></WeaponCard>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Name"
                    value={w.name}
                    onChange={e => {
                      const copy = [...localWeapons]
                      copy[idx].name = e.target.value
                      setLocalWeapons(copy)
                    }}
                  />
                  <Select
                    label="Damage Dice"
                    value={w.damage_dice}
                    options={diceOptions}
                    onChange={val => {
                      const copy = [...localWeapons]
                      copy[idx].damage_dice = val
                      setLocalWeapons(copy)
                    }}
                  />
                  <Select
                    label="Damage Stat"
                    value={w.damage_stat}
                    options={statOptions}
                    onChange={val => {
                      const copy = [...localWeapons]
                      copy[idx].damage_stat = val
                      setLocalWeapons(copy)
                    }}
                  />
                  <Input
                    label="Extra Damage"
                    type="number"
                    value={w.extra_damage}
                    onChange={e => {
                      const copy = [...localWeapons]
                      copy[idx].extra_damage = Number(e.target.value)
                      setLocalWeapons(copy)
                    }}
                  />
                  <Checkbox
                    checked={w.use_proficiency}
                    onChange={val => {
                      const copy = [...localWeapons]
                      copy[idx].use_proficiency = val
                      setLocalWeapons(copy)
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
