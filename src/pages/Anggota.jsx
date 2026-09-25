import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lencana, KepalaBab, PetaRadius, TombolKeluar } from "../components/ui.jsx";
import { rupiah, nilaiKelayakan } from "../data/mock.js";
import { pakaiAuth } from "../lib/auth.jsx";
import { pakaiToko } from "../lib/toko.jsx";

const TAB = [["dasbor", "Dasbor"], ["pindai", "Pindai"], ["riwayat", "Riwayat"], ["izin", "Izin"], ["notifikasi", "Notifikasi"], ["profil", "Profil"]];

export default function Anggota() {
  const { tab = "dasbor" } = useParams();
  const aktif = TAB.some(([t]) => t === tab) ? tab : "dasbor";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pengguna } = pakaiAuth();
  const { daftarAnggota, siapData, galatData } = pakaiToko();
  const daftar = daftarAnggota ?? [];
  const saya = daftar.find((a) => a.id === pengguna?.id) ?? daftar.find((a) => a.nim === pengguna?.nim) ?? { nama: pengguna?.nama ?? "Anggota", nim: pengguna?.nim ?? "—", suara: pengguna?.suara ?? "Sopran" };
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-6xl px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button className="grid h-10 w-10 shrink-0 place-items-center border-0 bg-transparent text-[var(--tinta)] lg:hidden" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu" aria-expanded={sidebarOpen} aria-controls="anggota-sidebar">
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
            <Link to="/beranda" className="hidden min-w-0 items-center gap-2 lg:flex">
              <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 12, background: "var(--daun)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, flex: "none" }}>M</span>
              <span className="min-w-0 leading-tight">
                <span className="block max-w-[10rem] truncate font-extrabold sm:max-w-none">{saya.nama}</span>
                <span className="keterangan block max-w-[10rem] truncate sm:max-w-none" style={{ fontSize: 12.5 }}>{saya.suara}, {saya.nim ? `NIM ${saya.nim}` : "tanpa NIM"}</span>
              </span>
            </Link>
            <Link to="/beranda" className="ml-auto min-w-0 truncate text-right text-sm font-extrabold lg:hidden" aria-label={`Kembali, ${saya.nama}`}>
              {saya.nama}
            </Link>
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link className="btn btn-primer px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm" to="/anggota/pindai">
              <span className="sm:hidden">Pindai</span>
              <span className="hidden sm:inline">Pindai untuk hadir</span>
            </Link>
            <TombolKeluar />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 pt-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {sidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-[#2a2b52]/30 lg:hidden" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}
        <aside id="anggota-sidebar" className={`buku fixed inset-y-0 left-0 z-40 flex w-[min(19rem,86vw)] flex-col overflow-y-auto p-3 transition-transform lg:sticky lg:top-4 lg:z-auto lg:inset-y-auto lg:h-[calc(100vh-2rem)] lg:w-full lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="keterangan font-extrabold" style={{ color: "var(--daun)" }}>Menu anggota</span>
            <button type="button" className="grid h-9 w-9 place-items-center border-0 bg-transparent text-[var(--tinta)] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar anggota">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          <nav aria-label="Bab anggota" className="mt-4 flex flex-col gap-1">
            {TAB.map(([t, label]) => (
              <Link key={t} className="tab-buku" aria-current={t === aktif ? "page" : undefined} to={t === "dasbor" ? "/anggota" : `/anggota/${t}`} onClick={() => setSidebarOpen(false)}>{label}</Link>
            ))}
          </nav>
          <div className="mt-auto border-t pt-3 lg:hidden"><TombolKeluar className="btn btn-hantu mt-2 w-full justify-start" /></div>
        </aside>
        <main className="min-w-0">
          {!siapData ? <div className="toast" role="status">Memuat data dari database…</div> : galatData ? <div className="toast" role="alert" style={{ borderColor: "var(--bata)" }}>Data database gagal dimuat: {galatData}</div> : <>
            {aktif === "dasbor" && <Dasbor saya={saya} />}
            {aktif === "pindai" && <Pindai />}
            {aktif === "riwayat" && <Riwayat />}
            {aktif === "izin" && <IzinSaya />}
            {aktif === "notifikasi" && <NotifikasiSaya />}
            {aktif === "profil" && <ProfilSaya />}
          </>}
        </main>
      </div>
    </div>
  );
}

function Dasbor({ saya }) {
  const { jadwal, sesi, absensi, koreksiRekap } = pakaiToko();
  const milikku = absensi.filter((r) => r.anggotaId === saya.id);
  const tepat = milikku.filter((r) => r.status === "tepat").length;
  const lambatPindaian = milikku.filter((r) => r.status === "lambat").length;
  const koreksi = koreksiRekap.find((item) => item.anggotaId === saya.id);
  const hadir = koreksi?.hadir ?? (saya.hadir ?? 0) + tepat;
  const lambat = koreksi?.terlambat ?? (saya.lambat ?? 0) + lambatPindaian;
  const izin = koreksi?.izin ?? saya.izin ?? 0;
  const sakit = koreksi?.sakit ?? saya.sakit ?? 0;
  const alpa = koreksi?.alpa ?? saya.alpa ?? 0;
  const potongan = koreksi?.potongan ?? (saya.potongan ?? 0) + lambatPindaian * 5000;
  const lay = nilaiKelayakan({ ...saya, hadir, lambat, izin, sakit, alpa, potongan });
  const fee = 250000 - potongan;
  return (
    <div className="muncul">
      <KepalaBab atas={sesi ? "Ada latihan" : "Belum ada sesi"} judul={`Halo, ${saya.nama.split(" ")[0]}.`} Charity={sesi ? `Sesi ${sesi.nama} di ${sesi.lokasi}. Datang sebelum ${sesi.batasTepat} agar tercatat tepat waktu.` : "Admin belum membuka sesi. Jadwal baru akan muncul di bawah saat ditambahkan."} />
      {!sesi ? (
        <div className="toast mb-4" role="status">
          <p className="font-extrabold">Belum ada sesi dibuka.</p>
          <p className="keterangan mt-1">Minta admin membuka sesi. Kamu tetap bisa mengajukan izin bila berhalangan.</p>
        </div>
      ) : sesi.status === "terbuka" ? (
        <div className="toast mb-4 muncul" role="status" style={{ borderColor: "var(--daun)" }}>
          <p className="flex flex-wrap items-center gap-2 font-extrabold">
            <Lencana nada="hadir" anak="Sesi dibuka" />
            {sesi.nama} — {sesi.lokasi}. Batas tepat {sesi.batasTepat}.
          </p>
          <div className="mt-3"><Link className="btn btn-primer" to="/anggota/pindai">Pindai untuk hadir</Link></div>
        </div>
      ) : (
        <div className="toast mb-4" role="status">
          <p className="flex flex-wrap items-center gap-2 font-extrabold">
            <Lencana nada="netral" anak={sesi.status === "jeda" ? "Sesi dijeda" : "Sesi ditutup"} />
            {sesi.status === "jeda" ? "Admin menjeda sesi. Tunggu dibuka kembali." : "Sesi sudah ditutup. Lihat riwayatmu di bawah."}
          </p>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <div className="p-5" style={{ background: "var(--tinta)", color: "#fff", borderRadius: "var(--radius-laci)" }}>
          <p className="keterangan font-semibold" style={{ color: "#C9CAE8" }}>Status tampilmu</p>
          <p className="judul-bab mt-1 text-3xl">{lay.label}</p>
          <p className="mt-1 text-sm" style={{ color: "#C9CAE8" }}>{lay.sebab}. Hadir {hadir} kali, terlambat {lambat} kali.</p>
          <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,.2)" }}>
            <p className="keterangan" style={{ color: "#C9CAE8" }}>Perkiraan fee</p>
            <p className="display angka text-4xl">{rupiah(fee)}</p>
            <p className="mt-1 text-sm" style={{ color: "#C9CAE8" }}>Dasar Rp250.000 dikurangi {rupiah(potongan)}. Final setelah verifikasi admin.</p>
          </div>
        </div>
        <div className="buku">
          <div className="baris" style={{ background: "var(--kertas-2)" }}><b>Jadwal terdekat</b></div>
          {jadwal.length === 0 && <p className="keterangan p-4">Belum ada jadwal dari admin.</p>}
          {jadwal.slice(0, 4).map((j) => (
            <div key={j.id} className="baris">
              <span className="flex-1 text-sm"><b>{j.nama}.</b> <span className="keterangan">{j.tanggal}, {j.jam} — {j.lokasi}.</span></span>
            </div>
          ))}
          <div className="p-3">
            {sesi?.status === "terbuka" ? (
              <Link className="btn btn-hantu w-full" to="/anggota/pindai">Pindai sekarang</Link>
            ) : (
              <button className="btn btn-kertas w-full" type="button" disabled>{sesi ? "Sesi belum dibuka" : "Belum ada sesi"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Pindai sungguhan: kamera membaca QR sesi + GPS memeriksa radius 100 m.
   Urutan pemeriksaan: token → lokasi → duplikat → waktu (FR-03/04/05). */
const TITIK_AULA = { lat: -5.1405, lon: 119.4832 }; // aula kampus Undipa, Jl. Perintis Kemerdekaan KM 9 (data Kemendikdasmen)
const RADIUS_ABSEN_M = 100; // FR-04, batas keras kebijakan — di luar ini ditolak
const KAWASAN_KAMPUS_M = 500; // perkiraan area sekitar kampus dari titik aula; bisa disetel admin

function jarakHaversine(lat1, lon1, lat2, lon2) {
  const keRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const a =
    Math.sin(keRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(keRad(lat1)) * Math.cos(keRad(lat2)) * Math.sin(keRad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatJarak(m) {
  if (m == null) return "—";
  if (m >= 1000) return `${(m / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;
  return `${m} meter`;
}

/* Zona anggota dari jarak ke aula: dalam ruangan → area kampus → jauh. */
function zonaLokasi(jarak) {
  if (jarak == null) return { label: "Lokasi belum diketahui", nada: "netral", saran: "Tunggu GPS menemukan lokasimu." };
  if (jarak <= RADIUS_ABSEN_M)
    return { label: "Di dalam ruang A213", nada: "hadir", saran: "Kamu di dalam radius 100 m — lanjut ke langkah 3." };
  if (jarak <= KAWASAN_KAMPUS_M)
    return { label: "Di area kampus", nada: "lambat", saran: "Kamu di sekitar kampus tapi di luar radius A213. Mendekatlah ke ruang A213." };
  return { label: "Jauh dari kampus", nada: "alpa", saran: `Absensi akan ditolak sampai kamu mendekat ke kampus.` };
}

function pesanKamera(e) {
  const m = String(e?.message ?? e ?? "");
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Kamera hanya bisa aktif melalui HTTPS atau localhost. Buka kembali memakai HTTPS.";
  }
  if (/permission|notallowed|denied/i.test(m)) {
    return "Izin kamera ditolak. Klik ikon kamera pada address bar, izinkan akses, lalu muat ulang halaman.";
  }
  if (/notfound|nodevice|devices/i.test(m)) {
    return "Tidak ada kamera di perangkat ini. Gunakan perangkat yang memiliki kamera.";
  }
  if (/secure|https|mediaDevices|getUserMedia/i.test(m)) {
    return "Browser tidak dapat membuka kamera. Periksa izin kamera dan gunakan HTTPS atau localhost.";
  }
  return "Kamera gagal dinyalakan. Periksa izin browser dan muat ulang halaman.";
}

/* Jendela kamera: Html5Qrcode me-render video ke div #qr-pembaca. */
function PemindaiKamera({ aktif, onBerhasil, onGagal }) {
  const berhasilRef = useRef(onBerhasil);
  berhasilRef.current = onBerhasil;
  const gagalRef = useRef(onGagal);
  gagalRef.current = onGagal;

  useEffect(() => {
    if (!aktif) return;
    let pemindai = null;
    let batal = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (batal) return;
        pemindai = new Html5Qrcode("qr-pembaca");
        await pemindai.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (teks) => berhasilRef.current?.(teks),
          () => {}
        );
        if (batal) await pemindai.stop().catch(() => {});
      } catch (e) {
        if (!batal) gagalRef.current?.(pesanKamera(e));
      }
    })();
    return () => {
      batal = true;
      (async () => {
        try {
          if (pemindai) {
            if (pemindai.isScanning) await pemindai.stop();
            pemindai.clear();
          }
        } catch {}
      })();
    };
  }, [aktif]);

  return <div id="qr-pembaca" aria-label="Jendela kamera pemindai QR" />;
}

