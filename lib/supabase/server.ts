import { createClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && getSupabaseServerKey());
}

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serverKey = getSupabaseServerKey();

  if (!supabaseUrl || !serverKey) {
    return null;
  }

  return createClient(supabaseUrl, serverKey, {
    auth: {
      persistSession: false
    }
  });
}

function getSupabaseServerKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}
