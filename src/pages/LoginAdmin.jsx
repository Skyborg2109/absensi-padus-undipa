import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pakaiAuth } from "../lib/auth.jsx";

export default function LoginAdmin() {
  const [nama, setNama] = useState("");
  const [sandi, setSandi] = useState("");
  const [tampilSandi, setTampilSandi] = useState(false);
  const [galat, setGalat] = useState("");
  const navigasi = useNavigate();
  const { masukAdmin } = pakaiAuth();

  async function masuk(e) {
    e.preventDefault();
    if (!nama.trim() || !sandi) {
      setGalat("Isi nama pengguna admin dan kata sandi sebelum masuk.");
      return;
    }
    const hasil = await masukAdmin(nama, sandi);
    if (hasil.gagal) {
      setGalat(hasil.gagal);
      return;
    }
    navigasi("/admin");
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
            <p className="keterangan" style={{ fontSize: 12.5 }}>Pintu admin</p>
          </div>
        </div>
        <Link className="keterangan font-bold" style={{ color: "var(--beludru)" }} to="/beranda">
          Lihat halaman depan
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-5 pb-20 pt-10">
        <h1 className="display text-5xl">Masuk sebagai admin.</h1>
        <p className="mt-4 text-[16px]" style={{ color: "var(--tinta-lunak)" }}>
          Kelola jadwal, sesi QR, anggota, rekap, dan fee dari buku admin.
        </p>
        <form onSubmit={masuk} className="buku mt-6 p-5" noValidate>
          <div className="grid gap-3">
            <label>
              <span className="cap">Nama pengguna admin</span>
              <input
                className="masukkan"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama pengguna admin"
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
                  placeholder="Kata sandi admin"
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
            Masuk sebagai admin
          </button>
          <p className="keterangan mt-3">
            Bukan admin? <Link className="font-bold" style={{ color: "var(--beludru)" }} to="/">Masuk sebagai anggota</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
