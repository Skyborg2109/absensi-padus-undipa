-- Perbaiki status pindaian yang salah berlabel "lambat".
-- Sesi dengan batas waktu kosong membuat anggota tepat waktu tercatat terlambat,
-- sehingga muncul potongan Rp5.000. Status dihitung ulang dari jam pindaian
-- dibandingkan batas tepat waktu sesinya (aturan yang sama dengan aplikasi).

update public.absensi a
   set status = 'tepat'
  from public.sesi s
 where a.token = s.token
   and s.batas_menit is not null
   and public.menit_dari_jam(a.jam) is not null
   and public.menit_dari_jam(a.jam) <= s.batas_menit
   and a.status = 'lambat';
