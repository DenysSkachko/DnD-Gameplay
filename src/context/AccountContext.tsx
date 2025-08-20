import { createContext, useContext, useState, type ReactNode } from 'react'

export type Account = {
  id: string
  character_name: string
}

type AccountContextType = {
  account: Account | null
  setAccount: (acc: Account) => void
  logout: () => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (!context) throw new Error('useAccount must be used within AccountProvider')
  return context
}

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccountState] = useState<Account | null>(() => {
    const saved = localStorage.getItem('account')
    return saved ? JSON.parse(saved) : null
  })

  const setAccount = (acc: Account) => {
    localStorage.setItem('account', JSON.stringify(acc))
    setAccountState(acc)
  }

  const logout = () => {
    localStorage.removeItem('account')
    setAccountState(null)
  }

  return (
    <AccountContext.Provider value={{ account, setAccount, logout }}>
      {children}
    </AccountContext.Provider>
  )
}
