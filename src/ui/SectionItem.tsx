import { useState } from 'react'
import type { ReactNode } from 'react'

type Props = {
  title?: string
  children: ReactNode
  icon?: ReactNode
  description?: string
}

const SectionItem = ({ title, children, icon, description }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="flex flex-col px-5 py-2 rounded-lg bg-dark-hover relative w-full cursor-pointer"
      onClick={() => description && setOpen(!open)}
    >
      {title && <span className="font-medium text-sm text-gray-400">{title}</span>}
      <span className="font-bold text-lg">{children}</span>

      {icon && (
        <span className="text-gray-400 text-3xl absolute right-5 top-1/2 -translate-y-1/2">
          {icon}
        </span>
      )}

      {description && (
        <div
          className={`transition-all duration-300 overflow-hidden text-gray-300 text-sm mt-2 ${
            open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {description}
        </div>
      )}
    </div>
  )
}

export default SectionItem
