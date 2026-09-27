-- Koreksi rekap admin ditulis juga ke kolom kehadiran profiles sebagai angka
-- final anggota, sehingga absensi berikutnya melanjutkan dari angka terkoreksi.
-- Angka sebelum koreksi disimpan agar penghapusan koreksi bisa mengembalikan
-- data anggota ke hitungan otomatis.

alter table public.rekap_koreksi
  add column if not exists hadir_sebelum integer,
  add column if not exists terlambat_sebelum integer,
  add column if not exists izin_sebelum integer,
  add column if not exists sakit_sebelum integer,
  add column if not exists alpa_sebelum integer,
  add column if not exists potongan_sebelum integer;

update public.rekap_koreksi k
set hadir_sebelum = p.hadir,
    terlambat_sebelum = p.lambat,
    izin_sebelum = p.izin,
    sakit_sebelum = p.sakit,
    alpa_sebelum = p.alpa,
    potongan_sebelum = p.potongan
from public.profiles p
where p.id = k.member_id
  and k.hadir_sebelum is null;
