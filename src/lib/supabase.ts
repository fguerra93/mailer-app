import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    // Return a dummy client that won't crash but won't work either
    _supabase = createClient("https://placeholder.supabase.co", "placeholder");
  } else {
    _supabase = createClient(url, key);
  }

  return _supabase;
}

// Convenience export
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});

// SQL para crear las tablas en Supabase (ejecutar desde el dashboard de Supabase):
/*
CREATE TABLE IF NOT EXISTS envios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destinatario_email TEXT NOT NULL,
  destinatario_nombre TEXT DEFAULT '',
  asunto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  error TEXT,
  proveedor TEXT NOT NULL DEFAULT 'resend',
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proveedor TEXT NOT NULL DEFAULT 'resend',
  api_key TEXT NOT NULL,
  desde_email TEXT NOT NULL,
  desde_nombre TEXT DEFAULT '',
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_envios_fecha ON envios(fecha);
CREATE INDEX idx_envios_estado ON envios(estado);
*/
