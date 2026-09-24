import { createContext, useContext, useEffect, useState } from "react";
import { anggota as anggotaBenih } from "../data/mock.js";
import { supabase, supabaseAktif } from "./supabase.js";

const KUNCI_SESI = "padus-sesi";
const SANDI_DEMO = "padus2026";

const Konteks = createContext(null);

function emailAnggota(identitas) {
  const bersih = identitas.trim();
  return bersih.includes("@") ? bersih.toLowerCase() : `${bersih}@undipa.ac.id`;
}

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
  if (/invalid login credentials/i.test(message)) return "NIM, surel, atau kata sandi salah.";
  if (/email not confirmed/i.test(message)) return "Akun belum dikonfirmasi. Hubungi admin.";
  return message || "Autentikasi Supabase gagal.";
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailAnggota(identitas),
        password: sandi,
      });
      if (error) return { gagal: pesanGalatAuth(error.message) };
      const profil = await profilUntukSesi(data.session);
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
    const cocok = daftar.find((a) => a.nim === bersih || `${a.nim}@undipa.ac.id` === kunci);
    if (!cocok) return { gagal: "NIM atau surel tidak terdaftar. Periksa kembali." };
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

  async function keluar() {
    if (supabaseAktif) await supabase.auth.signOut();
    localStorage.removeItem(KUNCI_SESI);
    setPengguna(null);
  }

  return (
    <Konteks.Provider value={{ pengguna, siap, masukAnggota, masukAdmin, keluar, supabaseAktif }}>
      {children}
    </Konteks.Provider>
  );
}

export function pakaiAuth() {
  return useContext(Konteks);
}
