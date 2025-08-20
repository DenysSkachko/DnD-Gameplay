
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type CharacterStat = {
  id: number;
  character_id: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiency_bonus: number;
};

// --- Получение характеристик персонажа ---
export const useCharacterStats = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ["character_stats", account?.id],
    queryFn: async (): Promise<CharacterStat> => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_stats")
        .select("*")
        .eq("character_id", account.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });
};

// --- Создание характеристик ---
export const useCreateCharacterStats = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStats: Omit<CharacterStat, "id" | "character_id">) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_stats")
        .insert([{ ...newStats, character_id: Number(account.id) }]) 
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_stats", account?.id] });
    },
  });
};

// --- Обновление характеристик ---
export const useUpdateCharacterStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedStats: Partial<CharacterStat> & { id: number }) => {
      const { data, error } = await supabase
        .from("character_stats")
        .update(updatedStats)
        .eq("id", updatedStats.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["character_stats", variables.id] });
    },
  });
};
