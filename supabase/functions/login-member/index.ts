import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }
  if (request.method !== "POST") return json({ error: "Metode tidak diizinkan." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: "Konfigurasi Edge Function belum lengkap." }, 500);

  const body = await request.json().catch(() => ({}));
  const nim = String(body.nim ?? "").trim();
  const password = String(body.password ?? "");
  if (!nim || !password) return json({ error: "NIM dan kata sandi wajib diisi." }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: profilNim } = await adminClient
    .from("profiles")
    .select("id,nama,nim,suara,role,aktif,user_id")
    .eq("nim", nim)
    .eq("role", "anggota")
    .eq("aktif", true)
    .maybeSingle();

  if (!profilNim) return json({ error: "NIM tidak terdaftar." }, 401);

  const authClient = createClient(supabaseUrl, anonKey);
  const { data, error } = await authClient.auth.signInWithPassword({
    email: `${profilNim.nim}@undipa.ac.id`,
    password,
  });
  if (error || !data.session) return json({ error: "Kata sandi salah." }, 401);

  return json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  });
});