function PopupPindai({ popup, onTutup }) {
  const tombolRef = useRef(null);
  const tutupRef = useRef(onTutup);
  tutupRef.current = onTutup;

  useEffect(() => {
    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tombolRef.current?.focus();
    function tutupDenganEscape(e) {
      if (e.key === "Escape") tutupRef.current?.();
    }
    document.addEventListener("keydown", tutupDenganEscape);
    return () => {
      document.body.style.overflow = overflowAwal;
      document.removeEventListener("keydown", tutupDenganEscape);
    };
  }, []);

  const sukses = popup.sukses;
  const nada = sukses ? (popup.terlambat ? "lambat" : "hadir") : popup.nada;
  const lencana = sukses ? (popup.terlambat ? "Terlambat" : "Berhasil") : popup.nada === "lambat" ? "Perlu tindakan" : popup.nada === "netral" ? "Informasi" : "Ditolak";
  const judul = sukses ? (popup.terlambat ? "Absensi tercatat terlambat" : "Absensi berhasil") : popup.judul;
  const isi = sukses ? (popup.terlambat ? `Batas kehadiran ${popup.batas}. Potongan Rp5.000 berlaku sesuai aturan.` : "Kehadiranmu sudah tersimpan dan masuk ke rekap admin.") : popup.isi;

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#2a2b52]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="popup-pindai-judul" onClick={onTutup}>
      <div className="buku my-auto w-full max-w-md p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-fit"><Lencana nada={nada} anak={lencana} /></div>
        <h2 id="popup-pindai-judul" className="judul-bab mt-3 text-2xl">{judul}</h2>
        <p className="keterangan mt-2">{isi}</p>
        <button ref={tombolRef} className="btn btn-primer mt-5" type="button" onClick={onTutup}>Selesai</button>
      </div>
    </div>
  );
}

