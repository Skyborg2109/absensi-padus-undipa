import { createContext, useContext, useEffect, useState } from "react";
import { anggota as anggotaBenih } from "../data/mock.js";
import { supabase, supabaseAktif } from "./supabase.js";

const KUNCI_SESI = "padus-sesi";
const SANDI_DEMO = "padus2026";

const Konteks = createContext(null);

function daftarAnggotaAktif() {
  try {
    const mentah = localStorage.getItem("padus-toko-v2");
    if (mentah) {
      const d = JSON.parse(mentah);
      if (d && Array.isArray(d.daftarAnggota) && d.daftarAnggota.length > 0) return d.daftarAnggota;
    }
  } catch {}
  return anggotaBenih;
}

function bacaSesi() {
  try {
    const mentah = localStorage.getItem(KUNCI_SESI);
    if (!mentah) return null;
    const sesi = JSON.parse(mentah);
    if (!sesi || (sesi.peran !== "admin" && sesi.peran !== "anggota")) return null;
    return sesi;
  } catch {
    return null;
  }
}

function profilPengguna(profil, sesi) {
  const metadata = sesi.user.user_metadata ?? {};
  return {
    peran: profil?.role ?? metadata.peran ?? metadata.role,
    id: profil?.id ?? sesi.user.id,
    userId: sesi.user.id,
    nama: profil?.nama ?? metadata.nama ?? sesi.user.email,
    nim: profil?.nim ?? metadata.nim ?? "",
    suara: profil?.suara ?? metadata.suara ?? "Sopran",
  };
}

async function profilUntukSesi(sesi) {
  if (!sesi?.user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,nama,nim,suara,role")
    .eq("user_id", sesi.user.id)
    .eq("aktif", true)
    .maybeSingle();
  return profilPengguna(data, sesi);
}

function pesanGalatAuth(message) {
  if (/invalid login credentials/i.test(message)) return "NIM, nama lengkap, atau kata sandi salah.";
  if (/email not confirmed/i.test(message)) return "Akun belum dikonfirmasi. Hubungi admin.";
  return message || "Autentikasi Supabase gagal.";
}

async function pesanFungsiLogin(error, fallback) {
  let pesan = error?.message || fallback;
  if (error?.context?.json) {
    try {
      const body = await error.context.json();
      if (body?.error) pesan = body.error;
    } catch {}
  }
  if (/failed to send a request|fetch failed|network error/i.test(pesan)) {
    return "Login anggota belum dapat diakses. Deploy Edge Function dengan `supabase functions deploy login-member`, lalu coba lagi.";
  }
  return pesan;
}

export function PenyediaAuth({ children }) {
  const [pengguna, setPengguna] = useState(null);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let dibatalkan = false;
    if (supabaseAktif) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (dibatalkan) return;
        const profil = await profilUntukSesi(data.session);
        if (!dibatalkan) {
          setPengguna(profil?.peran === "admin" || profil?.peran === "anggota" ? profil : null);
          setSiap(true);
        }
      });
    } else {
      setPengguna(bacaSesi());
      setSiap(true);
    }
    return () => {
      dibatalkan = true;
    };
  }, []);

  async function masukAnggota(identitas, sandi) {
    if (supabaseAktif) {
      const { data, error } = await supabase.functions.invoke("login-member", {
        body: { identifier: identitas, password: sandi },
      });
      if (error) return { gagal: data?.error ?? await pesanFungsiLogin(error, "Login anggota gagal.") };
      if (!data?.session) return { gagal: "Login anggota tidak mengembalikan sesi." };
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (sessionError || !sessionData?.user) return { gagal: "Sesi login tidak dapat disimpan." };
      const profil = await profilUntukSesi({ user: sessionData.user });
      if (!profil || profil.peran !== "anggota") {
        await supabase.auth.signOut();
        return { gagal: "Akun ini tidak terdaftar sebagai anggota." };
      }
      setPengguna(profil);
      return { ok: true };
    }

    const bersih = identitas.trim();
    const kunci = bersih.toLowerCase();
    const daftar = daftarAnggotaAktif();
    const cocok = daftar.find((a) => a.nim === bersih || a.nama.toLowerCase() === kunci);
    if (!cocok) return { gagal: "NIM atau nama lengkap tidak terdaftar. Periksa kembali." };
    if (sandi !== SANDI_DEMO) return { gagal: "Kata sandi salah. Coba lagi atau hubungi pelatih." };
    const sesi = { peran: "anggota", id: cocok.id, nama: cocok.nama, nim: cocok.nim, suara: cocok.suara };
    localStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
    setPengguna(sesi);
    return { ok: true };
  }

  async function masukAdmin(nama, sandi) {
    if (supabaseAktif) {
      const emailAdmin = import.meta.env.VITE_SUPABASE_ADMIN_EMAIL || "admin@undipa.ac.id";
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailAdmin, password: sandi });
      if (error) return { gagal: pesanGalatAuth(error.message) };
      const profil = await profilUntukSesi(data.session);
      if (!profil || profil.peran !== "admin") {
        await supabase.auth.signOut();
        return { gagal: "Akun ini tidak terdaftar sebagai admin." };
      }
      setPengguna(profil);
      return { ok: true };
    }

    if (nama.trim().toLowerCase() !== "admin") return { gagal: "Nama pengguna admin tidak dikenal." };
    if (sandi !== SANDI_DEMO) return { gagal: "Kata sandi salah. Coba lagi." };
    const sesi = { peran: "admin", nama: "Admin Padus" };
    localStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
    setPengguna(sesi);
    return { ok: true };
  }

  async function gantiPassword(sandiLama, sandiBaru) {
    if (String(sandiBaru ?? "").length < 8) return { gagal: "Password baru minimal 8 karakter." };
    if (sandiLama === sandiBaru) return { gagal: "Password baru harus berbeda dari password lama." };
    if (supabaseAktif) {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email ?? (pengguna?.nim ? `${pengguna.nim}@undipa.ac.id` : null);
      if (!email) return { gagal: "Email internal akun tidak ditemukan." };
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: sandiLama,
      });
      if (loginError) return { gagal: "Password lama salah." };
      const { error: updateError } = await supabase.auth.updateUser({ password: sandiBaru });
      if (updateError) return { gagal: updateError.message || "Password baru gagal disimpan." };
      return { ok: true };
    }

    const member = daftarAnggotaAktif().find((a) => a.id === pengguna?.id || a.nim === pengguna?.nim);
    if (!member) return { gagal: "Anggota tidak ditemukan." };
    const key = `padus-sandi-${member.id}`;
    const sandiTersimpan = localStorage.getItem(key) || SANDI_DEMO;
    if (sandiLama !== sandiTersimpan) return { gagal: "Password lama salah." };
    localStorage.setItem(key, sandiBaru);
    return { ok: true };
  }

  async function keluar() {
    if (supabaseAktif) await supabase.auth.signOut();
    localStorage.removeItem(KUNCI_SESI);
    setPengguna(null);
  }

  return (
    <Konteks.Provider value={{ pengguna, siap, masukAnggota, masukAdmin, gantiPassword, keluar, supabaseAktif }}>
      {children}
    </Konteks.Provider>
  );
}

export function pakaiAuth() {
  return useContext(Konteks);
}
