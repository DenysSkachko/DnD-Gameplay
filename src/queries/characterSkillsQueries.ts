import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type CharacterSkills = {
  id: number;
  character_id: number;
  strength: boolean;
  athletics: boolean;
  dexterity: boolean;
  acrobatics: boolean;
  sleight_of_hand: boolean;
  stealth: boolean;
  intelligence: boolean;
  history: boolean;
  arcana: boolean;
  nature: boolean;
  investigation: boolean;
  religion: boolean;
  wisdom: boolean;
  perception: boolean;
  survival: boolean;
  medicine: boolean;
  insight: boolean;
  animal_handling: boolean;
  charisma: boolean;
  performance: boolean;
  intimidation: boolean;
  deception: boolean;
  persuasion: boolean;
};

// --- Получение навыков персонажа ---
export const useCharacterSkills = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ["character_skills", account?.id],
    queryFn: async (): Promise<CharacterSkills> => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_skills")
        .select("*")
        .eq("character_id", account.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });
};

// --- Создание навыков ---
export const useCreateCharacterSkills = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSkills: Omit<CharacterSkills, "id" | "character_id">) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_skills")
        .insert([{ ...newSkills, character_id: account.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_skills", account?.id] });
    },
  });
};

// --- Обновление навыков ---
export const useUpdateCharacterSkills = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedSkills: Partial<CharacterSkills> & { id: number }) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_skills")
        .update(updatedSkills)
        .eq("id", updatedSkills.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_skills", account?.id] });
    },
  });
};
