import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { anggota as anggotaBenih } from "../data/mock.js";
import { pakaiAuth } from "./auth.jsx";
import { supabase, supabaseAktif } from "./supabase.js";

const KUNCI_TOKO = "padus-toko-v2";
const Konteks = createContext(null);

let hitung = 0;
function idBaru(awalan) {
  hitung += 1;
  return `${awalan}${Date.now().toString(36)}${hitung}`;
}

function jamKini() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function jamMenit(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
}

function menitDariWaktu(nilai) {
  const bagian = String(nilai ?? "").split(/[.:]/).map(Number);
  if (bagian.length !== 2 || bagian.some((v) => Number.isNaN(v))) return null;
  return bagian[0] * 60 + bagian[1];
}

function tokenBaru() {
  const kini = new Date();
  const abjad = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let acak = "";
  for (let i = 0; i < 4; i++) acak += abjad[Math.floor(Math.random() * abjad.length)];
  const dd = String(kini.getDate()).padStart(2, "0");
  const mm = String(kini.getMonth() + 1).padStart(2, "0");
  return `PDU-${dd}${mm}-${acak}`;
}

function keadaanSegar() {
  return {
    daftarAnggota: anggotaBenih.map((a) => ({ ...a, aktif: true })),
    daftarAnggotaNonaktif: [],
    jadwal: [],
    sesi: null,
    absensi: [],
    pengajuan: [],
    koreksiRekap: [],
    notifikasi: [],
  };
}

function keadaanKosong() {
  return {
    daftarAnggota: [],
    daftarAnggotaNonaktif: [],
    jadwal: [],
    sesi: null,
    absensi: [],
    pengajuan: [],
    koreksiRekap: [],
    notifikasi: [],
  };
}

function keadaanAwal() {
  if (supabaseAktif) return keadaanKosong();
  try {
    const mentah = localStorage.getItem(KUNCI_TOKO);
    if (mentah) {
      const d = JSON.parse(mentah);
      if (d && Array.isArray(d.jadwal) && Array.isArray(d.absensi)) {
        return {
          ...keadaanSegar(),
          ...d,
          daftarAnggota: Array.isArray(d.daftarAnggota) ? d.daftarAnggota : anggotaBenih.map((a) => ({ ...a, aktif: true })),
          daftarAnggotaNonaktif: Array.isArray(d.daftarAnggotaNonaktif) ? d.daftarAnggotaNonaktif : [],
          jadwal: Array.isArray(d.jadwal) ? d.jadwal : [],
          absensi: Array.isArray(d.absensi) ? d.absensi : [],
          pengajuan: Array.isArray(d.pengajuan) ? d.pengajuan : [],
          koreksiRekap: Array.isArray(d.koreksiRekap) ? d.koreksiRekap : [],
          notifikasi: Array.isArray(d.notifikasi) ? d.notifikasi : [],
        };
      }
    }
  } catch {}
  return keadaanSegar();
}

function dariProfil(row) {
  return {
    id: row.id,
    nama: row.nama,
    nim: row.nim,
    suara: row.suara,
    angkatan: row.angkatan,
    aktif: row.aktif !== false,
    hadir: row.hadir ?? 0,
    lambat: row.lambat ?? 0,
    izin: row.izin ?? 0,
    sakit: row.sakit ?? 0,
    alpa: row.alpa ?? 0,
    potongan: row.potongan ?? 0,
  };
}

function dariJadwal(row) {
  const jam = row.jam ?? "";
  const bagianJam = jam.split(/[–-]/).map((v) => v.trim());
  return {
    id: row.id,
    nama: row.nama,
    tanggal: row.tanggal,
    jam,
    mulai: row.mulai ?? bagianJam[0] ?? "19.00",
    selesai: row.selesai ?? bagianJam[1] ?? bagianJam[0] ?? "21.00",
    lokasi: row.lokasi,
    toleransi: row.toleransi,
    status: row.status,
  };
}