function Pindai() {
  const { pengguna } = pakaiAuth();
  const { sesi, sudahAbsen, catatHadir } = pakaiToko();
  const [kameraAktif, setKameraAktif] = useState(false);
  const [kameraError, setKameraError] = useState("");
  const [lokasi, setLokasi] = useState(null); // { jarak, akurasi }
  const [gpsStatus, setGpsStatus] = useState("mati"); // mati|memuat|ok|gagal
  const [gpsPesan, setGpsPesan] = useState("");
  const [pakaiUji, setPakaiUji] = useState(false);
  const [ujiJarak, setUjiJarak] = useState(34);
  const [hasil, setHasil] = useState(null);
  const [popup, setPopup] = useState(null);
  const [menungguLokasi, setMenungguLokasi] = useState(false);
  const tokenTerpakai = useRef("");
  const hasilRef = useRef(null);

  const sudahPernah = sesi ? sudahAbsen(pengguna?.id, sesi.token) : false;
  const adaSesi = !!sesi;

  const jarakEfektif = pakaiUji ? ujiJarak : lokasi?.jarak ?? null;
  const akurasiEfektif = pakaiUji ? 8 : lokasi?.akurasi ?? null;

  function saatBerhasilScan(teks) {
    const bersih = String(teks ?? "").trim();
    if (!bersih || tokenTerpakai.current === bersih) return;
    tokenTerpakai.current = bersih;
    setKameraError("");
    setHasil({ nada: "netral", judul: "QR berhasil dibaca.", isi: "Memeriksa sesi, lokasi, dan status kehadiran." });
    if (jarakEfektif == null) {
      setMenungguLokasi(true);
      const menunggu = { nada: "lambat", judul: "Menunggu lokasi.", isi: "QR sudah terbaca. Tunggu GPS selesai agar kehadiran dapat divalidasi." };
      setHasil(menunggu);
      setPopup(menunggu);
      return;
    }
    setMenungguLokasi(false);
    void prosesToken(bersih);
  }

  const pantauId = useRef(null);

  function terapkanPosisi(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    setLokasi({
      jarak: Math.round(jarakHaversine(latitude, longitude, TITIK_AULA.lat, TITIK_AULA.lon)),
      akurasi: Math.round(accuracy ?? 0),
    });
    setGpsStatus("ok");
    setGpsPesan("");
  }

  function galatPosisi(err) {
    setGpsStatus("gagal");
    if (err.code === err.PERMISSION_DENIED)
      setGpsPesan("Izin lokasi ditolak. Aktifkan izin lokasi di browser, lalu coba lagi. Tanpa GPS, absensi tidak bisa divalidasi.");
    else if (err.code === err.POSITION_UNAVAILABLE)
      setGpsPesan("GPS tidak tersedia. Keluar ke area terbuka, aktifkan GPS, lalu coba lagi.");
    else if (err.code === err.TIMEOUT)
      setGpsPesan("GPS kehabisan waktu. Coba lagi — tetap di tempat terbuka agar sinyal terkunci.");
    else setGpsPesan("Lokasi gagal dibaca. Coba lagi.");
  }

  function bacaSekali() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("gagal");
      setGpsPesan("Perangkat ini tidak mendukung GPS. Coba perangkat lain.");
      return;
    }
    setGpsStatus("memuat");
    setGpsPesan("");
    navigator.geolocation.getCurrentPosition(terapkanPosisi, galatPosisi, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 5000,
    });
  }

  /* Deteksi otomatis: baca lokasi saat halaman dibuka, lalu pantau
     pergerakan anggota (di dalam ruangan / area kampus / jauh). */
  useEffect(() => {
    if (pakaiUji || !adaSesi) return; // mode uji menggantikan GPS; tanpa sesi tak perlu lokasi
    if (!("geolocation" in navigator)) {
      setGpsStatus("gagal");
      setGpsPesan("Perangkat ini tidak mendukung GPS. Coba perangkat lain.");
      return;
    }
    setGpsStatus("memuat");
    bacaSekali();
    pantauId.current = navigator.geolocation.watchPosition(terapkanPosisi, galatPosisi, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 5000,
    });
    return () => {
      if (pantauId.current != null) navigator.geolocation.clearWatch(pantauId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pakaiUji, adaSesi]);

  async function catat(token) {
    const hasilGagal = (nada, judul, isi) => {
      const item = { nada, judul, isi };
      setHasil(item);
      return item;
    };
    if (!sesi)
      return hasilGagal("lambat", "Belum ada sesi.", "Admin belum membuka sesi. Tunggu sesi dibuka, lalu pindai ulang.");
    if (sesi.status !== "terbuka")
      return hasilGagal("alpa", sesi.status === "jeda" ? "Sesi sedang dijeda." : "Sesi sudah ditutup.", "Kode tidak berlaku saat ini. Tunggu admin membuka sesi, lalu pindai ulang.");
    if (!token)
      return hasilGagal("alpa", "QR belum terbaca.", "Arahkan kamera ke QR sesi di layar aula lalu tunggu sampai berhasil.");
    if (jarakEfektif == null)
      return hasilGagal("lambat", "Lokasi belum siap.", "Tunggu GPS menemukan lokasimu — status zona tampil otomatis di atas. Tanpa GPS, absensi tidak bisa divalidasi.");
    if (token !== sesi.token)
      return hasilGagal("alpa", "Pindaian ditolak.", "Kode tidak berlaku untuk sesi ini. Minta admin menampilkan kode terbaru di layar aula, lalu pindai ulang.");
    if (jarakEfektif > RADIUS_ABSEN_M)
      return hasilGagal("alpa", zonaLokasi(jarakEfektif).label + ".", `Jarakmu ${formatJarak(jarakEfektif)} dari ruang A213, batasnya 100 meter. Mendekatlah ke gedung lalu catat ulang — tidak perlu memindai QR lagi.`);
    if (sudahPernah)
      return hasilGagal("alpa", "Sudah tercatat.", "Pindaian kedua dari akun yang sama ditolak sebagai duplikat. Tidak perlu memindai lagi.");
    const kini = new Date();
    const menit = kini.getHours() * 60 + kini.getMinutes();
    const jam = kini.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const terlambat = menit > sesi.batasMenit;
    const tersimpan = await catatHadir({
      anggotaId: pengguna?.id,
      nama: pengguna?.nama,
      token,
      jarak: jarakEfektif,
      akurasi: akurasiEfektif ?? 0,
      status: terlambat ? "lambat" : "tepat",
    });
    if (!tersimpan?.ok) {
      if (tersimpan?.alasan === "duplikat")
        return hasilGagal("alpa", "Sudah tercatat.", "Pindaian kedua dari akun yang sama ditolak sebagai duplikat. Tidak perlu memindai lagi.");
      return hasilGagal("alpa", "Absensi gagal disimpan.", "Data kehadiran belum berhasil masuk ke server. Periksa koneksi internet lalu coba pindai ulang.");
    }
    if (terlambat) {
      const item = { nada: "lambat", judul: "Tercatat terlambat.", isi: `Melewati batas ${sesi.batasTepat}. Potongan Rp5.000 berlaku satu kali untuk kejadian ini. Tercatat di rekap admin.`, sukses: true, terlambat: true, batas: sesi.batasTepat };
      setHasil(item);
      return item;
    }
    const item = { nada: "hadir", judul: "Hadir, tepat waktu.", isi: `Hari ini ${jam}, jarak ${formatJarak(jarakEfektif)}. Akurasi ±${akurasiEfektif ?? "?"} meter tersimpan untuk verifikasi dan sudah masuk rekap admin.`, sukses: true, terlambat: false };
    setHasil(item);
    return item;
  }

  async function prosesToken(token) {
    const hasilCatat = await catat(token);
    setPopup(hasilCatat);
    if (!hasilCatat?.sukses) return;
    setKameraAktif(false);
  }

  useEffect(() => {
    if (!menungguLokasi || jarakEfektif == null || !tokenTerpakai.current) return;
    setMenungguLokasi(false);
    void prosesToken(tokenTerpakai.current);
  }, [jarakEfektif, menungguLokasi]);

  const zona = zonaLokasi(jarakEfektif);

  function tutupPopup() {
    setPopup(null);
    requestAnimationFrame(() => hasilRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  if (!sesi) {
    return (
      <div className="muncul">
        <KepalaBab atas="Menunggu admin" judul="Pindai kehadiran" Charity="Belum ada sesi dibuka. Minta admin membuka sesi dari tab Sesi dan QR, lalu kembali ke sini." />
        <div className="toast" role="status">
          <p className="font-extrabold">Belum ada sesi untuk dipindai.</p>
          <p className="keterangan mt-1">Halaman ini aktif otomatis setelah admin menekan “Buka sesi dan buat kode QR”.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="muncul">
      <KepalaBab atas="Lokasi dideteksi otomatis" judul="Pindai kehadiran" Charity={`Sesi: ${sesi.nama}, dibuka ${sesi.dibukaPada} di ${sesi.lokasi}. Lokasimu dibaca otomatis saat halaman dibuka dan diperbarui saat kamu bergerak; kode hanya berlaku saat sesi dibuka.`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lembar-qr p-4">
          <p className="mb-2 text-sm font-extrabold">Langkah 1 — Pindai kode QR</p>
          {kameraAktif ? (
            <>
              <PemindaiKamera aktif={kameraAktif} onBerhasil={saatBerhasilScan} onGagal={(p) => { setKameraError(p); setKameraAktif(false); }} />
              <p className="keterangan mt-2">Arahkan bingkai ke kode QR di layar aula. Setelah terbaca, kehadiran diproses otomatis.</p>
              <button className="btn btn-kertas mt-2 w-full" type="button" onClick={() => setKameraAktif(false)}>Matikan kamera</button>
            </>
          ) : (
            <div className="qr-mati">
              <p className="font-extrabold">Kamera mati.</p>
              <p className="keterangan mt-1">Nyalakan kamera saat sudah di depan layar QR aula. Izin kamera diminta browser.</p>
              <button className="btn btn-primer mt-3 w-full" type="button" onClick={() => { setKameraError(""); setKameraAktif(true); }}>Nyalakan kamera</button>
            </div>
          )}
          {kameraError && <p role="alert" className="toast mt-3" style={{ borderColor: "var(--bata)" }}>{kameraError}</p>}
        </div>
        <div>
          <div className="lembar-qr p-4">
            <p className="mb-2 text-sm font-extrabold">Langkah 2 — Lokasimu terdeteksi otomatis</p>
            <div className="mb-3" role="status" aria-live="polite">
              <div className="flex flex-wrap items-center gap-2">
                <Lencana nada={zona.nada} anak={zona.label} />
                {jarakEfektif != null && !pakaiUji && (
                  <span className="keterangan angka">±{formatJarak(jarakEfektif)} dari ruang A213</span>
                )}
                {gpsStatus === "memuat" && jarakEfektif == null && !pakaiUji && (
                  <span className="keterangan">Mencari sinyal GPS…</span>
                )}
              </div>
              <p className="keterangan mt-1">{pakaiUji ? "Mode uji aktif — zona mengikuti slider di bawah." : zona.saran}</p>
            </div>
            <PetaRadius jarak={jarakEfektif ?? 34} akurasi={akurasiEfektif ?? 8} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button className="btn btn-kertas" type="button" onClick={bacaSekali} disabled={gpsStatus === "memuat" || pakaiUji}>
                {gpsStatus === "memuat" ? "Membaca GPS…" : lokasi ? "Perbarui lokasiku" : "Cari lokasiku"}
              </button>
              {!pakaiUji && <span className="keterangan">Diperbarui otomatis saat kamu bergerak.</span>}
            </div>
            {gpsStatus === "gagal" && gpsPesan && (
              <p role="alert" className="toast mt-3" style={{ borderColor: "var(--bata)" }}>
                {gpsPesan}{lokasi && !pakaiUji ? " Menampilkan lokasi terakhir yang diketahui." : ""}
              </p>
            )}
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={pakaiUji} onChange={(e) => setPakaiUji(e.target.checked)} />
              Mode uji (tanpa ke aula)
            </label>
            {pakaiUji && (
              <label className="mt-2 block">
                <span className="cap">Jarak simulasimu dari ruang A213: {ujiJarak} meter</span>
                <input type="range" min="5" max="180" value={ujiJarak} onChange={(e) => setUjiJarak(+e.target.value)} className="w-full" />
              </label>
            )}
          </div>
          <div className="buku mt-3 p-4" ref={hasilRef}>
            <p className="mb-2 text-sm font-extrabold">Langkah 3 — Hasil kehadiran</p>
            {sesi.status !== "terbuka" ? (
              <div className="toast" role="status">
                <p className="flex items-center gap-2 font-extrabold">
                  <Lencana nada="netral" anak={sesi.status === "jeda" ? "Dijeda" : "Ditutup"} />
                  {sesi.status === "jeda" ? "Sesi dijeda admin — tombol aktif lagi setelah dibuka." : "Sesi sudah ditutup admin."}
                </p>
              </div>
             ) : sudahPernah ? (
               <div className="toast" role="status" style={{ borderColor: "var(--daun)" }}>
                 <p className="flex items-center gap-2 font-extrabold"><Lencana nada="hadir" anak="Sudah tercatat" />Kehadiranmu sesi ini sudah masuk.</p>
                 <p className="keterangan mt-1">Lihat di Riwayat dan Rekap admin.</p>
               </div>
             ) : null}
            {hasil ? (
              <div className="toast muncul mt-3" role="status" style={{ borderColor: hasil.nada === "hadir" ? "var(--daun)" : hasil.nada === "lambat" ? "#C9A227" : "var(--bata)" }}>
                <p className="flex items-center gap-2 font-extrabold"><Lencana nada={hasil.nada} anak={hasil.nada === "hadir" ? "Tepat waktu" : hasil.nada === "lambat" ? "Terlambat" : "Ditolak"} />{hasil.judul}</p>
                <p className="keterangan mt-2">{hasil.isi}</p>
              </div>
            ) : (
              <p className="keterangan mt-2">Belum ada hasil. Hasil pindaianmu akan muncul di sini dan dikirim sebagai notifikasi.</p>
            )}
          </div>
        </div>
      </div>
      {popup && <PopupPindai popup={popup} onTutup={tutupPopup} />}
    </div>
  );
}

function ProfilSaya() {
  const { pengguna, gantiPassword } = pakaiAuth();
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [ulangiSandi, setUlangiSandi] = useState("");
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  async function ganti(e) {
    e.preventDefault();
    setPesan("");
    setGalat("");
    if (sandiBaru !== ulangiSandi) {
      setGalat("Konfirmasi password belum sama.");
      return;
    }
    setMenyimpan(true);
    const hasil = await gantiPassword(sandiLama, sandiBaru);
    setMenyimpan(false);
    if (hasil?.gagal) {
      setGalat(hasil.gagal);
      return;
    }
    setSandiLama("");
    setSandiBaru("");
    setUlangiSandi("");
    setPesan("Password berhasil diperbarui.");
  }

  return (
    <div className="muncul">
      <KepalaBab atas="Data akun dan keamanan" judul="Profil saya" Charity="Lihat identitas akun dan ubah password tanpa membuka email." />
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <section className="buku p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-extrabold text-white" style={{ background: "var(--daun)" }}>
              {(pengguna?.nama ?? "A").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="judul-bab truncate text-2xl">{pengguna?.nama ?? "Anggota"}</h2>
              <p className="keterangan">Akun anggota padus</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-t pt-4">
            <div><p className="keterangan">NIM</p><p className="font-extrabold">{pengguna?.nim ?? "—"}</p></div>
            <div><p className="keterangan">Kelompok suara</p><p className="font-extrabold">{pengguna?.suara ?? "—"}</p></div>
            <div><p className="keterangan">Status akun</p><Lencana nada="hadir" anak="Aktif" /></div>
          </div>
        </section>
        <section className="buku p-5">
          <h2 className="judul-bab text-2xl">Ganti password</h2>
          <p className="keterangan mt-1">Gunakan password lama untuk memastikan pemilik akun yang sedang masuk. Password baru minimal 8 karakter.</p>
          <form className="mt-4 grid gap-3" onSubmit={ganti}>
            <label>
              <span className="cap">Password lama</span>
              <input className="masukkan" type="password" value={sandiLama} onChange={(e) => setSandiLama(e.target.value)} autoComplete="current-password" />
            </label>
            <label>
              <span className="cap">Password baru</span>
              <input className="masukkan" type="password" value={sandiBaru} onChange={(e) => setSandiBaru(e.target.value)} autoComplete="new-password" />
            </label>
            <label>
              <span className="cap">Ulangi password baru</span>
              <input className="masukkan" type="password" value={ulangiSandi} onChange={(e) => setUlangiSandi(e.target.value)} autoComplete="new-password" />
            </label>
            {galat && <p role="alert" className="toast" style={{ borderColor: "var(--bata)", color: "var(--bata)" }}>{galat}</p>}
            {pesan && <p role="status" className="toast" style={{ borderColor: "var(--daun)", color: "var(--daun)" }}>{pesan}</p>}
            <div><button className="btn btn-primer" type="submit" disabled={menyimpan}>{menyimpan ? "Menyimpan…" : "Simpan password baru"}</button></div>
          </form>
        </section>
      </div>
    </div>
  );
}

function Riwayat() {
  const { pengguna } = pakaiAuth();
  const { absensi, sesi } = pakaiToko();
  const milikku = absensi.filter((r) => r.anggotaId === pengguna?.id);
  const baris = milikku.map((r) => [
    `${sesi?.nama ?? "Sesi"} — ${r.jam}`,
    `${r.status === "tepat" ? "Tepat waktu" : "Terlambat"}, ${r.jarak} m, akurasi ±${r.akurasi} m`,
    r.status === "tepat" ? "hadir" : "lambat",
    r.status === "tepat" ? "Tepat waktu" : "Terlambat",
  ]);
  return (
    <div className="muncul">
      <KepalaBab atas="Dari pindaianmu sendiri" judul="Riwayatmu" Charity="Setiap pindaian yang kamu catat muncul di sini — sama dengan yang terlihat di rekap admin." />
      {baris.length === 0 && <p className="keterangan mb-3">Belum ada riwayat. Pindai sesi aktif untuk mencatat kehadiran pertamamu.</p>}
      <div className="buku">
        {baris.map(([nama, rinci, nada, status], i) => (
          <div key={`${nama}-${i}`} className="baris">
            <span className="flex-1"><b className="block text-sm">{nama}</b><span className="keterangan">{rinci}</span></span>
            <Lencana nada={nada} anak={status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function IzinSaya() {
  const { pengguna } = pakaiAuth();
  const { pengajuan, kirimPengajuan, daftarAnggota } = pakaiToko();
  const daftar = daftarAnggota ?? [];
  const saya = daftar.find((a) => a.id === pengguna?.id) ?? daftar.find((a) => a.nim === pengguna?.nim) ?? { nama: pengguna?.nama ?? "Anggota", suara: pengguna?.suara ?? "Sopran" };
  const milikku = pengajuan.filter((p) => p.anggotaId === pengguna?.id);
  const [jenis, setJenis] = useState("Izin");
  const [alasan, setAlasan] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  return (
    <div className="muncul">
      <KepalaBab atas="Ajukan sebelum sesi ditutup" judul="Izin atau sakit" Charity="Pengajuanmu langsung masuk ke meja admin dan status keputusannya kembali ke sini. Status akhir ditetapkan setelah sesi ditutup." />
      <form className="buku p-4" onSubmit={async (e) => { e.preventDefault(); if (alasan.trim()) { const hasil = await kirimPengajuan({ nama: saya.nama, suara: saya.suara, jenis, alasan }); if (hasil?.gagal) { setTerkirim(false); return; } setAlasan(""); setTerkirim(true); } }}>
        <label><span className="cap">Jenis pengajuan</span>
          <select className="masukkan" value={jenis} onChange={(e) => setJenis(e.target.value)}>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
          </select>
        </label>
        <label className="mt-3 block"><span className="cap">Ceritakan keperluanmu</span>
          <textarea className="masukkan" rows="4" value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Tanggal, keperluan, dan lampiran surat bila ada" />
        </label>
        <button className="btn btn-primer mt-3" type="submit">Kirim pengajuan</button>
      </form>
      {terkirim && <p role="status" className="toast mt-3" style={{ borderColor: "var(--daun)" }}>Pengajuan terkirim ke admin. Kamu akan menerima kabar saat disetujui atau ditolak.</p>}
      <div className="buku mt-4">
        {milikku.map((p) => (
          <div key={p.id} className="baris">
            <span className="flex-1 text-sm"><b>{p.tanggal} — {p.jenis}.</b> <span className="keterangan">{p.alasan}</span></span>
            <Lencana nada={p.status === "Menunggu" ? "lambat" : p.status === "Disetujui" ? "hadir" : "alpa"} anak={p.status} />
          </div>
        ))}
        {milikku.length === 0 && <p className="keterangan p-5">Belum ada pengajuan darimu.</p>}
      </div>
    </div>
  );
}

function NotifikasiSaya() {
  const { notifikasi, tandaiDibaca } = pakaiToko();
  return (
    <div className="muncul">
      <KepalaBab atas="Jadwal, hasil pindaian, status izin" judul="Kabar untukmu" Charity="Sama dengan yang dilihat admin — jadwal baru, sesi dibuka, hasil pindaian, dan keputusan izin. Pesan dibaca ditandai dengan mengetuknya." />
      {notifikasi.length === 0 && <p className="keterangan mb-3">Belum ada kabar. Notifikasi muncul saat admin membuat jadwal, membuka sesi, atau memutus izinmu.</p>}
      <div className="buku">
        {notifikasi.map((n) => (
          <button key={n.id} className="baris baris--aksi" onClick={() => tandaiDibaca(n.id)}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 99, background: n.belumDibaca ? "var(--beludru)" : "var(--garis-tebal)", flex: "none" }} />
            <span className="flex-1 text-left"><b className="block text-sm">{n.judul}</b><span className="keterangan">{n.isi}</span></span>
            <span className="keterangan whitespace-nowrap">{n.waktu}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
