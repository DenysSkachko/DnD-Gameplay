import { FaCoins } from "react-icons/fa6";
type Props = {
  name: string
  quantity?: number
  gold?: number
  description?: string
  onEdit?: () => void
}

const InventoryCard = ({ name, quantity = 1, gold = 0, description, onEdit }: Props) => {

  return (
    <div
      className="flex flex-col px-5 py-3 rounded-lg bg-dark-hover w-full cursor-pointer"
      onClick={onEdit}
    >
      {/* Основная строка с именем, количеством и золотом */}
      <div className="flex justify-between items-center w-full">
        <span className="font-semibold text-lg text-white">{name} {quantity > 0 && <span className="text-gray-300 text-sm">{quantity} шт.</span>} </span>
        
        <div className="flex items-center">
          
          {gold > 0 && <p className="text-yellow-400 font-bold text-xl flex items-center gap-1">{gold} <span><FaCoins className="text-lg" /></span></p> }
        </div>
      </div>

      {description && (
        <div className="mt-2 flex gap-3 items-end text-gray-300 text-sm relative">
          <p className="pr-12 break-words max-w-70">{description}</p>
        </div>
      )}
    </div>
  )
}

export default InventoryCard
