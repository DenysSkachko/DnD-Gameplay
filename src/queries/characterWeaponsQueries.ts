import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type CharacterWeapon = {
  id: number;
  character_id: number;
  name: string;
  damage_dice: string;        
  damage_stat: string;        
  extra_damage: number | null;
  use_proficiency: boolean;
};

// --- Получение оружия ---
export const useCharacterWeapons = () => {
  const { account } = useAccount();
  return useQuery({
    queryKey: ["character_weapons", account?.id],
    queryFn: async (): Promise<CharacterWeapon[]> => {
      if (!account) throw new Error("Нет аккаунта");
      const { data, error } = await supabase
        .from("character_weapons")
        .select("*")
        .eq("character_id", account.id);
      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });
};

// --- Создание оружия ---
export const useCreateWeapon = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weapon: Omit<CharacterWeapon, "id" | "character_id">) => {
      if (!account) throw new Error("Нет аккаунта");
      const { data, error } = await supabase
        .from("character_weapons")
        .insert([{ ...weapon, character_id: account.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_weapons", account?.id] });
    },
  });
};

// --- Обновление оружия ---
export const useUpdateWeapon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (weapon: Partial<CharacterWeapon> & { id: number }) => {
      const { data, error } = await supabase
        .from("character_weapons")
        .update(weapon)
        .eq("id", weapon.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, weapon) => {
      queryClient.invalidateQueries({ queryKey: ["character_weapons", weapon.character_id] });
    },
  });
};

// --- Удаление оружия ---
export const useDeleteWeapon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("character_weapons")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["character_weapons"] });
    },
  });
};
