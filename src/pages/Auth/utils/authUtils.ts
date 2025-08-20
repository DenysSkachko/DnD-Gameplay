import { supabase } from "@/lib/supabaseClient";

export const login = async (name: string, password: string) => {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("character_name", name)
    .eq("password", password)
    .single();
  return { data, error };
};

export const createAccount = async (name: string, password: string) => {
  const { data, error } = await supabase
    .from("accounts")
    .insert([{ character_name: name, password }])
    .select()
    .single();
  return { data, error };
};
