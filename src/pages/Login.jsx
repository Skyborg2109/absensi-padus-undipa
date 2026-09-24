import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lencana } from "../components/ui.jsx";
import { pakaiAuth } from "../lib/auth.jsx";
import { pakaiToko } from "../lib/toko.jsx";

export default function Login() {
  const [identitas, setIdentitas] = useState("");
  const [sandi, setSandi] = useState("");
  const [tampilSandi, setTampilSandi] = useState(false);
  const [galat, setGalat] = useState("");
  const navigasi = useNavigate();
  const { masukAnggota } = pakaiAuth();
  const { sesi, absensiSesi, daftarAnggota } = pakaiToko();
  const diRuangan = new Set();
  if (sesi) absensiSesi(sesi.token).forEach((r) => diRuangan.add(r.anggotaId));

  async function masuk(e) {
    e.preventDefault();
    if (!identitas.trim() || !sandi) {
      setGalat("Isi NIM atau surel kampus dan kata sandi sebelum masuk.");
      return;
    }
    const hasil = await masukAnggota(identitas, sandi);
    if (hasil.gagal) {
      setGalat(hasil.gagal);
      return;
    }
    navigasi("/anggota");
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            style={{
              width: 38, height: 38, borderRadius: 12, background: "var(--beludru)",
              display: "grid", placeItems: "center", color: "#fff", fontWeight: 800,
            }}
          >
            P
          </span>
          <div className="leading-tight">
            <p className="font-extrabold" style={{ letterSpacing: "-0.02em" }}>Padus Undipa</p>
            <p className="keterangan" style={{ fontSize: 12.5 }}>Buku hadir digital paduan suara</p>
          </div>
        </div>
        <Link className="keterangan font-bold" style={{ color: "var(--beludru)" }} to="/beranda">
          Lihat halaman depan
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-6 px-5 pb-20 pt-10 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="mb-3">
            <Lencana nada="hadir" anak="Sesi malam ini dibuka 18.40" />
          </p>
          <h1 className="display text-5xl sm:text-6xl">Masuk ke buku hadir.</h1>
          <p className="mt-4 max-w-[52ch] text-[16px]" style={{ color: "var(--tinta-lunak)" }}>
            Masuk dengan akun kampus untuk memindai kehadiran, melihat riwayat,
            dan memantau fee. Halaman ini untuk anggota padus.
          </p>

          <form onSubmit={masuk} className="buku mt-6 max-w-xl p-5" noValidate>
            <div className="grid gap-3">
              <label>
                <span className="cap">NIM atau surel kampus</span>
                <input
                  className="masukkan"
                  value={identitas}
                  onChange={(e) => setIdentitas(e.target.value)}
                  placeholder="Misal: 202201011 atau nama@undipa.ac.id"
                  autoComplete="username"
                />
              </label>
              <label>
                <span className="cap">Kata sandi</span>
                <span style={{ position: "relative", display: "block" }}>
                  <input
                    className="masukkan"
                    type={tampilSandi ? "text" : "password"}
                    value={sandi}
                    onChange={(e) => setSandi(e.target.value)}
                    placeholder="Kata sandi akun kampus"
                    autoComplete="current-password"
                    style={{ paddingRight: "4.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setTampilSandi((s) => !s)}
                    className="keterangan font-bold"
                    style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--beludru)" }}
                  >
                    {tampilSandi ? "Sembunyi" : "Lihat"}
                  </button>
                </span>
              </label>
            </div>

            {galat && (
              <p role="alert" className="toast mt-3 text-sm font-semibold" style={{ borderColor: "var(--bata)", color: "var(--bata)" }}>
                {galat}
              </p>
            )}

            <button className="btn btn-primer mt-4 w-full" type="submit">
              Masuk
            </button>
            <div className="toast mt-3 text-sm" style={{ borderColor: "var(--garis-tebal)" }}>
              <b>Akun demo.</b> NIM <span className="angka font-extrabold">202201011</span> dengan
              sandi <span className="angka font-extrabold">padus2026</span>. Setiap NIM di daftar
              anggota bisa dipakai dengan sandi yang sama.
            </div>
            <p className="keterangan mt-2">Lupa kata sandi? Hubungi pelatih untuk mengatur ulang.</p>
          </form>
        </div>

        <aside className="p-6 lg:sticky lg:top-6" style={{ background: "var(--tinta)", color: "#fff", borderRadius: "var(--radius-laci)" }} aria-label="Jadwal malam ini">
          <p className="keterangan font-semibold" style={{ color: "#C9CAE8" }}>Sesi absensi</p>
          {sesi ? (
            <>
              <h2 className="judul-bab mt-1 text-3xl">{sesi.nama}</h2>
              <p className="mt-2 text-sm" style={{ color: "#C9CAE8" }}>
                {sesi.tanggal}, {sesi.jam}. {sesi.lokasi}.
                Batas tepat waktu {sesi.batasTepat}, radius pindai 100 meter.
              </p>
            </>
          ) : (
            <>
              <h2 className="judul-bab mt-1 text-3xl">Belum ada sesi</h2>
              <p className="mt-2 text-sm" style={{ color: "#C9CAE8" }}>
                Admin belum membuka sesi absensi. Masuk dulu — kabar terbaru menunggumu di dalam.
              </p>
            </>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,.2)" }}>
            <div>
              <p className="keterangan" style={{ color: "#C9CAE8" }}>Sudah di ruangan</p>
              <p className="angka text-xl font-extrabold">{diRuangan.size} dari {daftarAnggota.length}</p>
            </div>
            <div>
              <p className="keterangan" style={{ color: "#C9CAE8" }}>Kode sesi</p>
              <p className="angka text-xl font-extrabold">{sesi?.token ?? "—"}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
