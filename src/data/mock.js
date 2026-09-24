// Daftar anggota (untuk login demo) + acuan aturan. Angka mulai dari nol:
// pengujian dimulai dari keadaan kosong lewat toko global.

export const SUARA = {
  Sopran: { warna: "var(--sopran)", deskripsi: "Suara atas, melodi utama" },
  Alto: { warna: "var(--alto)", deskripsi: "Suara tengah, pengikat harmoni" },
  Tenor: { warna: "var(--tenor)", deskripsi: "Suara tinggi pria, jembatan oktaf" },
  Bas: { warna: "var(--bas)", deskripsi: "Suara dasar, fondasi akor" },
};

export const anggota = [
  { id: "A01", nama: "Maria Lestari", nim: "202201011", suara: "Sopran", angkatan: 2022, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A02", nama: "Yohana Priska", nim: "202301042", suara: "Sopran", angkatan: 2023, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A03", nama: "Clara Nathania", nim: "202401008", suara: "Sopran", angkatan: 2024, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A04", nama: "Debora Sinta", nim: "202201097", suara: "Sopran", angkatan: 2022, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A05", nama: "Ruth Angelina", nim: "202301077", suara: "Alto", angkatan: 2023, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A06", nama: "Marta Wijaya", nim: "202201055", suara: "Alto", angkatan: 2022, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A07", nama: "Kesya Putri", nim: "202401033", suara: "Alto", angkatan: 2024, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A08", nama: "Lydia Monika", nim: "202301019", suara: "Alto", angkatan: 2023, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A09", nama: "Yosua Damara", nim: "202201063", suara: "Tenor", angkatan: 2022, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A10", nama: "Rafael Junio", nim: "202301088", suara: "Tenor", angkatan: 2023, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A11", nama: "Gilang Pratama", nim: "202401021", suara: "Tenor", angkatan: 2024, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A12", nama: "Samuel Tandi", nim: "202201034", suara: "Tenor", angkatan: 2022, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A13", nama: "Petrus Allo", nim: "202301051", suara: "Bas", angkatan: 2023, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A14", nama: "Daniel Somba", nim: "202201080", suara: "Bas", angkatan: 2022, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A15", nama: "Abraham Kala", nim: "202401012", suara: "Bas", angkatan: 2024, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
  { id: "A16", nama: "Yeremia Rante", nim: "202301066", suara: "Bas", angkatan: 2023, hadir: 0, lambat: 0, izin: 0, sakit: 0, alpa: 0, potongan: 0 },
];

export const aturan = [
  { kode: "RULE-01", isi: "Fee penuh Rp250.000 bila hadir penuh dan tepat waktu dari latihan pertama sampai pengukuhan.", jenis: "Evaluasi periode" },
  { kode: "RULE-02", isi: "Terlambat latihan: potongan Rp5.000 setiap kejadian.", jenis: "Per kejadian" },
  { kode: "RULE-03", isi: "Tidak hadir latihan: potongan Rp10.000 setiap kejadian.", jenis: "Per kejadian" },
  { kode: "RULE-04", isi: "Tidak hadir 3 kali: tidak bisa ikut serta lagi.", jenis: "Batas kelayakan" },
  { kode: "RULE-05", isi: "Tidak hadir 2 hari sebelum wisuda: tidak bisa ikut serta lagi.", jenis: "Aturan pra-wisuda" },
  { kode: "RULE-06", isi: "Tidak hadir gladi: potongan Rp25.000.", jenis: "Acara" },
  { kode: "RULE-07", isi: "Tidak tepat waktu saat pengukuhan: potongan Rp25.000.", jenis: "Acara" },
  { kode: "RULE-08", isi: "Tidak hadir pengukuhan: tidak mendapat fee sama sekali.", jenis: "Evaluasi fee" },
  { kode: "RULE-09", isi: "Dana tambahan bagi anggota yang memenuhi empat syarat. Nominal menunggu keputusan admin.", jenis: "Menunggu keputusan" },
];

export const rupiah = (n) =>
  "Rp" + n.toLocaleString("id-ID");

export function nilaiKelayakan(a) {
  if (a.alpa >= 3) return { label: "Tidak bisa ikut serta", nada: "alpa", sebab: `${a.alpa} kali tidak hadir` };
  if (a.alpa === 2) return { label: "Satu absen lagi gugur", nada: "lambat", sebab: "Sudah 2 kali tidak hadir" };
  if (a.potongan >= 20000) return { label: "Perlu perhatian", nada: "lambat", sebab: `Potongan ${rupiah(a.potongan)}` };
  return { label: "Layak tampil", nada: "hadir", sebab: "Hadir teratur" };
}
