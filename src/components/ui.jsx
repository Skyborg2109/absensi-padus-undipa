import { useEffect, useId, useState } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { SUARA } from "../data/mock.js";
import { pakaiAuth } from "../lib/auth.jsx";

/* Tombol keluar: menghapus sesi lalu kembali ke pintu masuk. */
export function TombolKeluar() {
  const { keluar } = pakaiAuth();
  const navigasi = useNavigate();
  return (
    <button
      type="button"
      className="keterangan font-bold"
      style={{ color: "var(--beludru)" }}
      onClick={() => {
        keluar();
        navigasi("/", { replace: true });
      }}
    >
      Keluar
    </button>
  );
}

/* Denah radius 100 m: lingkaran bersih di atas kisi titik peta. */
export function PetaRadius({ jarak = 34, akurasi = 8, judul = "Aula lantai 3, radius 100 meter" }) {
  const pola = useId().replace(/:/g, "peta");
  const cx = 150;
  const cy = 128;
  const R = 92; // px untuk 100 m
  const sudut = -0.55;
  const rTitik = (Math.min(jarak, 138) / 100) * R;
  const x = cx + rTitik * Math.cos(sudut);
  const y = cy + rTitik * Math.sin(sudut);
  const diDalam = jarak <= 100;
  const warna = diDalam ? "var(--daun)" : "var(--bata)";
  const teks = `${jarak} m`;
  const lx = Math.min(Math.max(x, 48), 252);
  const ly = Math.max(y - 24, 22);
  const lebar = 26 + teks.length * 7.5;
  const rAkurasi = Math.min(Math.max(akurasi * 1.1, 7), 28);
  return (
    <figure className="m-0">
      <figcaption className="keterangan mb-2 font-bold" style={{ color: "var(--tinta)" }}>
        {judul}
      </figcaption>
      <svg
        viewBox="0 0 300 256"
        role="img"
        aria-label={`Denah radius. Jarak ${jarak} meter dari aula. ${diDalam ? "Di dalam radius." : "Di luar radius."}`}
        className="w-full"
      >
        <defs>
          <pattern id={pola} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#E2E4F3" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="300" height="256" rx="14" fill="#FBFBFE" />
        <rect x="0" y="0" width="300" height="256" rx="14" fill={`url(#${pola})`} />
        {/* Lingkaran 100 m */}
        <circle cx={cx} cy={cy} r={R} className="peta-cincin" />
        {/* Lingkaran 50 m */}
        <circle cx={cx} cy={cy} r={R / 2} fill="none" stroke="var(--garis-tebal)" strokeWidth="1.25" strokeDasharray="3 5" />
        <text x={cx} y={cy - R - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--tinta-lunak)">
          100 m
        </text>
        <text x={cx + R / 2 + 6} y={cy + 4} fontSize="11" fontWeight="700" fill="var(--tinta-lunak)">
          50 m
        </text>
        {/* Titik aula */}
        <rect x={cx - 28} y={cy - 22} width="56" height="44" rx="13" fill="var(--tinta)" />
        <text x={cx} y={cy + 5.5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">
          Aula
        </text>
        {/* Akurasi GPS + posisi anggota */}
        <circle
          cx={x}
          cy={y}
          r={rAkurasi}
          fill={diDalam ? "rgba(44,107,93,.13)" : "rgba(168,58,58,.13)"}
          stroke={warna}
          strokeWidth="1.5"
        />
        <circle cx={x} cy={y} r="7" fill={warna} stroke="#fff" strokeWidth="2.5" />
        <g>
          <rect
            x={lx - lebar / 2}
            y={ly - 12}
            width={lebar}
            height="24"
            rx="12"
            fill="#fff"
            stroke="var(--garis-tebal)"
            strokeWidth="1.25"
          />
          <text x={lx} y={ly + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill="var(--tinta)">
            {teks}
          </text>
        </g>
      </svg>
      <figcaption className="keterangan mt-2">
        Akurasi GPS ±{akurasi} m. Titik aula −5.1405, 119.4832.
      </figcaption>
    </figure>
  );
}

export function Lencana({ nada = "netral", anak }) {
  const peta = {
    hadir: "lencana--hadir",
    lambat: "lencana--lambat",
    izin: "lencana--izin",
    alpa: "lencana--alpa",
    netral: "lencana--netral",
  };
  return (
    <span className={`lencana ${peta[nada] ?? peta.netral}`}>
      <i aria-hidden="true" />
      {anak}
    </span>
  );
}

export function QrSesi({ token = "PDU" }) {
  const [sumber, setSumber] = useState("");
  const [galat, setGalat] = useState(false);

  useEffect(() => {
    let dibatalkan = false;
    setSumber("");
    setGalat(false);
    QRCode.toDataURL(token, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#2a2b52", light: "#ffffff" },
    }).then((url) => {
      if (!dibatalkan) setSumber(url);
    }).catch(() => {
      if (!dibatalkan) setGalat(true);
    });
    return () => {
      dibatalkan = true;
    };
  }, [token]);

  if (galat) return <div className="toast" role="alert">QR sesi gagal dibuat. Muat ulang halaman.</div>;
  if (!sumber) return <div className="qr-mati">Menyiapkan QR sesi…</div>;
  return <img src={sumber} alt={`Kode QR sesi ${token}`} className="h-auto w-full" />;
}

export function BarisAnggota({ orang, kanan = null, onPilih = null }) {
  const warna = SUARA[orang.suara]?.warna ?? "var(--garis-tebal)";
  const isi = (
    <>
      <span className="pita" style={{ background: warna }} aria-hidden="true" />
      <span
        aria-hidden="true"
        style={{
          width: 40, height: 40, borderRadius: "50%", flex: "none",
          background: "var(--kertas-2)", display: "grid", placeItems: "center",
          fontWeight: 800, fontSize: 13, color: "var(--tinta)",
        }}
      >
        {inisial(orang.nama)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold leading-tight">{orang.nama}</span>
        <span className="keterangan block truncate">
          {orang.suara}, {orang.nim ? `NIM ${orang.nim}` : "tanpa NIM"}
        </span>
      </span>
      {kanan}
    </>
  );
  if (onPilih)
    return (
      <button type="button" className="baris baris--aksi" onClick={onPilih}>
        {isi}
      </button>
    );
  return <div className="baris">{isi}</div>;
}

function inisial(nama) {
  return nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function KepalaBab({ atas, judul, Charity }) {
  return (
    <div className="mb-4">
      <p className="keterangan mb-1 font-semibold" style={{ color: "var(--beludru)" }}>
        {atas}
      </p>
      <h2 className="judul-bab text-2xl sm:text-3xl">{judul}</h2>
      {Charity ? <p className="keterangan mt-2 max-w-prose">{Charity}</p> : null}
    </div>
  );
}
