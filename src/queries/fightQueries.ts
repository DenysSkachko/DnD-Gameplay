import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { useAccount } from "@/context/AccountContext"
import { useEffect } from "react"

// ===== Активный бой =====
export const useActiveFight = () => {
  return useQuery({
    queryKey: ["active_fight"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fights")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") throw error
      return data
    },
  })
}

// ===== Участники =====
export const useFightParticipants = (fightId?: number) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["fight_participants", fightId],
    queryFn: async () => {
      if (!fightId) return []
      const { data, error } = await supabase
        .from("fight_participants")
        .select("*")
        .eq("fight_id", fightId)
        .order("initiative", { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!fightId,
  })

  // realtime подписка
  useEffect(() => {
    if (!fightId) return
    const channel = supabase
      .channel(`fight_participants_${fightId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fight_participants", filter: `fight_id=eq.${fightId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fightId, queryClient])

  return query
}

// ===== Создать бой (ДМ) =====
export const useCreateFight = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Нет аккаунта")
      // Завершаем старый активный бой
      await supabase.from("fights").update({ status: "finished" }).eq("status", "active")

      // Создаем новый бой
      const { data, error } = await supabase
        .from("fights")
        .insert([{ dm_id: account.id, status: "active" }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active_fight"] })
    },
  })
}

// ===== Завершить бой (ДМ) =====
export const useFinishFight = (fightId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!fightId) throw new Error("Нет id боя")

      await supabase.from("fights").update({ status: "finished" }).eq("id", fightId)
      await supabase.from("fight_participants").delete().eq("fight_id", fightId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active_fight"] })
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    },
  })
}

// ===== Добавить врага (ДМ) =====
export const useAddEnemy = (fightId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enemy: { name: string; currentHp: number; maxHp: number; ac: number; initiative: number }) => {
      if (!fightId) throw new Error("Нет активного боя")
      const { data, error } = await supabase
        .from("fight_participants")
        .insert([{
          fight_id: fightId,
          is_enemy: true,
          name: enemy.name,
          current_hp: enemy.currentHp,
          max_hp: enemy.maxHp,
          armor_class: enemy.ac,
          initiative: enemy.initiative,
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    },
  })
}

// ===== Вступление игрока / обновление инициативы =====
export const useJoinFight = (fightId?: number) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return useMutation({
    mutationFn: async (initiative: number) => {
      if (!fightId || !account) throw new Error("Нет активного боя или аккаунта")

      const { data: character } = await supabase
        .from("characters")
        .select("id, character_name")
        .eq("account_id", account.id)
        .single()

      if (!character) throw new Error("У аккаунта нет персонажа")

      const { data: combat } = await supabase
        .from("character_combat")
        .select("current_hp, max_hp, armor_class")
        .eq("character_id", character.id)
        .single()

      if (!combat) throw new Error("Нет данных character_combat")

      const { data: existing } = await supabase
        .from("fight_participants")
        .select("id")
        .eq("fight_id", fightId)
        .eq("account_id", account.id)
        .maybeSingle()

      if (existing) {
        await supabase.from("fight_participants")
          .update({
            initiative,
            current_hp: combat.current_hp,
            max_hp: combat.max_hp,
            armor_class: combat.armor_class,
            name: character.character_name,
            is_enemy: false,
          })
          .eq("id", existing.id)
      } else {
        await supabase.from("fight_participants").insert([{
          fight_id: fightId,
          account_id: account.id,
          is_enemy: false,
          name: character.character_name,
          current_hp: combat.current_hp,
          max_hp: combat.max_hp,
          armor_class: combat.armor_class,
          initiative,
        }])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    },
  })
}

// ===== Изменение своих HP (игрок) =====
export const useUpdateHP = (fightId?: number) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return useMutation({
    mutationFn: async (newHp: number) => {
      if (!fightId || !account) throw new Error("Нет боя или аккаунта")

      const { data: participant } = await supabase
        .from("fight_participants")
        .select("id")
        .eq("fight_id", fightId)
        .eq("account_id", account.id)
        .single()

      if (!participant) throw new Error("Не найден участник боя")

      await supabase.from("fight_participants")
        .update({ current_hp: newHp })
        .eq("id", participant.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    }
  })
}

// ===== Изменение врага (ДМ) =====
export const useUpdateEnemy = (fightId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enemy: { id: number; name?: string; currentHp?: number; maxHp?: number; ac?: number; initiative?: number }) => {
      if (!fightId) throw new Error("Нет боя")
      await supabase.from("fight_participants").update({
        name: enemy.name,
        current_hp: enemy.currentHp,
        max_hp: enemy.maxHp,
        armor_class: enemy.ac,
        initiative: enemy.initiative,
      }).eq("id", enemy.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    }
  })
}

// ===== Обновить HP любого участника (ДМ) =====
export const useUpdateParticipantHP = (fightId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, newHp }: { id: number; newHp: number }) => {
      if (!fightId) throw new Error("Нет боя")
      await supabase.from("fight_participants").update({ current_hp: newHp }).eq("id", id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    }
  })
}

// ===== Удаление врага =====
export const useDeleteEnemy = (fightId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enemyId: number) => {
      if (!fightId) throw new Error("Нет боя")
      await supabase.from("fight_participants").delete().eq("id", enemyId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fight_participants", fightId] })
    }
  })
}
