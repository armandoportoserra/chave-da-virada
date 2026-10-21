import { createClient } from "@supabase/supabase-js";

/** Cliente de servidor com service role — nunca importar em componentes cliente. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase não configurado (ver .env.example).");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function supabaseConfigurado() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
