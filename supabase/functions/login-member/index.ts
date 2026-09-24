import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function normalisasi(nilai) {
  return String(nilai ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

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
  const identifier = String(body.identifier ?? "").trim();
  const password = String(body.password ?? "");
  if (!identifier || !password) return json({ error: "NIM atau nama lengkap dan kata sandi wajib diisi." }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const profilColumns = "id,nama,nim,suara,role,aktif,user_id";
  const { data: profilNim } = await adminClient
    .from("profiles")
    .select(profilColumns)
    .eq("nim", identifier)
    .eq("role", "anggota")
    .eq("aktif", true)
    .maybeSingle();
  let profil = profilNim ?? null;

  if (!profil) {
    const { data: kandidat } = await adminClient
      .from("profiles")
      .select(profilColumns)
      .eq("role", "anggota")
      .eq("aktif", true);
    const target = normalisasi(identifier);
    const cocok = (kandidat ?? []).filter((item) => normalisasi(item.nama) === target || normalisasi(item.nim) === target);
    if (cocok.length > 1) return json({ error: "Nama lengkap tidak unik. Gunakan NIM untuk masuk." }, 409);
    profil = cocok[0] ?? null;
  }

  if (!profil) return json({ error: "NIM atau nama lengkap tidak terdaftar." }, 401);

  const authClient = createClient(supabaseUrl, anonKey);
  const { data, error } = await authClient.auth.signInWithPassword({
    email: `${profil.nim}@undipa.ac.id`,
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
