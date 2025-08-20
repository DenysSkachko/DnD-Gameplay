import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aigisyqawcljyphuitmy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ2lzeXFhd2NsanlwaHVpdG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUwODExMiwiZXhwIjoyMDcxMDg0MTEyfQ.A37LimEJQOJRRt9pZAWOSxbraP0f5qR2IN1FDoMGxUc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
