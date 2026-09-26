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

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Silakan masuk sebagai admin." }, 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: sessionData, error: sessionError } = await authClient.auth.getUser();
  if (sessionError || !sessionData.user) return json({ error: "Sesi admin tidak valid." }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: adminProfile } = await adminClient
    .from("profiles")
    .select("id,role,aktif")
    .eq("user_id", sessionData.user.id)
    .eq("role", "admin")
    .eq("aktif", true)
    .maybeSingle();
  if (!adminProfile) return json({ error: "Akses admin tidak diizinkan." }, 403);

  const body = await request.json().catch(() => ({}));
  const profileId = String(body.profileId ?? "").trim();
  const password = String(body.password ?? "");
  if (!profileId) return json({ error: "Anggota tidak ditemukan." }, 400);
  if (password.length < 8) return json({ error: "Password minimal 8 karakter." }, 400);

  const { data: target, error: targetError } = await adminClient
    .from("profiles")
    .select("id,nama,nim,user_id,role,aktif")
    .eq("id", profileId)
    .eq("role", "anggota")
    .maybeSingle();
  if (targetError) return json({ error: targetError.message || "Profil anggota gagal dibaca." }, 500);
  if (!target) return json({ error: "Anggota tidak ditemukan." }, 404);
  if (!target.aktif) return json({ error: `${target.nama} sedang nonaktif. Aktifkan kembali sebelum mengganti sandi.` }, 409);

  let userId = target.user_id ?? null;
  if (!userId) {
    const email = target.nim ? `${target.nim}@undipa.ac.id` : null;
    if (!email) return json({ error: "Email internal akun tidak bisa ditentukan. Isi NIM anggota lebih dulu." }, 409);
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) return json({ error: listError.message || "Daftar akun Auth gagal dibaca." }, 500);
    userId = (users?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase())?.id ?? null;
  }
  if (!userId) return json({ error: "Akun Auth anggota belum terhubung. Deploy ulang create-member atau perbaiki user_id profil." }, 404);

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, { password });
  if (updateError) return json({ error: updateError.message || "Kata sandi gagal diganti." }, 400);

  return json({ ok: true, nama: target.nama, nim: target.nim ?? null });
});
