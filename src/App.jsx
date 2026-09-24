import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
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
  if (pengguna.peran !== peran) return <Navigate to={pengguna.peran === "admin" ? "/admin" : "/anggota"} replace />;
  return children;
}
