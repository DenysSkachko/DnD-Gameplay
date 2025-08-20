
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type CharacterSavingThrow = {
  id: number;
  character_id: number;
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
};

// --- Получение ---
export const useCharacterSavingThrows = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ["character_saving_throws", account?.id],
    queryFn: async (): Promise<CharacterSavingThrow> => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_saving_throws")
        .select("*")
        .eq("character_id", account.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });
};

// --- Создание ---
export const useCreateCharacterSavingThrows = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newThrows: Omit<CharacterSavingThrow, "id" | "character_id">) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_saving_throws")
        .insert([{ ...newThrows, character_id: Number(account.id) }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_saving_throws", account?.id] });
    },
  });
};

// --- Обновление ---
export const useUpdateCharacterSavingThrows = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: Partial<CharacterSavingThrow> & { id: number }) => {
      const { data, error } = await supabase
        .from("character_saving_throws")
        .update(updated)
        .eq("id", updated.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["character_saving_throws", variables.id] });
    },
  });
};
