import { useState } from 'react'
import ActionButton from './ActionButton'

type SpellCardProps = {
  name: string
  level?: number
  action?: string
  range?: string
  duration?: string
  concentration?: boolean
  description?: string
  onEdit?: () => void
}

const SpellCard = ({
  name,
  level,
  action,
  range,
  duration,
  concentration,
  description,
  onEdit,
}: SpellCardProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="flex flex-col bg-dark-hover rounded-lg p-4 relative w-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => setOpen(!open)}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        {name && (
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-4">
            {level !== undefined && (
              <span className="text-sm rounded-full bg-pink-400 w-8 h-8 flex items-center justify-center">
                {level}
              </span>
            )}
            <span>{name}</span>
          </h3>
        )}
        {onEdit && (
          <ActionButton
            type="edit"
            onClick={e => {
              e.stopPropagation()
              onEdit()
            }}
          />
        )}
      </div>

      {/* Description */}
      {description && (
        <div
          className={`mt-3 text-gray-300 text-sm overflow-hidden transition-all duration-300 ${
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <span className="font-bold">{description}</span>
          {action && <div>Действие: {action}</div>}
          {range && <div>Дистанция: {range}</div>}
          {duration && <div>Длительность: {duration}</div>}
          {concentration && <div>Концентрация</div>}
        </div>
      )}
    </div>
  )
}

export default SpellCard