function dariSesi(row) {
  if (!row) return null;
  return {
    id: row.id,
    nama: row.nama,
    tanggal: row.tanggal,
    jam: row.jam,
    lokasi: row.lokasi,
    mulaiMenit: row.mulai_menit,
    batasMenit: row.batas_menit,
    batasTepat: row.batas_tepat,
    toleransi: row.toleransi,
    radius: row.radius,
    token: row.token,
    dibukaPada: row.dibuka_pada,
    status: row.status,
  };
}

function dariAbsensi(row) {
  return {
    id: row.id,
    anggotaId: row.member_id,
    userId: row.user_id,
    nama: row.nama,
    token: row.token,
    jam: row.jam,
    jarak: row.jarak,
    akurasi: row.akurasi,
    status: row.status,
    dibuatPada: row.created_at ?? null,
  };
}

function dariPengajuan(row) {
  return {
    id: row.id,
    anggotaId: row.member_id,
    nama: row.nama,
    suara: row.suara,
    jenis: row.jenis,
    tanggal: row.tanggal,
    alasan: row.alasan,
    status: row.status,
  };
}

function dariKoreksiRekap(row) {
  return {
    id: row.member_id,
    anggotaId: row.member_id,
    hadir: row.hadir ?? 0,
    terlambat: row.terlambat ?? 0,
    izin: row.izin ?? 0,
    sakit: row.sakit ?? 0,
    alpa: row.alpa ?? 0,
    potongan: row.potongan ?? 0,
    catatan: row.catatan ?? "",
    diperbaruiPada: row.updated_at ?? row.created_at ?? null,
  };
}

function dariNotifikasi(row) {
  return {
    id: row.id,
    judul: row.judul,
    isi: row.isi,
    waktu: row.waktu,
    belumDibaca: row.belum_dibaca,
  };
}

function pesanGalat(error, fallback) {
  return error?.message || fallback;
}

async function pesanFungsiAnggota(error, fallback) {
  let pesan = pesanGalat(error, fallback);
  if (error?.context?.json) {
    try {
      const body = await error.context.json();
      if (body?.error) pesan = body.error;
    } catch {}
  }
  if (/failed to send a request|fetch failed|network error/i.test(pesan)) {
    return "Edge Function create-member belum dapat diakses. Deploy function dengan `supabase functions deploy create-member`, lalu coba lagi.";
  }
  return pesan;
}

