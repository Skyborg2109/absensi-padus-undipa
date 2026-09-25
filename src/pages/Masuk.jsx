import { Link } from "react-router-dom";
import { PetaRadius, Lencana } from "../components/ui.jsx";
import { pakaiToko } from "../lib/toko.jsx";

export default function Masuk() {
  const { sesi, absensiSesi, daftarAnggota } = pakaiToko();
  const diRuangan = new Set();
  if (sesi) absensiSesi(sesi.token).forEach((r) => diRuangan.add(r.anggotaId));
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
        <nav className="flex items-center gap-2" aria-label="Masuk">
          <Link className="btn btn-primer" to="/">Masuk anggota</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        {/* Hero = sesi yang sedang hidup, bukan angka + gradien */}
        <div className="grid items-end gap-8 pt-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="mb-3 flex flex-wrap items-center gap-2">
              <Lencana nada={sesi?.status === "terbuka" ? "hadir" : "netral"} anak={<span>{sesi?.status === "terbuka" && <span className="denyut" style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: "currentColor", marginRight: 6 }} />}{!sesi ? "Belum ada sesi" : sesi.status === "terbuka" ? "Sesi terbuka" : sesi.status === "jeda" ? "Sesi dijeda" : "Sesi ditutup"}</span>} />
              <span className="keterangan font-semibold">{sesi ? `${sesi.tanggal}, ${sesi.jam}` : "Menunggu sesi pertama"}</span>
            </p>
            <h1 className="display text-5xl sm:text-7xl">
              Datang, bernyanyi, tercatat.
            </h1>
            <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed" style={{ color: "var(--tinta-lunak)" }}>
              {sesi ? (
                <>Malam ini <b style={{ color: "var(--tinta)" }}>{sesi.nama}</b> di {sesi.lokasi}.
                Pindai kode di ruangan dalam radius 100 meter. Tepat waktu dihitung sampai {sesi.batasTepat},
                selebihnya tercatat terlambat dan memotong fee Rp250.000 sesuai aturan padus.</>
              ) : (
                <>Belum ada sesi absensi. Admin membuka sesi dari dasbor, anggota memindai kode di ruangan
                dalam radius 100 meter — semua tercatat dan masuk rekap otomatis.</>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link className="btn btn-primer" to="/">Pindai untuk hadir</Link>
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: "var(--garis)" }}>
              {[
                ["Sudah di ruangan", `${diRuangan.size} dari ${daftarAnggota.length}`],
                ["Batas tepat waktu", sesi?.batasTepat ?? "—"],
                ["Radius pindai", "100 meter"],
              ].map(([istilah, nilai]) => (
                <div key={istilah}>
                  <dt className="keterangan">{istilah}</dt>
                  <dd className="angka text-lg font-extrabold">{nilai}</dd>
                </div>
              ))}
            </dl>
          </div>

          <section aria-label="Denah sesi" className="lembar-qr muncul p-4">
            <PetaRadius jarak={34} akurasi={8} />
            <div className="px-2 pb-1 pt-3">
              <p className="keterangan"><b>{diRuangan.size} suara</b> sudah di dalam lingkaran</p>
            </div>
          </section>
        </div>

        <section className="grid gap-6 border-t py-6 md:grid-cols-3" style={{ borderColor: "var(--garis)" }} aria-label="Cara kerja">
          {[
            ["Pindai di ruangan", "Kode hanya hidup saat sesi dibuka. Satu anggota satu pindaian, tanpa titip absen."],
            ["Lokasi ikut memeriksa", "Di luar 100 meter pindaian ditolak. Jarak dan akurasi GPS disimpan untuk verifikasi."],
            ["Fee mengikuti aturan", "Terlambat Rp5.000, alpa Rp10.000, gladi Rp25.000. Tiga kali alpa berarti gugur."],
          ].map(([judul, isi]) => (
            <div key={judul} className="border-t-2 pt-3" style={{ borderColor: "var(--beludru)" }}>
              <h2 className="font-extrabold" style={{ letterSpacing: "-0.02em" }}>{judul}</h2>
              <p className="keterangan mt-1">{isi}</p>
            </div>
          ))}
        </section>
        <section className="border-t py-10" style={{ borderColor: "var(--garis)" }} aria-label="Untuk anggota">
          <div className="buku p-6 sm:p-8">
            <p className="keterangan font-semibold" style={{ color: "var(--beludru)" }}>Untuk anggota</p>
            <h2 className="judul-bab mt-1 text-3xl">Tahu posisimu sebelum naik panggung.</h2>
            <p className="keterangan mt-2 max-w-prose">Riwayat pindaian, sisa toleransi, status izin, dan perkiraan fee — ditulis dengan bahasa yang sama seperti pengumuman pelatih.</p>
            <div className="mt-4"><Link className="btn btn-hantu" to="/">Lihat dasbor anggota</Link></div>
          </div>
        </section>
      </main>

      <footer className="border-t px-5 py-6" style={{ borderColor: "var(--garis)" }}>
        <p className="keterangan mx-auto max-w-6xl">Buku hadir digital Padus Undipa. Radius pindai 100 m, tepat waktu dihitung sampai batas toleransi tiap jadwal. Mulailah dari dasbor admin: buat jadwal, buka sesi, lalu uji pindai sebagai anggota.</p>
      </footer>
    </div>
  );
}
