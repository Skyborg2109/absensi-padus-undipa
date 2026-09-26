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
  const nama = String(body.nama ?? "").trim();
  const nim = String(body.nim ?? "").trim();
  const suara = String(body.suara ?? "").trim();
  const password = String(body.password ?? "");
  if ((!nama && !nim) || !suara || !password) return json({ error: "Isi nama lengkap atau NIM, suara, dan password." }, 400);
  if (nim && !/^[0-9]{6,20}$/.test(nim)) return json({ error: "NIM harus terdiri dari 6–20 digit angka." }, 400);
  if (!["Sopran", "Alto", "Tenor", "Bas"].includes(suara)) return json({ error: "Kelompok suara tidak valid." }, 400);
  if (password.length < 8) return json({ error: "Password minimal 8 karakter." }, 400);

  if (nim) {
    const { data: existingProfile } = await adminClient.from("profiles").select("id").eq("nim", nim).maybeSingle();
    if (existingProfile) return json({ error: `NIM ${nim} sudah terdaftar.` }, 409);
  }

  const profileId = crypto.randomUUID();
  const namaTersimpan = nama || `Anggota NIM ${nim}`;
  const email = nim ? `${nim}@undipa.ac.id` : `anggota-${profileId}@undipa.ac.id`;
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "anggota", nama: namaTersimpan, display_name: namaTersimpan, nim: nim || null, suara },
  });
  if (createError || !created.user) return json({ error: createError?.message || "Akun Auth gagal dibuat." }, 400);

  const profile = {
    id: profileId,
    user_id: created.user.id,
    nama: namaTersimpan,
    nim: nim || null,
    suara,
    role: "anggota",
    angkatan: Number(nim?.slice(0, 4)) || new Date().getFullYear(),
    aktif: true,
  };
  const { data: savedProfile, error: profileError } = await adminClient
    .from("profiles")
    .insert(profile)
    .select("id,nama,nim,suara,angkatan,hadir,lambat,izin,sakit,alpa,potongan")
    .single();

  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: profileError.message || "Profil anggota gagal disimpan." }, 500);
  }

  return json({ profile: savedProfile, email });
});