export function PenyediaToko({ children }) {
  const { pengguna } = pakaiAuth();
  const [toko, setToko] = useState(keadaanAwal);
  const [siapData, setSiapData] = useState(!supabaseAktif);
  const [galatData, setGalatData] = useState("");

  useEffect(() => {
    if (supabaseAktif) return;
    try {
      localStorage.setItem(KUNCI_TOKO, JSON.stringify(toko));
    } catch {}
  }, [toko]);

  const muatData = useCallback(async () => {
    const [profilResult, jadwalResult, sesiResult, absensiResult, pengajuanResult, koreksiRekapResult, notifikasiResult] = await Promise.all([
      supabase.from("profiles").select("id,nama,nim,suara,angkatan,aktif,hadir,lambat,izin,sakit,alpa,potongan").eq("role", "anggota").order("nama"),
      supabase.from("jadwal").select("*").order("created_at", { ascending: false }),
      supabase.from("sesi").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("absensi").select("*").order("created_at", { ascending: false }),
      supabase.from("pengajuan").select("*").order("created_at", { ascending: false }),
      supabase.from("rekap_koreksi").select("*"),
      supabase.from("notifikasi").select("*").order("created_at", { ascending: false }),
    ]);
    const commonError = profilResult.error || jadwalResult.error || sesiResult.error || absensiResult.error || pengajuanResult.error || notifikasiResult.error;
    if (commonError) {
      setGalatData(commonError.message || "Data database gagal dimuat.");
      setSiapData(true);
      return;
    }
    const semuaProfil = (profilResult.data ?? []).map(dariProfil);
    setToko({
      daftarAnggota: semuaProfil.filter((a) => a.aktif),
      daftarAnggotaNonaktif: semuaProfil.filter((a) => !a.aktif),
      jadwal: (jadwalResult.data ?? []).map(dariJadwal),
      sesi: dariSesi(sesiResult.data),
      absensi: (absensiResult.data ?? []).map(dariAbsensi),
      pengajuan: (pengajuanResult.data ?? []).map(dariPengajuan),
      koreksiRekap: (koreksiRekapResult.data ?? []).map(dariKoreksiRekap),
      notifikasi: (notifikasiResult.data ?? []).map(dariNotifikasi),
    });
    setGalatData("");
    setSiapData(true);
  }, []);

  useEffect(() => {
    if (!supabaseAktif || !pengguna) return;
    void muatData();
  }, [pengguna?.userId, pengguna?.id, muatData]);

  useEffect(() => {
    if (!supabaseAktif || !pengguna) return;
    const segarkan = () => { void muatData(); };
    const channel = supabase
      .channel(`padus-realtime-${pengguna.userId ?? pengguna.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, segarkan)
      .on("postgres_changes", { event: "*", schema: "public", table: "jadwal" }, segarkan)
      .on("postgres_changes", { event: "*", schema: "public", table: "sesi" }, segarkan)
      .on("postgres_changes", { event: "*", schema: "public", table: "absensi" }, segarkan)
      .on("postgres_changes", { event: "*", schema: "public", table: "pengajuan" }, segarkan)
      .on("postgres_changes", { event: "*", schema: "public", table: "rekap_koreksi" }, segarkan)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifikasi" }, segarkan)
      .subscribe();
    const pengaman = setInterval(segarkan, 30000);
    return () => {
      clearInterval(pengaman);
      void supabase.removeChannel(channel);
    };
  }, [pengguna?.userId, pengguna?.id, muatData]);

  function tambahNotifikasi(judul, isi) {
    const item = { id: idBaru("N"), judul, isi, waktu: jamKini(), belumDibaca: true };
    setToko((t) => ({ ...t, notifikasi: [item, ...t.notifikasi] }));
    if (supabaseAktif) {
      void supabase.from("notifikasi").insert({ id: item.id, judul: item.judul, isi: item.isi, waktu: item.waktu, belum_dibaca: true });
    }
  }

  async function tambahJadwal({ nama, tanggal, mulai, selesai, lokasi, toleransi, status = "Terjadwal" }) {
    const namaBersih = String(nama ?? "").trim();
    const tanggalBersih = String(tanggal ?? "").trim();
    const mulaiBersih = String(mulai ?? "").trim();
    const selesaiBersih = String(selesai ?? "").trim();
    const lokasiBersih = String(lokasi ?? "").trim();
    if (!namaBersih || !tanggalBersih || !mulaiBersih || !selesaiBersih || !lokasiBersih) {
      return { gagal: "Nama, tanggal, jam, dan lokasi wajib diisi." };
    }
    if (selesaiBersih <= mulaiBersih) return { gagal: "Jam selesai harus setelah jam mulai." };
    const item = {
      id: idBaru("J"),
      nama: namaBersih,
      tanggal: tanggalBersih,
      jam: `${mulaiBersih}–${selesaiBersih}`,
      mulai: mulaiBersih,
      selesai: selesaiBersih,
      lokasi: lokasiBersih,
      toleransi: Number(toleransi) || 0,
      status,
    };
    if (supabaseAktif) {
      const { mulai: _mulai, selesai: _selesai, ...dataJadwal } = item;
      const { error } = await supabase.from("jadwal").insert(dataJadwal);
      if (error) return { gagal: pesanGalat(error, "Jadwal gagal disimpan ke Supabase.") };
    }
    setToko((t) => ({ ...t, jadwal: [item, ...t.jadwal] }));
    tambahNotifikasi("Jadwal baru: " + item.nama, `Keputusan pelatih. ${item.tanggal}, ${item.jam} di ${item.lokasi}.`);
    return { ok: true };
  }

  async function ubahJadwal(id, { nama, tanggal, mulai, selesai, lokasi, toleransi, status }) {
    const target = toko.jadwal.find((j) => j.id === id);
    if (!target) return { gagal: "Jadwal tidak ditemukan." };
    const namaBersih = String(nama ?? "").trim();
    const tanggalBersih = String(tanggal ?? "").trim();
    const mulaiBersih = String(mulai ?? "").trim();
    const selesaiBersih = String(selesai ?? "").trim();
    const lokasiBersih = String(lokasi ?? "").trim();
    if (!namaBersih || !tanggalBersih || !mulaiBersih || !selesaiBersih || !lokasiBersih) {
      return { gagal: "Nama, tanggal, jam, dan lokasi wajib diisi." };
    }
    if (selesaiBersih <= mulaiBersih) return { gagal: "Jam selesai harus setelah jam mulai." };
    const item = {
      nama: namaBersih,
      tanggal: tanggalBersih,
      jam: `${mulaiBersih}–${selesaiBersih}`,
      mulai: mulaiBersih,
      selesai: selesaiBersih,
      lokasi: lokasiBersih,
      toleransi: Number(toleransi) || 0,
      status: status || "Terjadwal",
    };
    if (supabaseAktif) {
      const { mulai: _mulai, selesai: _selesai, ...dataJadwal } = item;
      const { error } = await supabase.from("jadwal").update(dataJadwal).eq("id", id);
      if (error) return { gagal: pesanGalat(error, "Jadwal gagal diperbarui di Supabase.") };
    }
    setToko((t) => ({ ...t, jadwal: t.jadwal.map((j) => (j.id === id ? { ...j, ...item } : j)) }));
    tambahNotifikasi("Jadwal diperbarui: " + item.nama, `${item.tanggal}, ${item.jam} di ${item.lokasi}.`);
    return { ok: true };
  }

  async function hapusJadwal(id) {
    const target = toko.jadwal.find((j) => j.id === id);
    if (supabaseAktif) {
      const { error } = await supabase.from("jadwal").delete().eq("id", id);
      if (error) return { gagal: pesanGalat(error, "Jadwal gagal dihapus dari Supabase.") };
    }
    setToko((t) => ({ ...t, jadwal: t.jadwal.filter((j) => j.id !== id) }));
    if (target) tambahNotifikasi("Jadwal dibatalkan: " + target.nama, "Latihan ini tidak jadi dilaksanakan.");
    return { ok: true };
  }

  async function bukaSesi({ jadwalId, nama, lokasi, toleransi, tanggal, mulai, selesai }) {
    const kini = new Date();
    const mulaiDariJadwal = menitDariWaktu(mulai);
    const mulaiMenit = mulaiDariJadwal ?? kini.getHours() * 60 + kini.getMinutes();
    const batasMenit = mulaiMenit + (Number(toleransi) || 0);
    const jamSelesai = selesai || jamMenit(mulaiMenit + 120);
    const item = {
      id: idBaru("S"),
      jadwalId: jadwalId ?? null,
      nama: nama.trim(),
      tanggal: tanggal || kini.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      jam: `${jamMenit(mulaiMenit)}–${jamSelesai}`,
      lokasi: lokasi.trim() || "A213",
      mulaiMenit,
      batasMenit,
      batasTepat: jamMenit(batasMenit),
      toleransi: Number(toleransi) || 0,
      radius: 100,
      token: tokenBaru(),
      dibukaPada: jamKini(),
      status: "terbuka",
    };
    if (supabaseAktif) {
      const { error } = await supabase.from("sesi").insert({
        id: item.id,
        nama: item.nama,
        tanggal: item.tanggal,
        jam: item.jam,
        lokasi: item.lokasi,
        mulai_menit: item.mulaiMenit,
        batas_menit: item.batasMenit,
        batas_tepat: item.batasTepat,
        toleransi: item.toleransi,
        radius: item.radius,
        token: item.token,
        dibuka_pada: item.dibukaPada,
        status: item.status,
      });
      if (error) return { gagal: pesanGalat(error, "Sesi gagal disimpan ke Supabase.") };
    }
    setToko((t) => ({ ...t, sesi: item }));
    tambahNotifikasi(`Sesi dibuka: ${item.nama}`, `QR aktif di ${item.lokasi}. Batas tepat ${item.batasTepat}. Pastikan GPS aktif sebelum memindai.`);
    return { ok: true };
  }

  async function aturSesi(status) {
    if (!toko.sesi) return;
    if (supabaseAktif) {
      const { error } = await supabase.from("sesi").update({ status }).eq("id", toko.sesi.id);
      if (error) return { gagal: pesanGalat(error, "Status sesi gagal diperbarui.") };
    }
    setToko((t) => ({ ...t, sesi: { ...t.sesi, status } }));
    if (status === "terbuka") tambahNotifikasi(`Sesi dibuka: ${toko.sesi.nama}`, `QR aktif di ${toko.sesi.lokasi}. Pastikan GPS aktif sebelum memindai.`);
    else if (status === "jeda") tambahNotifikasi("Sesi dijeda sementara", "Kode QR tidak berlaku. Tunggu admin membuka kembali.");
    else if (status === "ditutup") tambahNotifikasi(`Sesi ditutup: ${toko.sesi.nama}`, "Anggota yang belum terpindai tercatat sebagai kandidat tidak hadir.");
    return { ok: true };
  }

  async function hapusSesi() {
    if (!toko.sesi) return { gagal: "Sesi tidak ditemukan." };
    if (toko.sesi.status !== "ditutup") return { gagal: "Tutup sesi terlebih dahulu sebelum menghapus." };
    if (supabaseAktif) {
      const { error } = await supabase.from("sesi").delete().eq("id", toko.sesi.id);
      if (error) return { gagal: pesanGalat(error, "Sesi gagal dihapus dari Supabase.") };
    }
    const namaSesi = toko.sesi.nama;
    setToko((t) => ({ ...t, sesi: null }));
    tambahNotifikasi(`Sesi dihapus: ${namaSesi}`, "Riwayat absensi sesi tetap tersimpan dan tidak ikut terhapus.");
    return { ok: true };
  }

  function sudahAbsen(anggotaId, token) {
    return toko.absensi.some((r) => r.anggotaId === anggotaId && r.token === token);
  }

  function absensiSesi(token) {
    return toko.absensi.filter((r) => r.token === token);
  }

  function dataKoreksiRekap({ hadir, terlambat, izin, sakit, alpa, potongan, catatan }) {
    const angka = { hadir, terlambat, izin, sakit, alpa, potongan };
    if (Object.values(angka).some((nilai) => !Number.isInteger(nilai) || nilai < 0)) return null;
    return { ...angka, catatan: String(catatan ?? "").trim() };
  }

  async function tambahKoreksiRekap({ anggotaId, hadir, terlambat, izin, sakit, alpa, potongan, catatan }) {
    const target = toko.daftarAnggota.find((a) => a.id === anggotaId);
    if (!target) return { gagal: "Anggota tidak ditemukan." };
    if (toko.koreksiRekap.some((item) => item.anggotaId === anggotaId)) return { gagal: "Koreksi untuk anggota ini sudah ada." };
    const data = dataKoreksiRekap({ hadir, terlambat, izin, sakit, alpa, potongan, catatan });
    if (!data) return { gagal: "Semua angka rekap harus berupa bilangan bulat nol atau lebih." };
    const diperbaruiPada = new Date().toISOString();
    const item = { id: anggotaId, anggotaId, ...data, diperbaruiPada };
    if (supabaseAktif) {
      const { error } = await supabase.from("rekap_koreksi").insert({ member_id: anggotaId, updated_at: diperbaruiPada, ...data });
      if (error) return { gagal: pesanGalat(error, "Koreksi rekap gagal disimpan ke Supabase.") };
    }
    setToko((t) => ({ ...t, koreksiRekap: [...t.koreksiRekap, item] }));
    tambahNotifikasi(`Koreksi rekap: ${target.nama}`, data.catatan || "Rekapfinal ditetapkan admin.");
    return { ok: true };
  }

  async function ubahKoreksiRekap(id, { hadir, terlambat, izin, sakit, alpa, potongan, catatan }) {
    const target = toko.koreksiRekap.find((item) => item.id === id);
    const anggota = target ? toko.daftarAnggota.find((a) => a.id === target.anggotaId) : null;
    if (!target || !anggota) return { gagal: "Koreksi rekap tidak ditemukan." };
    const data = dataKoreksiRekap({ hadir, terlambat, izin, sakit, alpa, potongan, catatan });
    if (!data) return { gagal: "Semua angka rekap harus berupa bilangan bulat nol atau lebih." };
    const diperbaruiPada = new Date().toISOString();
    if (supabaseAktif) {
      const { error } = await supabase.from("rekap_koreksi").update({ ...data, updated_at: diperbaruiPada }).eq("member_id", id);
      if (error) return { gagal: pesanGalat(error, "Koreksi rekap gagal diperbarui di Supabase.") };
    }
    setToko((t) => ({ ...t, koreksiRekap: t.koreksiRekap.map((item) => (item.id === id ? { ...item, ...data, diperbaruiPada } : item)) }));
    tambahNotifikasi(`Koreksi rekap diperbarui: ${anggota.nama}`, data.catatan || "Rekapfinal diperbarui admin.");
    return { ok: true };
  }

  async function hapusKoreksiRekap(id) {
    const target = toko.koreksiRekap.find((item) => item.id === id);
    const anggota = target ? toko.daftarAnggota.find((a) => a.id === target.anggotaId) : null;
    if (!target || !anggota) return { gagal: "Koreksi rekap tidak ditemukan." };
    if (supabaseAktif) {
      const { error } = await supabase.from("rekap_koreksi").delete().eq("member_id", id);
      if (error) return { gagal: pesanGalat(error, "Koreksi rekap gagal dihapus dari Supabase.") };
    }
    setToko((t) => ({ ...t, koreksiRekap: t.koreksiRekap.filter((item) => item.id !== id) }));
    tambahNotifikasi(`Koreksi rekap dihapus: ${anggota.nama}`, "Rekap kembali dihitung otomatis dari data anggota dan pindaian.");
    return { ok: true };
  }

  async function hapusAbsensi(id) {
    const target = toko.absensi.find((item) => item.id === id);
    if (!target || target.anggotaId !== pengguna?.id) return { gagal: "Riwayat kehadiran tidak ditemukan." };
    if (supabaseAktif) {
      const { error } = await supabase.from("absensi").delete().eq("id", id).eq("member_id", pengguna.id);
      if (error) return { gagal: pesanGalat(error, "Riwayat kehadiran gagal dihapus dari Supabase.") };
    }
    setToko((t) => ({ ...t, absensi: t.absensi.filter((item) => item.id !== id) }));
    return { ok: true };
  }

  async function catatHadir({ anggotaId, nama, token, jarak, akurasi, status }) {
    if (sudahAbsen(anggotaId, token)) return { ok: false, alasan: "duplikat" };
    const user = pengguna?.userId ? { user_id: pengguna.userId } : {};
    const rekam = { id: idBaru("H"), anggotaId, nama, token, jam: jamKini(), jarak, akurasi, status, dibuatPada: new Date().toISOString() };
    if (supabaseAktif) {
      const { error } = await supabase.from("absensi").insert({
        id: rekam.id,
        member_id: anggotaId,
        ...user,
        nama: rekam.nama,
        token: rekam.token,
        jam: rekam.jam,
        jarak: rekam.jarak,
        akurasi: rekam.akurasi,
        status: rekam.status,
      });
      if (error) {
        const duplikat = error.code === "23505" || /duplicate|unique/i.test(error.message ?? "");
        return { ok: false, alasan: duplikat ? "duplikat" : "server" };
      }
    }
    setToko((t) => ({ ...t, absensi: [rekam, ...t.absensi] }));
    tambahNotifikasi(
      status === "tepat" ? `Hasil pindaian ${nama}: tepat waktu` : `Hasil pindaian ${nama}: terlambat`,
      `${rekam.jam}, jarak ${jarak} meter dari ruang A213. Akurasi ±${akurasi} meter.`
    );
    return { ok: true };
  }

  async function kirimPengajuan({ nama, suara, jenis, alasan }) {
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const item = { id: idBaru("P"), anggotaId: pengguna?.id, nama, suara, jenis, tanggal, alasan: alasan.trim(), status: "Menunggu" };
    if (supabaseAktif) {
      const { error } = await supabase.from("pengajuan").insert({
        id: item.id,
        member_id: item.anggotaId,
        nama: item.nama,
        suara: item.suara,
        jenis: item.jenis,
        tanggal: item.tanggal,
        alasan: item.alasan,
        status: item.status,
      });
      if (error) return { gagal: pesanGalat(error, "Pengajuan gagal disimpan ke Supabase.") };
    }
    setToko((t) => ({ ...t, pengajuan: [item, ...t.pengajuan] }));
    tambahNotifikasi(`Pengajuan baru: ${nama} (${jenis})`, "Menunggu verifikasi admin sebelum sesi ditutup.");
    return { ok: true };
  }

  async function putuskanPengajuan(id, status) {
    const target = toko.pengajuan.find((p) => p.id === id);
    if (supabaseAktif) {
      const { error } = await supabase.from("pengajuan").update({ status }).eq("id", id);
      if (error) return { gagal: pesanGalat(error, "Status pengajuan gagal diperbarui.") };
    }
    setToko((t) => ({ ...t, pengajuan: t.pengajuan.map((p) => (p.id === id ? { ...p, status } : p)) }));
    if (target) tambahNotifikasi(`Pengajuan ${target.nama} ${status.toLowerCase()}`, `${target.jenis}, ${target.tanggal}. Keputusan tercatat untuk audit.`);
    return { ok: true };
  }

  async function tandaiDibaca(id) {
    if (supabaseAktif) {
      const { error } = await supabase.from("notifikasi").update({ belum_dibaca: false }).eq("id", id);
      if (error) return;
    }
    setToko((t) => ({ ...t, notifikasi: t.notifikasi.map((n) => (n.id === id ? { ...n, belumDibaca: false } : n)) }));
  }

  async function tambahAnggota({ nama, nim, suara, password }) {
    const namaBersih = String(nama ?? "").trim();
    const nimBersih = String(nim ?? "").trim();
    const suaraBersih = String(suara ?? "").trim();
    const passwordBersih = String(password ?? "");
    if (!namaBersih && !nimBersih) return { gagal: "Isi nama lengkap atau NIM." };
    if (nimBersih && !/^[0-9]{6,20}$/.test(nimBersih)) return { gagal: "NIM harus terdiri dari 6–20 digit angka." };
    if (!["Sopran", "Alto", "Tenor", "Bas"].includes(suaraBersih)) return { gagal: "Pilih kelompok suara." };
    if (supabaseAktif && passwordBersih.length < 8) return { gagal: "Password minimal 8 karakter." };
    if (nimBersih && toko.daftarAnggota.some((a) => a.nim === nimBersih)) return { gagal: `NIM ${nimBersih} sudah terdaftar.` };

    let item;
    let emailAuth = null;
    if (supabaseAktif) {
      const { data, error } = await supabase.functions.invoke("create-member", {
        body: { nama: namaBersih, nim: nimBersih, suara: suaraBersih, password: passwordBersih },
      });
      if (error) return { gagal: data?.error ?? await pesanFungsiAnggota(error, "Akun anggota gagal dibuat.") };
      if (!data?.profile) return { gagal: "Edge Function tidak mengembalikan profil anggota." };
      item = dariProfil(data.profile);
      emailAuth = data.email ?? null;
    } else {
      const namaTersimpan = namaBersih || `Anggota NIM ${nimBersih}`;
      item = {
        id: idBaru("A"),
        nama: namaTersimpan,
        nim: nimBersih || null,
        suara: suaraBersih,
        angkatan: Number(nimBersih.slice(0, 4)) || new Date().getFullYear(),
        aktif: true,
        hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0,
      };
    }

    setToko((t) => ({ ...t, daftarAnggota: [...t.daftarAnggota, item] }));
    tambahNotifikasi(`Anggota baru: ${item.nama}`, `${item.suara}, ${item.nim ? `NIM ${item.nim}` : "tanpa NIM"}. Akun Auth berhasil dibuat dan siap dipakai login.`);
    return { ok: true, id: item.id, email: emailAuth };
  }

  async function ubahAnggota(id, { nama, nim, suara }) {
    const target = toko.daftarAnggota.find((a) => a.id === id);
    if (!target) return { gagal: "Anggota tidak ditemukan." };
    const namaBersih = String(nama ?? "").trim();
    const nimBersih = String(nim ?? "").trim();
    const suaraBersih = String(suara ?? "").trim();
    if (!namaBersih && !nimBersih) return { gagal: "Isi nama lengkap atau NIM." };
    if (nimBersih && !/^[0-9]{6,20}$/.test(nimBersih)) return { gagal: "NIM harus terdiri dari 6–20 digit angka." };
    if (!["Sopran", "Alto", "Tenor", "Bas"].includes(suaraBersih)) return { gagal: "Pilih kelompok suara." };
    if (nimBersih && toko.daftarAnggota.some((a) => a.id !== id && a.nim === nimBersih)) return { gagal: `NIM ${nimBersih} sudah dipakai anggota lain.` };
    const namaTersimpan = namaBersih || `Anggota NIM ${nimBersih}`;
    if (supabaseAktif) {
      const { error } = await supabase.from("profiles").update({ nama: namaTersimpan, nim: nimBersih || null, suara: suaraBersih }).eq("id", id);
      if (error) return { gagal: pesanGalat(error, "Anggota gagal diperbarui di Supabase.") };
    }
    setToko((t) => ({ ...t, daftarAnggota: t.daftarAnggota.map((a) => (a.id === id ? { ...a, nama: namaTersimpan, nim: nimBersih || null, suara: suaraBersih } : a)) }));
    return { ok: true };
  }

  async function hapusAnggota(id) {
    const target = toko.daftarAnggota.find((a) => a.id === id);
    if (!target) return { gagal: "Anggota tidak ditemukan." };
    if (supabaseAktif) {
      const { error } = await supabase.from("profiles").update({ aktif: false }).eq("id", id);
      if (error) return { gagal: pesanGalat(error, "Anggota gagal dinonaktifkan di Supabase.") };
    }
    setToko((t) => ({
      ...t,
      daftarAnggota: t.daftarAnggota.filter((a) => a.id !== id),
      daftarAnggotaNonaktif: [...(t.daftarAnggotaNonaktif ?? []), { ...target, aktif: false }],
    }));
    tambahNotifikasi(`Anggota dinonaktifkan: ${target.nama}`, `${target.nim ? `NIM ${target.nim}` : "Tanpa NIM"} tidak bisa masuk lagi.`);
    return { ok: true };
  }

  async function aktifkanAnggota(id) {
    const target = [...(toko.daftarAnggota ?? []), ...(toko.daftarAnggotaNonaktif ?? [])].find((a) => a.id === id);
    if (!target) return { gagal: "Anggota tidak ditemukan." };
    if (supabaseAktif) {
      const { error } = await supabase.from("profiles").update({ aktif: true }).eq("id", id);
      if (error) return { gagal: pesanGalat(error, "Anggota gagal diaktifkan di Supabase.") };
    }
    const aktif = { ...target, aktif: true };
    setToko((t) => ({
      ...t,
      daftarAnggota: [...t.daftarAnggota, aktif],
      daftarAnggotaNonaktif: (t.daftarAnggotaNonaktif ?? []).filter((a) => a.id !== id),
    }));
    tambahNotifikasi(`Anggota diaktifkan kembali: ${target.nama}`, `${target.nim ? `NIM ${target.nim}` : "Login dengan nama lengkap"} dapat digunakan kembali.`);
    return { ok: true };
  }

  function aturUlang() {
    if (supabaseAktif) return { gagal: "Atur ulang hanya tersedia pada mode demo agar data Supabase tidak terhapus." };
    setToko(keadaanSegar());
    return { ok: true };
  }

  return (
    <Konteks.Provider
      value={{
        ...toko,
        siapData,
        galatData,
        tambahJadwal,
        ubahJadwal,
        hapusJadwal,
        bukaSesi,
        aturSesi,
        hapusSesi,
        sudahAbsen,
        absensiSesi,
        tambahKoreksiRekap,
        ubahKoreksiRekap,
        hapusKoreksiRekap,
        hapusAbsensi,
        catatHadir,
        kirimPengajuan,
        putuskanPengajuan,
        tambahNotifikasi,
        tandaiDibaca,
        tambahAnggota,
        ubahAnggota,
        hapusAnggota,
        aktifkanAnggota,
        aturUlang,
        supabaseAktif,
      }}
    >
      {children}
    </Konteks.Provider>
  );
}

export function pakaiToko() {
  return useContext(Konteks);
}
