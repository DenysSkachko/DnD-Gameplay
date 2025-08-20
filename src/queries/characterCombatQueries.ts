import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAccount } from '@/context/AccountContext'

export type CharacterCombat = {
  id: number
  character_id: number
  current_hp?: number | null
  max_hp?: number | null
  armor_class?: number | null
  speed?: number | null
  initiative?: number | null
  inspiration?: boolean | null
}

// --- Получение боевой информации ---
export const useCharacterCombat = () => {
  const { account } = useAccount()

  return useQuery({
    queryKey: ['characterCombat', account?.id],
    queryFn: async (): Promise<CharacterCombat> => {
      if (!account) throw new Error('Нет аккаунта')

      const { data, error } = await supabase
        .from('character_combat')
        .select('*')
        .eq('character_id', account.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!account,
  })
}

// --- Создание боевой информации ---
export const useCreateCharacterCombat = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCombat: Omit<CharacterCombat, 'id' | 'character_id'>) => {
      if (!account) throw new Error('Нет аккаунта')

      const { data, error } = await supabase
        .from('character_combat')
        .insert([{ ...newCombat, character_id: account.id }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterCombat', account?.id] })
    },
  })
}

// --- Обновление боевой информации ---
export const useUpdateCharacterCombat = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedCombat: Partial<CharacterCombat> & { id: number }) => {
      if (!account) throw new Error('Нет аккаунта')

      const { data, error } = await supabase
        .from('character_combat')
        .update(updatedCombat)
        .eq('id', updatedCombat.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterCombat', account?.id] })
    },
  })
}
