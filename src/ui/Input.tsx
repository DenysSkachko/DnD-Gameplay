import { type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const Input = ({ className = '', label, id, type, ...props }: Props) => {
  const numberStyles =
    type === 'number'
      ? 'appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
      : ''

  return (
    <div className="flex flex-col space-y- relative">
      {label && (
        <label
          htmlFor={id}
          className="absolute -top-2.5 left-3 px-3 bg-accent text-sm font-medium text-light"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full border rounded-lg font-bold px-5 py-3 text-xl focus:outline-none focus:border-accent ${numberStyles} ${className}`}
        {...props}
      />
    </div>
  )
}

export default Input
