import { useState } from 'react'
import { useAccount } from '@/context/AccountContext'
import {
  useActiveFight,
  useFightParticipants,
  useCreateFight,
  useAddEnemy,
  useJoinFight,
  useUpdateHP,
  useUpdateEnemy,
  useDeleteEnemy,
  useFinishFight,
} from '@/queries/fightQueries'
import ActionButton from '@/ui/ActionButton'
import Input from '@/ui/Input'
import { Shield, HeartPulse, Zap } from 'lucide-react'

export default function CombatPage() {
  const { account } = useAccount()

  const { data: activeFight } = useActiveFight()
  const { data: participants = [] } = useFightParticipants(activeFight?.id)

  const createFight = useCreateFight()
  const addEnemy = useAddEnemy(activeFight?.id)
  const joinFight = useJoinFight(activeFight?.id)
  const updateHp = useUpdateHP(activeFight?.id)
  const updateEnemy = useUpdateEnemy(activeFight?.id)
  const deleteEnemy = useDeleteEnemy(activeFight?.id)
  const finishFight = useFinishFight(activeFight?.id)

  // --- utils ---
  const normalizeNumber = (val: number | '') => (val === '' ? 0 : val)

  // --- state ---
  const [initiativeInput, setInitiativeInput] = useState<number | ''>('') 
  const [hpInput, setHpInput] = useState<number | ''>('') 
  const [showInitiativeModal, setShowInitiativeModal] = useState(false)

  // Enemy add/edit modal
  const [showEnemyForm, setShowEnemyForm] = useState(false)
  const [editingEnemy, setEditingEnemy] = useState<any | null>(null)
  const [enemyForm, setEnemyForm] = useState({
    name: '',
    ac: '' as number | '',
    currentHp: '' as number | '',
    maxHp: '' as number | '',
    initiative: '' as number | '',
  })

  // Enemy quick HP modal
  const [showEnemyHpModal, setShowEnemyHpModal] = useState(false)
  const [enemyHpInput, setEnemyHpInput] = useState<number | ''>('') 
  const [selectedEnemy, setSelectedEnemy] = useState<any | null>(null)

  const isDM = account?.character_name === 'DM'
  const myParticipant = participants.find(p => p.account_id === account?.id)
  const participantJoined = !!myParticipant

  // --- экран входа инициативы ---
  if (activeFight && !isDM && !participantJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
        <h2 className="text-xl font-bold">Вход в бой</h2>
        <Input
          label="Инициатива"
          type="number"
          value={initiativeInput}
          onChange={e =>
            setInitiativeInput(e.target.value === '' ? '' : Number(e.target.value))
          }
        />
        <ActionButton
          type="save"
          onClick={() => joinFight.mutate(normalizeNumber(initiativeInput))}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-dark w-screen">
      
      {/* Модалка смены инициативы */}
      {showInitiativeModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6"
          onClick={() => setShowInitiativeModal(false)}
        >
          <div
            className="p-6 rounded-xl shadow-xl bg-dark"
            onClick={e => e.stopPropagation()}
          >
            <Input
              label="Инициатива"
              type="number"
              value={initiativeInput}
              onChange={e =>
                setInitiativeInput(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
            <div className="flex gap-2 mt-4">
              <ActionButton
                type="save"
                onClick={() => {
                  joinFight.mutate(normalizeNumber(initiativeInput))
                  setShowInitiativeModal(false)
                }}
              />
              <ActionButton type="cancel" onClick={() => setShowInitiativeModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Контент */}
      <div className="pb-16 p-4 text-white">
        {!activeFight ? (
          <div className="text-center">
            <p>Нет активного боя</p>
            {isDM && <ActionButton type="add" onClick={() => createFight.mutate()} />}
          </div>
        ) : (
          <>
            {!isDM ? (<div className="flex gap-2 mb-4 justify-end"> <ActionButton type="edit" onClick={() => setShowInitiativeModal(true)} /> </div> ) : (
              <div className="flex gap-2 mb-4 justify-end">
                <ActionButton type="delete" onClick={() => finishFight.mutate()} />
                <ActionButton
                  type="add"
                  onClick={() => {
                    setEditingEnemy(null)
                    setEnemyForm({
                      name: '',
                      ac: '',
                      currentHp: '',
                      maxHp: '',
                      initiative: '',
                    })
                    setShowEnemyForm(true)
                  }}
                />
              </div>
            )}

            <ul className="space-y-2">
              {participants.map(p => (
                <li key={p.id} className="p-2  shadow">
                  <div className="flex flex-col px-6 py-3 bg-dark-hover rounded-2xl min-w-80 shadow-2xl items-center ">
                    {/* Имя */}
                    <div className="flex w-full justify-between">
                      <span className="text-lg font-extrabold text-yellow-300 tracking-wide uppercase">
                        {p.name}
                      </span>

                      {/* Инициатива */}
                      <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                        <Zap className="w-5 h-5 " />
                        <span className="">{p.initiative}</span>
                      </div>
                    </div>

                    {/* Если видим статы */}
                    {!p.is_enemy || isDM ? (
                      <div className="flex justify-between items-center gap-2 mt-2 w-full">
                        {/* HP */}
                        <div className="flex items-center gap-2 text-red-400 font-bold text-2xl">
                          <HeartPulse className="w-5 h-5" />
                          <span>
                            {p.current_hp}/{p.max_hp}
                          </span>
                        </div>

                        {/* AC */}
                        <div className="flex items-center gap-2 text-blue-400 font-semibold">
                          <Shield className="w-5 h-5" />
                          <span>{p.armor_class}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic text-sm"></span>
                    )}
                  </div>
                  {isDM && p.is_enemy && (
                    <div className="flex gap-2 mt-2">
                      <ActionButton
                        type="edit"
                        onClick={() => {
                          setEditingEnemy(p)
                          setEnemyForm({
                            name: p.name,
                            ac: p.armor_class,
                            currentHp: p.current_hp,
                            maxHp: p.max_hp,
                            initiative: p.initiative,
                          })
                          setShowEnemyForm(true)
                        }}
                      />
                      <ActionButton type="delete" onClick={() => deleteEnemy.mutate(p.id)} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Footer игрока */}
      {myParticipant && !isDM && (
        <footer className="fixed bottom-0 left-0 right-0 bg-dark-hover  text-white px-4 py-3 flex justify-between items-center z-50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Input
                label="HP"
                type="number"
                value={hpInput}
                onChange={e =>
                  setHpInput(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-20"
              />
              <span className="text-gray-400">/ {myParticipant.max_hp}</span>
            </div>
          </div>
          <ActionButton
            type="save"
            onClick={() => {
              if (hpInput !== '') {
                updateHp.mutate(normalizeNumber(hpInput))
              }
            }}
          />
        </footer>
      )}

      {/* Footer ДМа */}
      {isDM && activeFight && (
        <footer className="fixed bottom-0 left-0 right-0 p-2 bg-dark-hover text-white flex gap-2 overflow-x-auto z-50">
          {participants
            .filter(p => p.is_enemy)
            .map(enemy => (
              <button
                key={enemy.id}
                onClick={() => {
                  setSelectedEnemy(enemy)
                  setEnemyHpInput(enemy.current_hp)
                  setShowEnemyHpModal(true)
                }}
                className="px-3 py-1 rounded  hover:bg-accent-hover cursor-pointer"
              >
                {enemy.name}
              </button>
            ))}
        </footer>
      )}

      {/* Enemy full form modal */}
      {showEnemyForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark text-light p-6 rounded-xl shadow-xl w-96">
            <h3 className="mb-4">{editingEnemy ? 'Редактировать врага' : 'Добавить врага'}</h3>
            <div className="space-y-2">
              <Input
                label="Имя"
                value={enemyForm.name}
                onChange={e => setEnemyForm({ ...enemyForm, name: e.target.value })}
              />
              <Input
                label="AC"
                type="number"
                value={enemyForm.ac}
                onChange={e =>
                  setEnemyForm({
                    ...enemyForm,
                    ac: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
              />
              <Input
                label="Текущие HP"
                type="number"
                value={enemyForm.currentHp}
                onChange={e =>
                  setEnemyForm({
                    ...enemyForm,
                    currentHp: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
              />
              <Input
                label="Максимум HP"
                type="number"
                value={enemyForm.maxHp}
                onChange={e =>
                  setEnemyForm({
                    ...enemyForm,
                    maxHp: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
              />
              <Input
                label="Инициатива"
                type="number"
                value={enemyForm.initiative}
                onChange={e =>
                  setEnemyForm({
                    ...enemyForm,
                    initiative: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex gap-2 mt-4">
              <ActionButton
                type="save"
                onClick={() => {
                  if (editingEnemy) {
                    updateEnemy.mutate({
                      id: editingEnemy.id,
                      name: enemyForm.name,
                      currentHp: normalizeNumber(enemyForm.currentHp),
                      maxHp: normalizeNumber(enemyForm.maxHp),
                      ac: normalizeNumber(enemyForm.ac),
                      initiative: normalizeNumber(enemyForm.initiative),
                    })
                  } else {
                    addEnemy.mutate({
                      name: enemyForm.name,
                      currentHp: normalizeNumber(enemyForm.currentHp),
                      maxHp: normalizeNumber(enemyForm.maxHp),
                      ac: normalizeNumber(enemyForm.ac),
                      initiative: normalizeNumber(enemyForm.initiative),
                    })
                  }
                  setShowEnemyForm(false)
                }}
              />
              <ActionButton type="cancel" onClick={() => setShowEnemyForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Enemy quick HP modal */}
      {showEnemyHpModal && selectedEnemy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark text-light p-6 rounded-xl shadow-xl w-80">
            <h3 className="mb-4">{selectedEnemy.name}</h3>
            <Input
              label="Текущие HP"
              type="number"
              value={enemyHpInput}
              onChange={e =>
                setEnemyHpInput(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
            <div className="flex gap-2 mt-4">
              <ActionButton
                type="save"
                onClick={() => {
                  updateEnemy.mutate({
                    id: selectedEnemy.id,
                    name: selectedEnemy.name,
                    currentHp: normalizeNumber(enemyHpInput),
                    maxHp: selectedEnemy.max_hp,
                    ac: selectedEnemy.armor_class,
                    initiative: selectedEnemy.initiative,
                  })
                  setShowEnemyHpModal(false)
                }}
              />
              <ActionButton type="cancel" onClick={() => setShowEnemyHpModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
