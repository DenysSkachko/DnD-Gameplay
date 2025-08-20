
import type { ButtonHTMLAttributes, JSX } from "react"
import { FaCheck } from "react-icons/fa";
import { FaBan } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";

type ActionButtonType = "edit" | "delete" | "add" | "save" | "cancel"

type ActionButtonProps = {
  type: ActionButtonType
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"]
  className?: string
}

const ActionButton = ({ type, onClick, className = "" }: ActionButtonProps) => {
  const icons: Record<ActionButtonType, JSX.Element> = {
    edit: <FaPencilAlt />,
    delete: <FaBan />,
    add: <FaPlus />,
    save: <FaCheck />,
    cancel: <FaArrowLeft />,
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-11 h-11 bg-dark-hover text-3xl text-accent  rounded-md flex items-center justify-center cursor-pointer ${className}`}
    >
      {icons[type]}
    </button>
  )
}

export default ActionButton
