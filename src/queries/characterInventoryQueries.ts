
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "@/context/AccountContext";

export type CharacterInventory = {
  id: number;
  character_id: number;
  item_name: string;
  quantity: number | null;
  description: string | null;
  gold: number | null;
};

// --- Получение инвентаря персонажа ---
export const useCharacterInventory = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ["character_inventory", account?.id],
    queryFn: async (): Promise<CharacterInventory[]> => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_inventory")
        .select("*")
        .eq("character_id", account.id);

      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });
};

// --- Создание нового предмета ---
export const useCreateInventoryItem = () => {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<CharacterInventory, "id" | "character_id">) => {
      if (!account) throw new Error("Нет аккаунта");

      const { data, error } = await supabase
        .from("character_inventory")
        .insert([{ ...item, character_id: account.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_inventory", account?.id] });
    },
  });
};

// --- Обновление предмета ---
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<CharacterInventory> & { id: number }) => {
      const { data, error } = await supabase
        .from("character_inventory")
        .update(item)
        .eq("id", item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character_inventory"] });
    },
  });
};

// --- Удаление предмета ---
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("character_inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["character_inventory"] });
    },
  });
};
