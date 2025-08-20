import { type FC } from 'react'

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

const Checkbox: FC<CheckboxProps> = ({ checked, onChange, label }) => {
  return (
    <label className="inline-flex items-center cursor-pointer select-none">
      <span
        className={`w-5 h-5 flex items-center justify-center border-2 rounded-md transition-colors duration-200
          ${checked ? 'bg-accent border-accent' : 'bg-transparent border-gray-400 hover:border-accent'}
        `}
      >
        {checked && (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {label && <span className="ml-2 text-accent">{label}</span>}
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
    </label>
  )
}

export default Checkbox
