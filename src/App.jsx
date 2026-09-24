import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import Masuk from "./pages/Masuk.jsx";
import Admin from "./pages/Admin.jsx";
import Anggota from "./pages/Anggota.jsx";
import { PenyediaAuth, pakaiAuth } from "./lib/auth.jsx";
import { PenyediaToko } from "./lib/toko.jsx";

export default function App() {
  return (
    <HashRouter>
      <PenyediaAuth>
        <PenyediaToko>
        <a href="#isi" className="sr-only" onClick={(e) => { e.preventDefault(); document.getElementById("isi")?.focus(); }}>Lewati ke isi</a>
        <div id="isi" tabIndex="-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin-masuk" element={<LoginAdmin />} />
            <Route path="/beranda" element={<Masuk />} />
            <Route path="/admin" element={<PerluMasuk peran="admin"><Admin /></PerluMasuk>} />
            <Route path="/admin/:tab" element={<PerluMasuk peran="admin"><Admin /></PerluMasuk>} />
            <Route path="/anggota" element={<PerluMasuk peran="anggota"><Anggota /></PerluMasuk>} />
            <Route path="/anggota/:tab" element={<PerluMasuk peran="anggota"><Anggota /></PerluMasuk>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </PenyediaToko>
      </PenyediaAuth>
    </HashRouter>
  );
}

/* Penjaga rute: belum masuk diarahkan ke pintu yang sesuai,
   salah peran mendapat halaman akses ditolak (TC-12). */
function PerluMasuk({ peran, children }) {
  const { pengguna, siap } = pakaiAuth();
  if (!siap) return null;
  if (!pengguna) return <Navigate to={peran === "admin" ? "/admin-masuk" : "/"} replace />;
  if (pengguna.peran !== peran) return <AksesDitolak butuh={peran} milik={pengguna.peran} />;
  return children;
}

function AksesDitolak({ butuh, milik }) {
  const { keluar } = pakaiAuth();
  const navigasi = useNavigate();
  const rumah = milik === "admin" ? "/admin" : "/anggota";
  function tutup() {
    keluar();
    navigasi(butuh === "admin" ? "/admin-masuk" : "/", { replace: true });
  }
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="judul-bab text-4xl">Tidak punya akses.</h1>
      <p className="keterangan mt-3">
        Halaman ini khusus {butuh === "admin" ? "admin" : "anggota"}.
        Kamu masuk sebagai {milik === "admin" ? "admin" : "anggota"}.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button className="btn btn-primer" type="button" onClick={() => navigasi(rumah)}>
          Kembali ke dasborku
        </button>
        <button className="btn btn-kertas" type="button" onClick={tutup}>
          Keluar
        </button>
      </div>
    </main>
  );
}
