
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type Character = {
  id: number;
  account_id: number;
  character_name: string;
  race: string;
  class: string;
};

// --- Получение персонажа ---
export const useCharacter = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ["character", account?.id],
    queryFn: async (): Promise<Character | null> => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("account_id", account.id)
        .maybeSingle(); // ✅ вместо single()

      if (error) throw error;
      return data; // может быть null
    },
    enabled: !!account,
  });
};


// --- Создание персонажа ---
export const useCreateCharacter = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newChar: Omit<Character, "id" | "account_id">) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("characters")
        .insert([{ ...newChar, account_id: account.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", account?.id] });
    },
  });
};

// --- Обновление персонажа ---
export const useUpdateCharacter = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedChar: Partial<Character> & { id: number }) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("characters")
        .update(updatedChar)
        .eq("id", updatedChar.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", account?.id] });
    },
  });
};
