import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lencana, KepalaBab, PetaRadius, QrSesi, TombolKeluar } from "../components/ui.jsx";
import { aturan, rupiah, nilaiKelayakan, SUARA } from "../data/mock.js";
import { pakaiAuth } from "../lib/auth.jsx";
import { pakaiToko } from "../lib/toko.jsx";

const TAB = [
  ["dasbor", "Dasbor", null],
  ["jadwal", "Jadwal", "jadwal"],
  ["sesi", "Sesi dan QR", null],
  ["anggota", "Anggota", "anggota"],
  ["rekap", "Rekap", null],
  ["izin", "Izin dan sakit", "izin"],
  ["aturan", "Aturan dan fee", "9"],
  ["acara", "Gladi dan wisuda", null],
  ["laporan", "Laporan", null],
  ["notifikasi", "Notifikasi", "notifikasi"],
];

export default function Admin() {
  const { tab = "dasbor" } = useParams();
  const aktif = TAB.some(([t]) => t === tab) ? tab : "dasbor";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pengguna } = pakaiAuth();
  const { jadwal, pengajuan, notifikasi, sesi, daftarAnggota, siapData, galatData } = pakaiToko();
  const hitung = {
    jadwal: jadwal.length,
    anggota: daftarAnggota.length,
    izin: pengajuan.filter((p) => p.status === "Menunggu").length || null,
    notifikasi: notifikasi.filter((n) => n.belumDibaca).length || null,
  };
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-6xl px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button className="grid h-10 w-10 shrink-0 place-items-center border-0 bg-transparent text-[var(--tinta)] lg:hidden" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu" aria-expanded={sidebarOpen} aria-controls="admin-sidebar">
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
            <Link to="/beranda" className="hidden min-w-0 items-center gap-2 lg:flex" aria-label="Kembali ke halaman depan">
              <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 12, background: "var(--beludru)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, flex: "none" }}>P</span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-extrabold">Buku admin</span>
                <span className="keterangan block max-w-[10rem] truncate sm:max-w-none" style={{ fontSize: 12.5 }}>Padus Undipa{sesi ? `, ${sesi.tanggal}` : ""}</span>
              </span>
            </Link>
            <Link to="/beranda" className="ml-auto min-w-0 truncate text-right text-sm font-extrabold lg:hidden" aria-label={`Kembali, ${pengguna?.nama ?? "admin"}`}>
              {pengguna?.nama ?? "Admin"}
            </Link>
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <TombolKeluar />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 pt-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {sidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-[#2a2b52]/30 lg:hidden" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}
        <aside id="admin-sidebar" className={`buku fixed inset-y-0 left-0 z-40 flex w-[min(19rem,86vw)] flex-col overflow-y-auto p-3 transition-transform lg:sticky lg:top-4 lg:z-auto lg:inset-y-auto lg:h-[calc(100vh-2rem)] lg:w-full lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="keterangan font-extrabold" style={{ color: "var(--beludru)" }}>Menu admin</span>
            <button type="button" className="grid h-9 w-9 place-items-center border-0 bg-transparent text-[var(--tinta)] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar admin">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          <nav aria-label="Bab buku admin" className="mt-4 flex flex-col gap-1">
            {TAB.map(([t, label, kunci]) => {
              const nilai = kunci === "9" ? "9" : kunci ? hitung[kunci] : null;
              return (
                <Link key={t} className="tab-buku" aria-current={t === aktif ? "page" : undefined} to={t === "dasbor" ? "/admin" : `/admin/${t}`} onClick={() => setSidebarOpen(false)}>
                  {label}
                  {nilai ? <span className="hitung angka">{nilai}</span> : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t pt-3 lg:hidden"><TombolKeluar className="btn btn-hantu mt-2 w-full justify-start" /></div>
        </aside>
        <main className="min-w-0">
          {!siapData ? <div className="toast" role="status">Memuat data dari database…</div> : galatData ? <div className="toast" role="alert" style={{ borderColor: "var(--bata)" }}>Data database gagal dimuat: {galatData}</div> : <>
            {aktif === "dasbor" && <Dasbor />}
            {aktif === "jadwal" && <Jadwal />}
            {aktif === "sesi" && <Sesi />}
            {aktif === "anggota" && <Anggota />}
            {aktif === "rekap" && <Rekap />}
            {aktif === "izin" && <Izin />}
            {aktif === "aturan" && <Aturan />}
            {aktif === "acara" && <Acara />}
            {aktif === "laporan" && <Laporan />}
            {aktif === "notifikasi" && <Notifikasi />}
          </>}
        </main>
      </div>
    </div>
  );
}

/* ——— Dasbor: pandangan dirigen ——— */
function Dasbor() {
  const { sesi, absensiSesi, pengajuan, jadwal, daftarAnggota } = pakaiToko();
  const terpindai = useMemo(
    () => (sesi ? new Set(absensiSesi(sesi.token).map((r) => r.anggotaId)) : new Set()),
    [absensiSesi, sesi]
  );
  const perSuara = useMemo(() => {
    const p = { Sopran: [], Alto: [], Tenor: [], Bas: [] };
    daftarAnggota.forEach((a) => (p[a.suara] ?? (p[a.suara] = [])).push({ ...a, diRuangan: terpindai.has(a.id) }));
    return p;
  }, [terpindai, daftarAnggota]);
  const totalRuangan = Object.values(perSuara).flat().filter((a) => a.diRuangan).length;
  const menunggu = pengajuan.filter((p) => p.status === "Menunggu").length;
  const rentan = daftarAnggota.filter((a) => a.alpa >= 2).length;
  const terdekat = jadwal[0];
  return (
    <div className="muncul">
      <KepalaBab
        atas={sesi ? "Sesi sedang berjalan" : "Belum ada sesi dibuka"}
        judul="Siapa sudah di ruangan?"
        Charity={
          sesi
            ? `Kode sesi ${sesi.token} dibuka ${sesi.dibukaPada}. Batas tepat waktu ${sesi.batasTepat}, toleransi ${sesi.toleransi} menit. Pindaian di luar radius ${sesi.radius} meter ditolak.`
            : "Buka sesi pertama dari tab Sesi dan QR, lalu anggota bisa mulai memindai."
        }
      />
      {!sesi && (
        <div className="toast mb-4" role="status">
          <p className="font-extrabold">Mulai dari sini: buka sesi absensi.</p>
          <div className="mt-3"><Link className="btn btn-primer" to="/admin/sesi">Buka sesi</Link></div>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <div className="lembar-qr p-4">
          <PetaRadius jarak={42} akurasi={9} />
          <div className="flex flex-wrap items-center gap-2 px-1 pb-1 pt-3">
            <Lencana nada="hadir" anak={`${totalRuangan} di dalam`} />
            <Lencana nada="alpa" anak={`${daftarAnggota.length - totalRuangan} belum terpindai`} />
          </div>
        </div>
        <div className="buku">
          <div className="baris" style={{ background: "var(--kertas-2)" }}>
            <span className="font-extrabold">Kehadiran per suara</span>
            <span className="keterangan ml-auto">{totalRuangan} dari {daftarAnggota.length} terpindai</span>
          </div>
          {Object.entries(perSuara).map(([suara, daftar]) => (
            <div key={suara} className="border-b px-4 py-3 last:border-0" style={{ borderColor: "var(--garis)" }}>
              <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 99, background: SUARA[suara]?.warna ?? "var(--garis-tebal)" }} />
                {suara}
                <span className="keterangan font-medium">— {SUARA[suara]?.deskripsi ?? ""}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {daftar.map((a) => (
                  <span
                    key={a.id}
                    title={`${a.nama} — ${a.diRuangan ? "sudah di ruangan" : "belum terpindai"}`}
                    style={{
                      padding: "0.25rem 0.6rem", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                      background: a.diRuangan ? "var(--daun-latar)" : "#fff",
                      color: a.diRuangan ? "var(--daun)" : "var(--tinta-lunak)",
                      border: `1.5px solid ${a.diRuangan ? "transparent" : "var(--garis-tebal)"}`,
                    }}
                  >
                    {a.nama.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="buku p-5">
          <h3 className="font-extrabold">Perlu keputusan</h3>
          <p className="keterangan mt-1">{menunggu} pengajuan menunggu. {rentan} anggota sudah dua kali alpa atau lebih — satu absen lagi berarti gugur.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn btn-primer" to="/admin/izin">Periksa pengajuan</Link>
            <Link className="btn btn-kertas" to="/admin/anggota">Lihat anggota rentan</Link>
          </div>
        </div>
        <div className="buku p-5">
          <h3 className="font-extrabold">{terdekat ? "Jadwal terdekat" : "Belum ada jadwal"}</h3>
          <p className="keterangan mt-1">
            {terdekat
              ? `${terdekat.nama} — ${terdekat.tanggal}, ${terdekat.jam} di ${terdekat.lokasi}.`
              : "Tambah jadwal latihan dari tab Jadwal. Anggota akan langsung melihatnya."}
          </p>
          <div className="mt-3"><Link className="btn btn-kertas" to="/admin/jadwal">Kelola jadwal</Link></div>
        </div>
      </div>
    </div>
  );
}

function formatTanggalJadwal(nilai) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nilai ?? "")) return nilai ?? "—";
  return new Date(`${nilai}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function nilaiAwalJadwal() {
  return {
    nama: "",
    tanggal: new Date().toISOString().slice(0, 10),
    mulai: "19.00",
    selesai: "21.00",
    lokasi: "A213",
    toleransi: 10,
    status: "Terjadwal",
  };
}

function Jadwal() {
  const { jadwal, tambahJadwal, ubahJadwal, hapusJadwal } = pakaiToko();
  const [form, setForm] = useState(nilaiAwalJadwal);
  const [editId, setEditId] = useState(null);
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");

  function ubahField(field, value) {
    setForm((t) => ({ ...t, [field]: value }));
    setGalat("");
  }

  function resetForm() {
    setForm(nilaiAwalJadwal());
    setEditId(null);
    setGalat("");
  }

  function mulaiEdit(j) {
    const bagianJam = (j.jam ?? "19.00–21.00").split(/[–-]/).map((v) => v.trim());
    setForm({
      nama: j.nama,
      tanggal: /^\d{4}-\d{2}-\d{2}$/.test(j.tanggal ?? "") ? j.tanggal : new Date().toISOString().slice(0, 10),
      mulai: j.mulai ?? bagianJam[0] ?? "19.00",
      selesai: j.selesai ?? bagianJam[1] ?? bagianJam[0] ?? "21.00",
      lokasi: j.lokasi,
      toleransi: j.toleransi ?? 10,
      status: j.status ?? "Terjadwal",
    });
    setEditId(j.id);
    setPesan("");
    setGalat("");
  }

  async function simpan(e) {
    e.preventDefault();
    const sedangEdit = Boolean(editId);
    const hasil = sedangEdit ? await ubahJadwal(editId, form) : await tambahJadwal(form);
    if (hasil?.gagal) {
      setGalat(hasil.gagal);
      return;
    }
    const namaJadwal = form.nama.trim();
    resetForm();
    setPesan(`${namaJadwal} ${sedangEdit ? "diperbarui" : "tersimpan"} dan langsung disiarkan ke anggota.`);
  }

  return (
    <div className="muncul">
      <KepalaBab atas="Fleksibel mengikuti keputusan pelatih" judul="Jadwal latihan" Charity="Tambah, ubah jam mulai dan selesai, pindah lokasi, atur toleransi, atau batalkan. Jadwal baru langsung muncul di dasbor anggota." />
      <form onSubmit={simpan} className="buku mb-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-extrabold">{editId ? "Ubah jadwal" : "Tambah jadwal baru"}</h3>
          {editId && <button type="button" className="btn btn-kertas" onClick={resetForm}>Batal edit</button>}
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="md:col-span-2 lg:col-span-3">
            <span className="cap">Nama kegiatan</span>
            <input className="masukkan" value={form.nama} onChange={(e) => ubahField("nama", e.target.value)} placeholder="Misal: Latihan tambahan vokal grup" />
          </label>
          <label>
            <span className="cap">Tanggal</span>
            <input className="masukkan" type="date" value={form.tanggal} onChange={(e) => ubahField("tanggal", e.target.value)} />
          </label>
          <label>
            <span className="cap">Jam mulai</span>
            <input className="masukkan" type="time" value={form.mulai} onChange={(e) => ubahField("mulai", e.target.value)} />
          </label>
          <label>
            <span className="cap">Jam selesai</span>
            <input className="masukkan" type="time" value={form.selesai} onChange={(e) => ubahField("selesai", e.target.value)} />
          </label>
          <label>
            <span className="cap">Lokasi</span>
            <input className="masukkan" value={form.lokasi} onChange={(e) => ubahField("lokasi", e.target.value)} placeholder="Misal: A213" />
          </label>
          <label>
            <span className="cap">Toleransi keterlambatan: {form.toleransi} menit</span>
            <input type="range" min="0" max="30" value={form.toleransi} onChange={(e) => ubahField("toleransi", Number(e.target.value))} className="w-full" />
          </label>
          <label>
            <span className="cap">Status</span>
            <select className="masukkan" value={form.status} onChange={(e) => ubahField("status", e.target.value)}>
              {["Terjadwal", "Wajib", "Sesi terbuka"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        {galat && <p role="alert" className="toast mt-3" style={{ borderColor: "var(--bata)", color: "var(--bata)" }}>{galat}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primer" type="submit">{editId ? "Simpan perubahan" : "Simpan jadwal"}</button>
          {editId && <button className="btn btn-kertas" type="button" onClick={resetForm}>Batal</button>}
        </div>
      </form>
      {pesan && <p role="status" className="toast mb-4" style={{ borderColor: "var(--daun)" }}>{pesan}</p>}
      {jadwal.length === 0 && <p className="keterangan mb-4">Belum ada jadwal. Tambah kegiatan pertama lewat formulir di atas.</p>}
      <div className="buku">
        {jadwal.map((j) => {
          const bagianJam = (j.jam ?? "").split(/[–-]/).map((v) => v.trim());
          const jamMulai = j.mulai ?? bagianJam[0] ?? "—";
          const jamSelesai = j.selesai ?? bagianJam[1] ?? "—";
          return (
            <div key={j.id} className="baris" style={{ alignItems: "flex-start" }}>
              <span className="pita" style={{ background: j.status === "Sesi terbuka" ? "var(--daun)" : j.status.includes("Wajib") ? "var(--beludru)" : "var(--garis-tebal)" }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold leading-tight">{j.nama}</span>
                <span className="keterangan block">{formatTanggalJadwal(j.tanggal)}, {jamMulai}–{jamSelesai} — {j.lokasi}. Toleransi {j.toleransi} menit.</span>
              </span>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Lencana nada={j.status === "Sesi terbuka" ? "hadir" : j.status.includes("Wajib") ? "lambat" : "netral"} anak={j.status} />
                <button type="button" className="btn btn-kertas" style={{ padding: ".35rem .85rem", fontSize: 13 }} onClick={() => mulaiEdit(j)}>Ubah</button>
                <button type="button" className="keterangan font-bold" style={{ color: "var(--bata)" }} onClick={() => hapusJadwal(j.id)} aria-label={`Batalkan ${j.nama}`}>Batalkan</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ——— Sesi + QR ——— */
function Sesi() {
  const { sesi, bukaSesi, aturSesi, hapusSesi, absensiSesi, aturUlang, daftarAnggota } = pakaiToko();
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [pesan, setPesan] = useState("");
  if (!sesi) return <SesiBaru onBuka={bukaSesi} />;
  const buka = sesi.status === "terbuka";
  const ditutup = sesi.status === "ditutup";
  const sudah = absensiSesi(sesi.token);
  const kandidat = daftarAnggota.filter((a) => !sudah.some((r) => r.anggotaId === a.id));

  async function jalankanHapus() {
    const hasil = await hapusSesi();
    if (hasil?.gagal) {
      setPesan(hasil.gagal);
      return;
    }
    setKonfirmasiHapus(false);
  }

  return (
    <div className="muncul">
      <KepalaBab atas="Satu anggota, satu pindaian" judul="Sesi dan kode QR" Charity="Kode hanya berlaku saat sesi dibuka — layar pindai anggota mengikutinya otomatis. GPS wajib lolos sebelum waktu diperiksa. Pindaian kedua dari orang yang sama ditolak sebagai duplikat." />
      {pesan && <p role="alert" className="toast mb-4" style={{ borderColor: "var(--bata)", color: "var(--bata)" }}>{pesan}</p>}
      <div className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
        <div className="lembar-qr p-5 text-center">
          {buka ? (
            <>
              <QrSesi token={sesi.token} />
              <p className="angka mt-3 text-xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>{sesi.token}</p>
              <p className="keterangan mt-1">Dibuka {sesi.dibukaPada} di {sesi.lokasi}. Disegarkan tiap 60 detik. Jangan bagikan tangkapan layar — pindaian tetap memeriksa akun dan lokasi.</p>
              <div className="mt-2"><Lencana nada="hadir" anak={`Sesi terbuka — ${sudah.length} sudah terpindai`} /></div>
              <div className="mt-4 flex justify-center gap-2">
                <button className="btn btn-kertas" onClick={() => aturSesi("jeda")}>Jeda sesi</button>
                <button className="btn btn-primer" onClick={() => aturSesi("ditutup")}>Tutup sesi</button>
              </div>
            </>
          ) : ditutup ? (
            <>
               <p className="judul-bab text-2xl">Sesi ditutup.</p>
               <p className="keterangan mt-2">Kode tidak berlaku. Anggota yang memindai sekarang akan menerima penolakan sesi ditutup.</p>
               <div className="mt-4 flex flex-wrap justify-center gap-2">
                 <button className="btn btn-primer" onClick={() => aturSesi("terbuka")}>Buka kembali</button>
                 <button className="btn btn-kertas" onClick={() => { setKonfirmasiHapus(true); setPesan(""); }}>Hapus sesi</button>
               </div>
               {konfirmasiHapus && (
                 <div className="toast mt-4 text-left" role="alert" style={{ borderColor: "var(--bata)" }}>
                   <p className="font-extrabold">Hapus sesi {sesi.nama}?</p>
                   <p className="keterangan mt-1">Riwayat absensi tetap tersimpan, tetapi sesi dan QR tidak dapat digunakan lagi.</p>
                   <div className="mt-3 flex flex-wrap justify-center gap-2">
                     <button className="btn btn-primer" style={{ background: "var(--bata)" }} onClick={jalankanHapus}>Ya, hapus sesi</button>
                     <button className="btn btn-kertas" onClick={() => setKonfirmasiHapus(false)}>Batal</button>
                   </div>
                 </div>
               )}
            </>
          ) : (
            <>
              <p className="judul-bab text-2xl">Sesi dijeda.</p>
              <p className="keterangan mt-2">Kode tidak berlaku. Anggota yang memindai sekarang akan menerima penolakan token tidak valid.</p>
              <div className="mt-4"><button className="btn btn-primer" onClick={() => aturSesi("terbuka")}>Buka kembali</button></div>
            </>
          )}
        </div>
        <div>
          <div className="buku mb-4">
            {[
              ["Token valid, di dalam radius", "Lanjut periksa waktu", "hadir"],
              ["Jarak di atas 100 meter", "Ditolak", "alpa"],
              ["GPS tidak tersedia", "Tidak bisa memeriksa lokasi", "lambat"],
              ["Sudah pernah terpindai", "Ditolak sebagai duplikat", "alpa"],
            ].map(([kasus, hasil, nada]) => (
              <div key={kasus} className="baris">
                <span className="flex-1 text-sm"><b>{kasus}.</b> <span className="keterangan">{hasil}.</span></span>
                <Lencana nada={nada} anak={hasil.split(" ")[0]} />
              </div>
            ))}
          </div>
          {ditutup ? (
            <div className="toast muncul" role="status" style={{ borderColor: "var(--beludru)" }}>
              <p className="font-extrabold">Sesi ditutup. {kandidat.length} anggota belum terpindai{sudah.length > 0 ? `, ${sudah.length} sudah tercatat` : ""}.</p>
              <p className="keterangan mt-1">
                {kandidat.length > 0
                  ? `Belum terpindai: ${kandidat.slice(0, 5).map((a) => a.nama.split(" ")[0]).join(", ")}${kandidat.length > 5 ? ` dan ${kandidat.length - 5} lainnya` : ""}. `
                  : "Semua anggota sudah terpindai. "}
                Mereka tercatat sebagai kandidat tidak hadir — belum menjadi potongan final. Periksa izin dan sakit sebelum menetapkan status akhir.
              </p>
              <div className="mt-3 flex gap-2"><Link className="btn btn-primer" to="/admin/izin">Verifikasi sekarang</Link></div>
            </div>
          ) : (
            <p className="keterangan">Menutup sesi akan menandai anggota yang belum terpindai sebagai kandidat tidak hadir, sesuai alur FR-07.</p>
          )}
          <button type="button" className="keterangan mt-4 font-bold" style={{ color: "var(--tinta-lunak)" }} onClick={aturUlang}>
            Kosongkan semua data (atur ulang pengujian)
          </button>
        </div>
      </div>
    </div>
  );
}

function SesiBaru({ onBuka }) {
  const { jadwal } = pakaiToko();
  const [terpilih, setTerpilih] = useState("");
  const [galat, setGalat] = useState("");

  useEffect(() => {
    if (!terpilih && jadwal.length > 0) setTerpilih(jadwal[0].id);
  }, [jadwal, terpilih]);

  const sesiJadwal = jadwal.find((j) => j.id === terpilih);
  const jamJadwal = (sesiJadwal?.jam ?? "19.00–21.00").split(/[–-]/).map((v) => v.trim());
  const mulai = sesiJadwal?.mulai ?? jamJadwal[0] ?? "19.00";
  const selesai = sesiJadwal?.selesai ?? jamJadwal[1] ?? "21.00";

  async function kirim(e) {
    e.preventDefault();
    if (!sesiJadwal) {
      setGalat("Pilih jadwal yang ingin dibuka lebih dulu.");
      return;
    }
    const hasil = await onBuka({
      jadwalId: sesiJadwal.id,
      nama: sesiJadwal.nama,
      lokasi: sesiJadwal.lokasi,
      toleransi: sesiJadwal.toleransi ?? 10,
      tanggal: formatTanggalJadwal(sesiJadwal.tanggal),
      mulai,
      selesai,
    });
    if (hasil?.gagal) setGalat(hasil.gagal);
  }

  if (jadwal.length === 0) {
    return (
      <div className="muncul">
        <KepalaBab atas="Belum ada jadwal" judul="Buka sesi absensi" Charity="Sesi harus mengikuti jadwal latihan yang sudah dibuat. Buat jadwal terlebih dahulu, lalu kembali ke tab ini." />
        <div className="toast" role="status">
          <p className="font-extrabold">Belum ada jadwal latihan.</p>
          <p className="keterangan mt-1">Buka tab Jadwal, tambahkan tanggal, jam, dan lokasi, lalu kembali ke Sesi dan QR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="muncul">
      <KepalaBab atas="Pilih jadwal yang sudah disepakati" judul="Buka sesi absensi" Charity="Detail sesi diambil otomatis dari jadwal. Token QR dibuat setelah jadwal dipilih dan tidak dapat diubah dari layar ini." />
      <form className="buku grid max-w-xl gap-3 p-4" onSubmit={kirim}>
        <label>
          <span className="cap">Jadwal latihan</span>
          <select className="masukkan" value={terpilih} onChange={(e) => { setTerpilih(e.target.value); setGalat(""); }}>
            {jadwal.map((j) => <option key={j.id} value={j.id}>{j.nama} — {formatTanggalJadwal(j.tanggal)}</option>)}
          </select>
        </label>
        <label>
          <span className="cap">Nama kegiatan</span>
          <input className="masukkan" value={sesiJadwal?.nama ?? ""} readOnly />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="cap">Tanggal</span>
            <input className="masukkan" value={formatTanggalJadwal(sesiJadwal?.tanggal)} readOnly />
          </label>
          <label>
            <span className="cap">Jam latihan</span>
            <input className="masukkan angka" value={`${mulai}–${selesai}`} readOnly />
          </label>
        </div>
        <label>
          <span className="cap">Lokasi</span>
          <input className="masukkan" value={sesiJadwal?.lokasi ?? ""} readOnly />
        </label>
        <div className="toast text-sm" style={{ borderColor: "var(--garis-tebal)" }}>
          Toleransi keterlambatan mengikuti jadwal: <b>{sesiJadwal?.toleransi ?? 10} menit</b>. Batas tepat akan dihitung dari jam mulai.
        </div>
        {galat && <p role="alert" className="toast" style={{ borderColor: "var(--bata)", color: "var(--bata)" }}>{galat}</p>}
        <div><button className="btn btn-primer" type="submit">Buka sesi sesuai jadwal dan buat QR</button></div>
      </form>
    </div>
  );
}

/* ——— Anggota SATB + CRUD ——— */
function Anggota() {
  const { daftarAnggota, daftarAnggotaNonaktif, tambahAnggota, ubahAnggota, hapusAnggota, aktifkanAnggota, supabaseAktif } = pakaiToko();
  const [cari, setCari] = useState("");
  const [suara, setSuara] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [formMode, setFormMode] = useState(null); // null | { mode: "tambah" } | { mode: "ubah", id }
  const [namaForm, setNamaForm] = useState("");
  const [nimForm, setNimForm] = useState("");
  const [suaraForm, setSuaraForm] = useState("Sopran");
  const [passwordForm, setPasswordForm] = useState("");
  const [galatForm, setGalatForm] = useState("");
  const [pesan, setPesan] = useState("");
  const [kredensialBaru, setKredensialBaru] = useState(null);
  const [hapusTarget, setHapusTarget] = useState(null);

  const semuaAnggota = useMemo(
    () => [...daftarAnggota, ...(daftarAnggotaNonaktif ?? [])],
    [daftarAnggota, daftarAnggotaNonaktif]
  );
  const hasil = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return semuaAnggota.filter(
      (a) =>
        (status === "Semua" || (status === "Aktif" ? a.aktif !== false : a.aktif === false)) &&
        (suara === "Semua" || a.suara === suara) &&
        (kunci === "" || a.nama.toLowerCase().includes(kunci) || (a.nim ?? "").includes(kunci))
    );
  }, [semuaAnggota, cari, suara, status]);

  function bukaTambah() {
    setFormMode({ mode: "tambah" });
    setNamaForm("");
    setNimForm("");
    setSuaraForm("Sopran");
    setPasswordForm("");
    setGalatForm("");
    setPesan("");
    setKredensialBaru(null);
    setHapusTarget(null);
  }

  function bukaUbah(a) {
    setFormMode({ mode: "ubah", id: a.id });
    setNamaForm(a.nama);
    setNimForm(a.nim ?? "");
    setSuaraForm(a.suara);
    setPasswordForm("");
    setGalatForm("");
    setPesan("");
    setKredensialBaru(null);
    setHapusTarget(null);
  }

  function tutupForm() {
    setFormMode(null);
    setPasswordForm("");
    setGalatForm("");
  }

  async function simpanForm(e) {
    e.preventDefault();
    if (formMode?.mode === "tambah" && supabaseAktif && passwordForm.length < 8) {
      setGalatForm("Password awal minimal 8 karakter.");
      return;
    }
    let hasilSimpan;
    if (formMode?.mode === "ubah") {
      hasilSimpan = await ubahAnggota(formMode.id, { nama: namaForm, nim: nimForm, suara: suaraForm });
    } else {
      hasilSimpan = await tambahAnggota({ nama: namaForm, nim: nimForm, suara: suaraForm, password: passwordForm });
    }
    if (hasilSimpan?.gagal) {
      setGalatForm(hasilSimpan.gagal);
      return;
    }
    if (formMode?.mode === "tambah" && supabaseAktif) {
      setKredensialBaru({ nim: nimForm.trim(), email: hasilSimpan.email ?? "Email internal dibuat otomatis", password: passwordForm });
    }
    setFormMode(null);
    setPasswordForm("");
    setGalatForm("");
    setPesan(
      formMode?.mode === "ubah"
        ? `Perubahan ${namaForm.trim()} tersimpan.`
        : `${namaForm.trim()} berhasil ditambahkan dan akunnya siap dipakai login.`
    );
  }

  async function jalankanHapus() {
    if (!hapusTarget) return;
    const r = await hapusAnggota(hapusTarget.id);
    if (r?.gagal) {
      setPesan("");
      setGalatForm(r.gagal);
      return;
    }
    setPesan(`${hapusTarget.nama} dinonaktifkan dari daftar.`);
    setHapusTarget(null);
    if (formMode?.mode === "ubah" && formMode.id === hapusTarget.id) setFormMode(null);
  }

  async function jalankanAktifkan(anggota) {
    const r = await aktifkanAnggota(anggota.id);
    if (r?.gagal) {
      setPesan("");
      setGalatForm(r.gagal);
      return;
    }
    setGalatForm("");
    setPesan(`${anggota.nama} berhasil diaktifkan kembali.`);
  }

  const gayaPil = (aktif) =>
    aktif
      ? { borderColor: "var(--beludru)", color: "var(--beludru)", background: "var(--beludru-latar)", padding: ".45rem 1rem", fontSize: 13.5 }
      : { padding: ".45rem 1rem", fontSize: 13.5 };

  return (
    <div className="muncul">
      <KepalaBab atas="Sopran, alto, tenor, bas" judul="Anggota" Charity="Tiap baris membawa pita warna suaranya. Cari berdasar nama atau NIM, saring berdasar kelompok suara, lalu tambah, ubah, atau hapus dari satu tempat." />

      {/* Bilah alat: baris 1 cari + tambah, baris 2 saring + hitung. Rapi di HP maupun laptop. */}
      <div className="buku mb-3 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="masukkan flex-1"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama atau NIM, misal: Maria / 202201011"
              aria-label="Cari anggota"
            />
            <button type="button" className="btn btn-primer whitespace-nowrap" onClick={bukaTambah}>
              + Tambah anggota
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1.15fr_.85fr]">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Saring suara">
              <span className="keterangan mr-1 font-bold">Saring:</span>
              {["Semua", "Sopran", "Alto", "Tenor", "Bas"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSuara(s)}
                  aria-pressed={suara === s}
                  className="btn btn-kertas"
                  style={gayaPil(suara === s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Saring status anggota">
              <span className="keterangan mr-1 font-bold">Status:</span>
              {["Semua", "Aktif", "Nonaktif"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
                  className="btn btn-kertas"
                  style={gayaPil(status === s)}
                >
                  {s}
                </button>
              ))}
              <span className="keterangan angka ml-auto">
                {hasil.length} dari {semuaAnggota.length} anggota
              </span>
            </div>
          </div>
        </div>
      </div>

      {pesan && (
        <p role="status" className="toast mb-3" style={{ borderColor: "var(--daun)" }}>
          {pesan}
        </p>
      )}

      {kredensialBaru && (
        <div className="toast mb-3" role="status" style={{ borderColor: "var(--beludru)" }}>
          <p className="font-extrabold">Kredensial akun baru — simpan sebelum meninggalkan halaman.</p>
          {kredensialBaru.nim ? <p className="keterangan mt-2">Login NIM: <b className="angka" style={{ color: "var(--tinta)" }}>{kredensialBaru.nim}</b></p> : <p className="keterangan mt-2">Login nama lengkap: <b style={{ color: "var(--tinta)" }}>{namaForm.trim()}</b></p>}
          <p className="keterangan">Email internal: <b style={{ color: "var(--tinta)" }}>{kredensialBaru.email}</b></p>
          <p className="mt-2 font-extrabold">Password awal: <span className="angka">{kredensialBaru.password}</span></p>
        </div>
      )}

      {/* Formulir tambah / ubah */}
      {formMode && (
        <form onSubmit={simpanForm} className="buku mb-3 p-4">
          <h3 className="font-extrabold">{formMode.mode === "ubah" ? "Ubah anggota" : "Tambah anggota baru"}</h3>
          <p className="keterangan mt-1">
            {formMode.mode === "ubah"
              ? "Perubahan NIM langsung berlaku untuk login berikutnya."
              : supabaseAktif
                ? "Isi nama lengkap atau NIM. Akun Auth dibuat otomatis dan password awal diberikan kepada anggota."
                : "Isi nama lengkap atau NIM. Anggota baru bisa masuk dengan kata sandi demo."}
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_.8fr_.7fr_.8fr]">
            <label>
              <span className="cap">Nama lengkap (atau NIM)</span>
              <input
                className="masukkan"
                value={namaForm}
                onChange={(e) => setNamaForm(e.target.value)}
                placeholder="Misal: Maria Lestari"
                autoFocus
              />
            </label>
            <label>
              <span className="cap">NIM (opsional)</span>
              <input
                className="masukkan angka"
                value={nimForm}
                onChange={(e) => setNimForm(e.target.value)}
                placeholder="Misal: 202501099"
                inputMode="numeric"
              />
            </label>
            <label>
              <span className="cap">Kelompok suara</span>
              <select className="masukkan" value={suaraForm} onChange={(e) => setSuaraForm(e.target.value)}>
                {["Sopran", "Alto", "Tenor", "Bas"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            {formMode.mode === "tambah" && supabaseAktif && (
              <label>
                <span className="cap">Password awal</span>
                <input
                  className="masukkan"
                  type="password"
                  value={passwordForm}
                  onChange={(e) => setPasswordForm(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                />
              </label>
            )}
          </div>
          {galatForm && (
            <p role="alert" className="toast mt-3" style={{ borderColor: "var(--bata)" }}>
              {galatForm}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primer" type="submit">
              {formMode.mode === "ubah" ? "Simpan perubahan" : "Simpan anggota"}
            </button>
            <button className="btn btn-kertas" type="button" onClick={tutupForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Konfirmasi hapus */}
      {hapusTarget && (
        <div className="toast mb-3" role="alert" style={{ borderColor: "var(--bata)" }}>
          <p className="font-extrabold">Nonaktifkan {hapusTarget.nama} ({hapusTarget.nim ? `NIM ${hapusTarget.nim}` : "tanpa NIM"})?</p>
          <p className="keterangan mt-1">Akunnya tidak bisa masuk lagi sampai diaktifkan kembali. Riwayat pindaian yang sudah tercatat tetap tersimpan.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primer"
              style={{ background: "var(--bata)" }}
              onClick={jalankanHapus}
            >
              Ya, nonaktifkan
            </button>
            <button type="button" className="btn btn-kertas" onClick={() => setHapusTarget(null)}>
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="buku">
        {hasil.map((a) => {
          const lay = nilaiKelayakan(a);
          const nonaktif = a.aktif === false;
          return (
            <div key={a.id} className="baris" style={{ alignItems: "flex-start" }}>
              <span className="pita" style={{ background: SUARA[a.suara]?.warna ?? "var(--garis-tebal)" }} aria-hidden="true" />
              <span
                aria-hidden="true"
                style={{
                  width: 40, height: 40, borderRadius: "50%", flex: "none",
                  background: "var(--kertas-2)", display: "grid", placeItems: "center",
                  fontWeight: 800, fontSize: 13, color: "var(--tinta)",
                }}
              >
                {a.nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold leading-tight">{a.nama}</span>
                <span className="keterangan block truncate">{a.suara}, {a.nim ? `NIM ${a.nim}` : "tanpa NIM"}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Lencana nada={nonaktif ? "netral" : lay.nada} anak={nonaktif ? "Nonaktif" : lay.label} />
                </span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {nonaktif ? (
                    <button
                      type="button"
                      className="btn btn-kertas"
                      style={{ padding: ".35rem .85rem", fontSize: 13, color: "var(--daun)", borderColor: "#A9CFC0" }}
                      onClick={() => jalankanAktifkan(a)}
                      aria-label={`Aktifkan ${a.nama}`}
                    >
                      Aktifkan
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-kertas"
                        style={{ padding: ".35rem .85rem", fontSize: 13 }}
                        onClick={() => bukaUbah(a)}
                        aria-label={`Ubah ${a.nama}`}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        className="btn btn-kertas"
                        style={{ padding: ".35rem .85rem", fontSize: 13, color: "var(--bata)", borderColor: "#E5B8B7" }}
                        onClick={() => { setHapusTarget(a); setPesan(""); }}
                        aria-label={`Hapus ${a.nama}`}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </span>
              </span>
            </div>
          );
        })}
        {hasil.length === 0 && <p className="keterangan p-5">Tidak ada anggota yang cocok. Coba kata kunci lain atau tambah anggota baru.</p>}
      </div>
      <p className="keterangan mt-3">Penanda kelayakan diperbarui otomatis dari rekap: 3 kali alpa berarti tidak bisa ikut serta lagi.</p>
    </div>
  );
}

/* ——— Rekap ——— */
function waktuTerakhir(nilai) {
  const waktu = Date.parse(nilai ?? "");
  return Number.isNaN(waktu) ? 0 : waktu;
}

function Rekap() {
  const { absensi, daftarAnggota, koreksiRekap, tambahKoreksiRekap, ubahKoreksiRekap, hapusKoreksiRekap } = pakaiToko();
  const [filter, setFilter] = useState("Semua");
  const [cari, setCari] = useState("");
  const [form, setForm] = useState(null);
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");
  const [hapusTarget, setHapusTarget] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const gabung = useMemo(() => daftarAnggota.map((a) => {
    const baru = absensi.filter((r) => r.anggotaId === a.id);
    const tepat = baru.filter((r) => r.status === "tepat").length;
    const lambat = baru.filter((r) => r.status === "lambat").length;
    const koreksi = koreksiRekap.find((item) => item.anggotaId === a.id);
    const pindaianTerakhir = baru.reduce((terakhir, r) => Math.max(terakhir, waktuTerakhir(r.dibuatPada)), 0);
    const koreksiTerakhir = waktuTerakhir(koreksi?.diperbaruiPada);
    const koreksiTerakhirSekali = Boolean(koreksi && (pindaianTerakhir === 0 || (koreksiTerakhir > 0 && koreksiTerakhir >= pindaianTerakhir)));
    if (koreksiTerakhirSekali) return { ...a, ...koreksi, lambat: koreksi.terlambat, manual: true, hasKoreksi: true, baru: baru.length };
    return { ...a, hadir: a.hadir + tepat, lambat: a.lambat + lambat, potongan: a.potongan + lambat * 5000, manual: false, hasKoreksi: Boolean(koreksi), baru: baru.length };
  }), [absensi, daftarAnggota, koreksiRekap]);

  const tampil = gabung.filter((a) => {
    const kunci = cari.trim().toLowerCase();
    const cocokNama = kunci === "" || a.nama.toLowerCase().includes(kunci) || (a.nim ?? "").includes(kunci);
    if (!cocokNama) return false;
    if (filter === "Rentan") return a.alpa >= 2 || a.potongan >= 20000;
    if (filter === "Bersih") return a.alpa === 0 && a.lambat === 0;
    return true;
  });

  const kosong = { anggotaId: "", hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0, catatan: "" };

  function bukaTambah() {
    setForm({ ...kosong });
    setGalat("");
    setPesan("");
  }

  function bukaUbah(a) {
    const koreksi = koreksiRekap.find((item) => item.anggotaId === a.id);
    setForm(koreksi ? { ...koreksi, id: koreksi.id } : { ...kosong, anggotaId: a.id, hadir: a.hadir, terlambat: a.lambat, izin: a.izin, sakit: a.sakit, alpa: a.alpa, potongan: a.potongan });
    setGalat("");
    setPesan("");
  }

  function tutupForm() {
    setForm(null);
    setGalat("");
  }

  function ubahField(field, value) {
    setForm((f) => ({ ...f, [field]: ["hadir", "terlambat", "izin", "sakit", "alpa", "potongan"].includes(field) ? Number(value) : value }));
  }

  async function simpan(e) {
    e.preventDefault();
    if (!form.anggotaId) {
      setGalat("Pilih anggota terlebih dahulu.");
      return;
    }
    setMenyimpan(true);
    const hasil = form.id
      ? await ubahKoreksiRekap(form.id, form)
      : await tambahKoreksiRekap(form);
    setMenyimpan(false);
    if (hasil?.gagal) {
      setGalat(hasil.gagal);
      return;
    }
    const nama = daftarAnggota.find((a) => a.id === form.anggotaId)?.nama ?? "Anggota";
    setPesan(`${form.id ? "Koreksi" : "Koreksi baru"} untuk ${nama} tersimpan.`);
    setForm(null);
  }

  async function jalankanHapus() {
    if (!hapusTarget) return;
    const hasil = await hapusKoreksiRekap(hapusTarget.id);
    if (hasil?.gagal) {
      setGalat(hasil.gagal);
      return;
    }
    setPesan(`Koreksi ${hapusTarget.nama} dihapus. Rekap kembali dihitung otomatis.`);
    setHapusTarget(null);
  }

  function unduh() {
    const baris = [["Nama", "NIM", "Suara", "Hadir", "Terlambat", "Izin", "Sakit", "Alpa", "Potongan", "Sumber", "Catatan"]];
    tampil.forEach((a) => baris.push([a.nama, a.nim, a.suara, a.hadir, a.lambat, a.izin, a.sakit, a.alpa, a.potongan, a.manual ? "Koreksi admin" : "Otomatis", a.catatan ?? ""]));
    const csv = baris.map((r) => r.map((nilai) => `"${String(nilai).replaceAll('"', '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const el = document.createElement("a");
    el.href = url; el.download = "rekap-padus.csv"; el.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="muncul">
      <KepalaBab atas="Dapat ditelusuri ke tiap pindaian" judul="Rekap kehadiran" Charity="Hadir, terlambat, izin, sakit, dan alpa yang sudah ditetapkan — lengkap dengan potongannya. Pindaian anggota masuk otomatis; admin dapat mengoreksi angka yang tidak sesuai." />
      {pesan && <p role="status" className="toast mb-3" style={{ borderColor: "var(--daun)" }}>{pesan}</p>}
      {galat && !form && <p role="alert" className="toast mb-3" style={{ borderColor: "var(--bata)" }}>{galat}</p>}
      <div className="buku mb-3 p-3">
        <div className="flex flex-col gap-2 md:flex-row">
          <input className="masukkan flex-1" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau NIM" aria-label="Cari rekap" />
          <button type="button" className="btn btn-primer whitespace-nowrap" onClick={bukaTambah}>+ Tambah koreksi / data uji</button>
        </div>
        <p className="keterangan mt-2">Koreksi admin menggantikan angka otomatis sampai dihapus. Gunakan untuk memperbaiki data atau membuat data uji tanpa mengubah riwayat pindaian.</p>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {["Semua", "Rentan", "Bersih"].map((f) => (
          <button key={f} className="btn btn-kertas" aria-pressed={filter === f} onClick={() => setFilter(f)} style={filter === f ? { borderColor: "var(--beludru)", color: "var(--beludru)" } : {}}>{f}</button>
        ))}
        <span className="flex-1" />
        <button className="btn btn-primer" type="button" onClick={unduh}>Unduh rekap</button>
      </div>
      <div className="buku overflow-x-auto" style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
        <table className="tabel min-w-[980px]">
          <thead><tr><th>Anggota</th><th>Hadir</th><th>Terlambat</th><th>Izin</th><th>Sakit</th><th>Alpa</th><th>Potongan</th><th>Aksi</th></tr></thead>
          <tbody>
            {tampil.map((a) => (
              <tr key={a.id}>
                <td><b>{a.nama}</b>{a.manual && <span className="ml-1"><Lencana nada="netral" anak="Koreksi admin" /></span>}</td>
                <td className="angka">{a.hadir}</td><td className="angka">{a.lambat}</td>
                <td className="angka">{a.izin}</td><td className="angka">{a.sakit}</td>
                <td className="angka" style={a.alpa >= 2 ? { color: "var(--bata)", fontWeight: 800 } : {}}>{a.alpa}</td>
                <td className="angka">{rupiah(a.potongan)}</td>
                <td><div className="flex flex-wrap gap-1.5"><button className="btn btn-kertas" type="button" style={{ padding: ".35rem .75rem", fontSize: 12.5 }} onClick={() => bukaUbah(a)}>{a.hasKoreksi ? "Ubah" : "Koreksi"}</button>{a.hasKoreksi && <button className="btn btn-kertas" type="button" style={{ padding: ".35rem .75rem", fontSize: 12.5, color: "var(--bata)", borderColor: "#E5B8B7" }} onClick={() => { setHapusTarget(a); setGalat(""); }}>Hapus</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {tampil.length === 0 && <p className="keterangan p-5">Tidak ada data rekap yang cocok.</p>}
      </div>
      {form && (
        <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#2a2b52]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="form-rekap-judul" onClick={tutupForm}>
          <form className="buku my-auto w-full max-w-xl p-5" onSubmit={simpan} onClick={(e) => e.stopPropagation()}>
            <h2 id="form-rekap-judul" className="judul-bab text-2xl">{form.id ? "Ubah koreksi rekap" : "Tambah koreksi / data uji"}</h2>
            <p className="keterangan mt-1">Isi angka final rekap untuk anggota yang dipilih.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="cap">Anggota</span><select className="masukkan" value={form.anggotaId} disabled={Boolean(form.id)} onChange={(e) => ubahField("anggotaId", e.target.value)}><option value="">Pilih anggota</option>{daftarAnggota.map((a) => <option key={a.id} value={a.id}>{a.nama} — {a.nim ?? "tanpa NIM"}</option>)}</select></label>
              {[["hadir", "Hadir"], ["terlambat", "Terlambat"], ["izin", "Izin"], ["sakit", "Sakit"], ["alpa", "Alpa"], ["potongan", "Potongan (Rp)"]].map(([field, label]) => <label key={field}><span className="cap">{label}</span><input className="masukkan angka" type="number" min="0" step="1" value={form[field]} onChange={(e) => ubahField(field, e.target.value)} /></label>)}
              <label className="sm:col-span-2"><span className="cap">Catatan admin</span><textarea className="masukkan min-h-20" value={form.catatan} onChange={(e) => ubahField("catatan", e.target.value)} placeholder="Contoh: koreksi setelah verifikasi manual" /></label>
            </div>
            {galat && <p role="alert" className="toast mt-3" style={{ borderColor: "var(--bata)" }}>{galat}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2"><button className="btn btn-kertas" type="button" onClick={tutupForm}>Batal</button><button className="btn btn-primer" type="submit" disabled={menyimpan}>{menyimpan ? "Menyimpan…" : "Simpan rekap"}</button></div>
          </form>
        </div>
      )}
      {hapusTarget && (
        <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center bg-[#2a2b52]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="hapus-rekap-judul" onClick={() => setHapusTarget(null)}>
          <div className="buku my-auto w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}><h2 id="hapus-rekap-judul" className="judul-bab text-2xl">Hapus koreksi?</h2><p className="keterangan mt-2">Rekap {hapusTarget.nama} akan kembali dihitung otomatis dari data anggota dan pindaian. Riwayat pindaian tidak dihapus.</p><div className="mt-5 flex justify-end gap-2"><button className="btn btn-kertas" type="button" onClick={() => setHapusTarget(null)}>Batal</button><button className="btn btn-primer" type="button" onClick={jalankanHapus}>Hapus koreksi</button></div></div>
        </div>
      )}
    </div>
  );
}

/* ——— Izin ——— */
function Izin() {
  const { pengajuan, putuskanPengajuan } = pakaiToko();
  return (
    <div className="muncul">
      <KepalaBab atas="Kandidat tidak hadir bukan vonis" judul="Izin dan sakit" Charity="Pengajuan dari anggota masuk ke sini otomatis. Setujui atau tolak sebelum status akhir ditetapkan. Keputusanmu tercatat untuk audit dan diteruskan ke anggota." />
      <div className="grid gap-3">
        {pengajuan.map((p) => (
          <article key={p.id} className="buku p-4">
            <div className="flex flex-wrap items-center gap-2">
              <b>{p.nama}</b>
              <Lencana nada="izin" anak={p.jenis} />
              <Lencana nada={p.status === "Menunggu" ? "lambat" : p.status === "Disetujui" ? "hadir" : "alpa"} anak={p.status} />
              <span className="keterangan ml-auto">{p.tanggal}</span>
            </div>
            <p className="keterangan mt-2">{p.alasan}</p>
            {p.status === "Menunggu" && (
              <div className="mt-3 flex gap-2">
                <button className="btn btn-primer" onClick={() => putuskanPengajuan(p.id, "Disetujui")}>Setujui</button>
                <button className="btn btn-kertas" onClick={() => putuskanPengajuan(p.id, "Ditolak")}>Tolak</button>
              </div>
            )}
          </article>
        ))}
        {pengajuan.length === 0 && <p className="keterangan">Belum ada pengajuan.</p>}
      </div>
    </div>
  );
}

/* ——— Aturan + kalkulator fee ——— */
function Aturan() {
  const [lambat, setLambat] = useState(1);
  const [alpa, setAlpa] = useState(0);
  const [gladi, setGladi] = useState(false);
  const [pengukuhan, setPengukuhan] = useState("tepat");
  const potongan = lambat * 5000 + alpa * 10000 + (gladi ? 25000 : 0) + (pengukuhan === "lambat" ? 25000 : 0);
  const gugur = alpa >= 3;
  const tanpaFee = pengukuhan === "alpa";
  const fee = tanpaFee || gugur ? 0 : Math.max(250000 - potongan, 0);
  return (
    <div className="muncul">
      <KepalaBab atas="Sembilan aturan dari dokumen padus" judul="Aturan dan fee" Charity="Geser angka di kalkulator untuk melihat cara potongan bekerja sebelum menetapkan evaluasi final." />
      <div className="buku mb-4">
        {aturan.map((r) => (
          <div key={r.kode} className="baris">
            <span className="angka font-extrabold" style={{ color: "var(--beludru)", minWidth: 72 }}>{r.kode}</span>
            <span className="flex-1 text-sm">{r.isi}</span>
            <Lencana nada={r.kode === "RULE-09" ? "izin" : "netral"} anak={r.jenis} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="buku p-5">
          <h3 className="font-extrabold">Kalkulator fee</h3>
          <div className="mt-3 grid gap-3">
            <label><span className="cap">Keterlambatan: {lambat} kejadian</span><input type="range" min="0" max="6" value={lambat} onChange={(e) => setLambat(+e.target.value)} className="w-full" /></label>
            <label><span className="cap">Alpa latihan: {alpa} kejadian</span><input type="range" min="0" max="4" value={alpa} onChange={(e) => setAlpa(+e.target.value)} className="w-full" /></label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={gladi} onChange={(e) => setGladi(e.target.checked)} /> Tidak hadir gladi (Rp25.000)</label>
            <label><span className="cap">Pengukuhan</span>
              <select className="masukkan" value={pengukuhan} onChange={(e) => setPengukuhan(e.target.value)}>
                <option value="tepat">Tepat waktu</option>
                <option value="lambat">Terlambat (Rp25.000)</option>
                <option value="alpa">Tidak hadir (tanpa fee)</option>
              </select>
            </label>
          </div>
        </div>
        <div className="p-5" style={{ background: "var(--tinta)", color: "#fff", borderRadius: "var(--radius-laci)" }}>
          <p style={{ color: "#C9CAE8" }} className="keterangan font-semibold">Perkiraan fee</p>
          <p className="display angka text-5xl">{rupiah(fee)}</p>
          <p className="mt-2 text-sm" style={{ color: "#C9CAE8" }}>Dasar Rp250.000 dikurangi {rupiah(potongan)}.</p>
          {(gugur || tanpaFee) && (
            <p role="status" className="mt-3 rounded-xl p-3 text-sm font-bold" style={{ background: "rgba(255,255,255,.12)" }}>
              {gugur ? "Tiga kali alpa: tidak bisa ikut serta lagi, fee tidak dibayarkan." : "Tidak hadir pengukuhan: tidak mendapat fee sama sekali."}
            </p>
          )}
          {!gugur && !tanpaFee && <p className="mt-3 text-sm">Tetap layak tampil. Fee final ditetapkan admin setelah verifikasi.</p>}
        </div>
      </div>
    </div>
  );
}

/* ——— Acara ——— */
function Acara() {
  return (
    <div className="muncul">
      <KepalaBab atas="Gladi dan pengukuhan dicatat terpisah" judul="Acara wisuda" Charity="Satu anggota satu catatan per acara. Status pengukuhan menentukan fee." />
      <div className="grid gap-4 md:grid-cols-2">
        <article className="buku p-5">
          <Lencana nada="lambat" anak="Gladi kotor" />
          <h3 className="judul-bab mt-2 text-2xl">Sabtu 26 Sep, 09.00</h3>
          <p className="keterangan mt-1">Gedung serbaguna. Toleransi 5 menit. Tidak hadir berarti potongan Rp25.000.</p>
          <div className="mt-3 flex gap-2 text-sm"><span className="angka font-extrabold">14 siap</span><span className="keterangan">2 perlu dihubungi</span></div>
        </article>
        <article className="p-5" style={{ background: "var(--kuningan-latar)", borderRadius: "var(--radius-laci)", border: "1.5px solid #D9C47A" }}>
          <Lencana nada="hadir" anak="Pengukuhan" />
          <h3 className="judul-bab mt-2 text-2xl">Minggu 27 Sep, 08.00</h3>
          <p className="mt-1 text-sm" style={{ color: "#5C4A12" }}>Tidak tepat waktu berarti potongan Rp25.000. Tidak hadir berarti tanpa fee — tanpa pengecualian.</p>
        </article>
      </div>
    </div>
  );
}

/* ——— Laporan ——— */
function Laporan() {
  return (
    <div className="muncul">
      <KepalaBab atas="Untuk admin dan bendahara" judul="Laporan" Charity="Empat jenis laporan: per latihan, per anggota, penalti, dan fee. Tampil sebagai tabel, diekspor ke Excel atau PDF." />
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["Per latihan", "Siapa hadir, terlambat, izin, sakit, alpa — per tanggal."],
          ["Per anggota", "Total tiap status dan persentase kehadiran satu periode."],
          ["Penalti", "Tiap potongan membawa anggota, aturan, sumber kejadian, dan nominal."],
          ["Fee", "Kelayakan, fee dasar, penalti, hasil akhir. Siap diverifikasi."],
        ].map(([judul, isi]) => (
          <div key={judul} className="buku p-5">
            <h3 className="font-extrabold">{judul}</h3>
            <p className="keterangan mt-1">{isi}</p>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-kertas" onClick={() => window.print()}>Cetak</button>
              <Link className="btn btn-hantu" to="/admin/rekap">Lihat data</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ——— Notifikasi ——— */
function Notifikasi() {
  const { notifikasi, tandaiDibaca } = pakaiToko();
  return (
    <div className="muncul">
      <KepalaBab atas="Tanpa duplikat per kejadian" judul="Notifikasi" Charity="Jadwal baru, perubahan, pembatalan, pengingat, hasil pindaian, dan status pengajuan — dibagikan dengan dasbor anggota." />
      <div className="buku">
        {notifikasi.map((n) => (
          <button key={n.id} className="baris baris--aksi" onClick={() => tandaiDibaca(n.id)}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 99, background: n.belumDibaca ? "var(--beludru)" : "var(--garis-tebal)", flex: "none" }} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-tight">{n.judul}</span>
              <span className="keterangan block">{n.isi}</span>
            </span>
            <span className="keterangan whitespace-nowrap">{n.waktu}</span>
          </button>
        ))}
        {notifikasi.length === 0 && <p className="keterangan p-5">Belum ada notifikasi. Setiap kejadian (jadwal, sesi, pindaian, izin) akan muncul di sini.</p>}
      </div>
    </div>
  );
}
