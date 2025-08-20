
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

  const [initiativeInput, setInitiativeInput] = useState<number>(0)
  const [hpInput, setHpInput] = useState<number | null>(null)
  const [showInitiativeModal, setShowInitiativeModal] = useState(false)

  // Enemy add/edit modal
  const [showEnemyForm, setShowEnemyForm] = useState(false)
  const [editingEnemy, setEditingEnemy] = useState<any | null>(null)
  const [enemyForm, setEnemyForm] = useState({
    name: '',
    ac: 10,
    currentHp: 10,
    maxHp: 10,
    initiative: 10,
  })

  // Enemy quick HP modal
  const [showEnemyHpModal, setShowEnemyHpModal] = useState(false)
  const [enemyHpInput, setEnemyHpInput] = useState<number | null>(null)
  const [selectedEnemy, setSelectedEnemy] = useState<any | null>(null)

  const isDM = account?.character_name === 'DM'
  const myParticipant = participants.find(p => p.account_id === account?.id)
  const participantJoined = !!myParticipant

  // экран входа инициативы
  if (activeFight && !isDM && !participantJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
        <h2 className="text-xl font-bold">Вход в бой</h2>
        <Input
          label="Инициатива"
          type="number"
          value={initiativeInput}
          onChange={e => setInitiativeInput(Number(e.target.value))}
        />
        <ActionButton type="save" onClick={() => joinFight.mutate(initiativeInput)} />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      {myParticipant && !isDM && (
        <header className="fixed top-0 left-0 right-0 text-white p-2 flex justify-between items-center z-50">
          <div>Инициатива: {myParticipant.initiative}</div>
          <ActionButton type="edit" onClick={() => setShowInitiativeModal(true)} />
        </header>
      )}

      {/* Модалка смены инициативы */}
      {showInitiativeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="p-6 rounded-xl shadow-xl bg-white">
            <h3 className="mb-2">Изменить инициативу</h3>
            <Input
              label="Новое значение"
              type="number"
              value={initiativeInput}
              onChange={e => setInitiativeInput(Number(e.target.value))}
            />
            <div className="flex gap-2 mt-4">
              <ActionButton
                type="save"
                onClick={() => {
                  joinFight.mutate(initiativeInput)
                  setShowInitiativeModal(false)
                }}
              />
              <ActionButton type="cancel" onClick={() => setShowInitiativeModal(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="pt-16 pb-16 p-4 text-white">
        {!activeFight ? (
          <div className="text-center">
            <p>Нет активного боя</p>
            {isDM && <ActionButton type="add" onClick={() => createFight.mutate()} />}
          </div>
        ) : (
          <>
            {isDM && (
              <div className="flex gap-2 mb-4">
                <ActionButton type="cancel" onClick={() => finishFight.mutate()} />
                <ActionButton
                  type="add"
                  onClick={() => {
                    setEditingEnemy(null)
                    setEnemyForm({ name: '', ac: 10, currentHp: 10, maxHp: 10, initiative: 10 })
                    setShowEnemyForm(true)
                  }}
                />
              </div>
            )}

            <h2 className="text-xl mb-4">Участники боя</h2>
            <ul className="space-y-2">
              {participants.map(p => (
                <li key={p.id} className="p-2 rounded-xl shadow border border-gray-500">
                  <div className="flex justify-between items-center">
                    <span>
                      {p.name} (Инициатива: {p.initiative})
                    </span>
                    {!p.is_enemy || isDM ? (
                      <span>
                        HP: {p.current_hp}/{p.max_hp} | AC: {p.armor_class}
                      </span>
                    ) : (
                      <span className="text-gray-500"> </span>
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
        <footer className="fixed bottom-0 left-0 right-0 text-white p-2 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <Input
              label="HP"
              type="number"
              value={hpInput ?? myParticipant.current_hp}
              onChange={e => setHpInput(Number(e.target.value))}
              className="w-20"
            />
            <span> / {myParticipant.max_hp}</span>
          </div>
          <ActionButton
            type="save"
            onClick={() => {
              if (hpInput !== null) {
                updateHp.mutate(hpInput)
              }
            }}
          />
        </footer>
      )}

      {/* Footer ДМа */}
      {isDM && activeFight && (
        <footer className="fixed bottom-0 left-0 right-0 p-2 border-t text-white flex gap-2 overflow-x-auto z-50">
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
                className="px-3 py-1 rounded border border-gray-500 hover:bg-gray-700"
              >
                {enemy.name}
              </button>
            ))}
        </footer>
      )}

      {/* Enemy full form modal */}
      {showEnemyForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-xl w-96">
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
                onChange={e => setEnemyForm({ ...enemyForm, ac: Number(e.target.value) })}
              />
              <Input
                label="Текущие HP"
                type="number"
                value={enemyForm.currentHp}
                onChange={e => setEnemyForm({ ...enemyForm, currentHp: Number(e.target.value) })}
              />
              <Input
                label="Максимум HP"
                type="number"
                value={enemyForm.maxHp}
                onChange={e => setEnemyForm({ ...enemyForm, maxHp: Number(e.target.value) })}
              />
              <Input
                label="Инициатива"
                type="number"
                value={enemyForm.initiative}
                onChange={e => setEnemyForm({ ...enemyForm, initiative: Number(e.target.value) })}
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
                      currentHp: enemyForm.currentHp,
                      maxHp: enemyForm.maxHp,
                      ac: enemyForm.ac,
                      initiative: enemyForm.initiative,
                    })
                  } else {
                    addEnemy.mutate(enemyForm)
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
          <div className="bg-white text-black p-6 rounded-xl shadow-xl w-80">
            <h3 className="mb-4">HP: {selectedEnemy.name}</h3>
            <Input
              label="Текущие HP"
              type="number"
              value={enemyHpInput ?? selectedEnemy.current_hp}
              onChange={e => setEnemyHpInput(Number(e.target.value))}
            />
            <div className="flex gap-2 mt-4">
              <ActionButton
                type="save"
                onClick={() => {
                  updateEnemy.mutate({
                    id: selectedEnemy.id,
                    name: selectedEnemy.name,
                    currentHp: enemyHpInput ?? selectedEnemy.current_hp,
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
