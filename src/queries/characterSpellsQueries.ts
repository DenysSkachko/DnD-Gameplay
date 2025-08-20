import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type CharacterSpell = {
  id: number;
  character_id: number;
  name: string;
  level?: number;
  concentration?: boolean;
  action?: "main" | "bonus";
  range?: string;
  duration?: string;
  description?: string;
};

export const useCharacterSpells = () => {
  const { account } = useAccount();
  return useQuery({
    queryKey: ["character_spells", account?.id],
    queryFn: async (): Promise<CharacterSpell[]> => {
      if (!account) throw new Error("Нет аккаунта");
      const { data, error } = await supabase
        .from("character_spells")
        .select("*")
        .eq("character_id", account.id);
      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });
};

export const useCreateCharacterSpell = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSpell: Omit<CharacterSpell, "id" | "character_id">) => {
      if (!account) throw new Error("Нет аккаунта");
      const { data, error } = await supabase
        .from("character_spells")
        .insert([{ ...newSpell, character_id: account.id }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character_spells", account?.id] }),
  });
};

export const useUpdateCharacterSpell = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedSpell: Partial<CharacterSpell> & { id: number }) => {
      if (!account) throw new Error("Нет аккаунта");
      const { data, error } = await supabase
        .from("character_spells")
        .update(updatedSpell)
        .eq("id", updatedSpell.id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character_spells", account?.id] }),
  });
};

export const useDeleteCharacterSpell = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      if (!account) throw new Error("Нет аккаунта")
      const { data, error } = await supabase
        .from("character_spells")
        .delete()
        .eq("id", id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character_spells", account?.id] }),
  })
}