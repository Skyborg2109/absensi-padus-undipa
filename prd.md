PRODUCT REQUIREMENTS DOCUMENT (PRD)
Sistem Manajemen Absensi Paduan Suara Kampus
Product Requirements Document

Versi 1.0

Sistem Absensi Padus

Platform berbasis web untuk mengelola jadwal latihan, absensi QR Code berbasis lokasi, kehadiran anggota, laporan, notifikasi, dan perhitungan fee sesuai ketentuan padus.

Platform

Web Responsif

Frontend

React + Vite

Backend / Database

Supabase

Metode absensi

QR Code + GPS

Pengguna

Admin dan Anggota

Dokumen Referensi

Dokumen ini disusun berdasarkan:

Kebutuhan fitur dan keputusan operasional yang telah ditetapkan.

File PDF SYARAT-SYARAT PADUS yang diberikan, sebagai dasar aturan kehadiran, potongan, dan fee. 
SYARAT PADUSS Fix.pdf

Tujuan PRD: Menjadi acuan bagi proses perancangan UI/UX, pengembangan frontend, pembuatan database Supabase, serta pengujian sistem.

1. Pendahuluan
1.1 Latar Belakang

Kegiatan paduan suara kampus membutuhkan pengelolaan kehadiran anggota yang teratur, terutama ketika terdapat latihan, gladi, pengukuhan, dan acara wisuda. Pencatatan manual dapat menyulitkan pengurus dalam memantau kehadiran, keterlambatan, ketidakhadiran, serta perhitungan potongan dan fee.

Oleh karena itu, diperlukan sistem manajemen absensi berbasis web yang memungkinkan anggota melakukan absensi menggunakan QR Code dengan validasi lokasi GPS. Sistem juga menyediakan pengelolaan jadwal latihan yang fleksibel, rekap kehadiran, laporan, notifikasi, serta perhitungan administrasi sesuai peraturan padus.

1.2 Rumusan Masalah

Bagaimana mengelola jadwal latihan yang dapat berubah sesuai keputusan pelatih?

Bagaimana memastikan absensi QR Code hanya valid apabila anggota berada dalam radius lokasi latihan?

Bagaimana mencatat kehadiran dan keterlambatan secara terstruktur?

Bagaimana menerapkan peraturan potongan dan persyaratan fee dari dokumen padus?

Bagaimana membantu pengurus memantau kelayakan anggota mengikuti kegiatan dan menerima fee?

1.3 Tujuan Produk

Menyediakan sistem absensi padus berbasis web yang mudah digunakan.

Menerapkan validasi lokasi dengan radius default 100 meter.

Mengelola jadwal latihan secara fleksibel.

Mencatat kehadiran, keterlambatan, dan ketidakhadiran anggota.

Mengotomatisasi perhitungan potongan dan evaluasi fee berdasarkan aturan yang ditetapkan.

Menyediakan laporan dan notifikasi bagi pengurus serta anggota.

1.4 Sasaran Pengguna

Pengguna

	

Deskripsi




Admin / Pengurus

	

Mengelola seluruh operasional sistem




Anggota Padus

	

Melakukan absensi dan melihat informasi kehadiran




Pelatih / Koordinator

	

Pihak yang dapat memberikan keputusan operasional sesuai kewenangan yang diberikan

Catatan: Role pelatih/koordinator belum ditetapkan sebagai role terpisah dalam keputusan sebelumnya. Pada MVP, aksesnya dapat dikelola oleh admin, kemudian dikembangkan menjadi role khusus jika dibutuhkan.

2. Ruang Lingkup Produk
2.1 Fitur yang Termasuk
In Scope

Jadwal Latihan

Membuat, mengubah, dan membatalkan jadwal secara fleksibel.

Absensi QR Code + GPS

Validasi sesi, lokasi, dan waktu absensi.

Manajemen Anggota

Pengelolaan profil, NIM, jenis suara, dan status anggota.

Rekap & Laporan

Pemantauan kehadiran, ekspor data, dan laporan administrasi.

Peraturan & Fee

Perhitungan penalti dan evaluasi kelayakan fee sesuai aturan.

Notifikasi

Informasi jadwal, perubahan kegiatan, dan hasil absensi.

2.2 Di Luar Ruang Lingkup MVP

Fitur berikut belum menjadi bagian dari versi awal kecuali diputuskan kemudian:

Integrasi pembayaran fee secara otomatis ke rekening anggota.

Pelacakan lokasi anggota secara terus-menerus selama latihan.

Check-out absensi.

Pengenalan wajah.

Integrasi kalender eksternal.

Aplikasi native Android/iOS terpisah.

Sistem menggunakan absensi masuk tanpa check-out sesuai keputusanmu.

3. Persyaratan Fungsional
FR-01 — Autentikasi dan Manajemen Pengguna

ID

	

Persyaratan




FR-01.1

	

Sistem menyediakan login pengguna




FR-01.2

	

Sistem membedakan akses admin dan anggota




FR-01.3

	

Admin dapat mengelola data anggota




FR-01.4

	

Anggota dapat melihat profil dan riwayatnya sendiri




FR-01.5

	

Akses data sensitif dibatasi berdasarkan role

Acceptance Criteria

Pengguna dapat login dengan akun yang valid.

Anggota tidak dapat mengakses halaman administrasi tanpa izin.

Admin dapat mengelola data anggota aktif.

FR-02 — Jadwal Latihan
Fitur

Admin dapat:

Menambahkan jadwal latihan.

Mengubah tanggal dan jam.

Mengubah lokasi.

Menentukan toleransi keterlambatan.

Membatalkan jadwal.

Melihat jadwal yang akan datang dan jadwal sebelumnya.

Data wajib

Field

	

Wajib




Nama kegiatan

	

Ya




Tanggal

	

Ya




Jam mulai

	

Ya




Jam selesai

	

Ya




Lokasi

	

Ya




Koordinat lokasi

	

Ya




Radius

	

Ya




Toleransi keterlambatan

	

Ya

Acceptance Criteria

Admin dapat membuat jadwal tanpa harus menggunakan jadwal berulang.

Jadwal dapat diubah sebelum pelaksanaan.

Sistem menyimpan riwayat perubahan penting apabila diperlukan untuk audit.

FR-03 — Absensi QR Code
Fitur

Admin membuka sesi absensi untuk jadwal tertentu.

Sistem menghasilkan token QR unik.

Anggota melakukan scan QR.

Sistem memvalidasi token dan status sesi.

Satu anggota tidak dapat melakukan absensi ganda pada sesi yang sama.

Acceptance Criteria

QR Code hanya berlaku pada sesi yang aktif.

Token yang tidak valid ditolak.

Absensi kedua dari anggota yang sama ditolak atau ditandai sebagai duplikat.

QR Code tidak menjadi satu-satunya faktor validasi; GPS wajib diperiksa.

FR-04 — Validasi Lokasi GPS
Aturan Utama

Radius default: 100 meter.

Anggota di luar radius: absensi langsung ditolak.

Sistem menyimpan jarak dan akurasi GPS untuk keperluan validasi.

Tidak ada check-out.

Acceptance Criteria

Skenario

	

Hasil




Jarak ≤ 100 meter dan token valid

	

Lanjut validasi waktu




Jarak > 100 meter

	

Ditolak




GPS tidak tersedia

	

Tidak dapat menyelesaikan validasi lokasi




Token tidak valid

	

Ditolak




Anggota sudah absen

	

Duplikat ditolak

Radius 100 meter merupakan konfigurasi yang dipilih. Untuk validasi teknis, sistem perlu mempertimbangkan akurasi lokasi yang dilaporkan perangkat, tetapi tidak boleh mengubah batas kebijakan secara diam-diam.

FR-05 — Penentuan Ketepatan Waktu

Sistem menggunakan toleransi keterlambatan yang dapat diatur admin.

Formula
Batas tepat waktu =
Jam mulai latihan + toleransi admin

Contoh pengaturan:

Jam mulai: 15:00
Toleransi: 10 menit
Batas: 15:10
Acceptance Criteria

Admin dapat mengatur toleransi.

Sistem menyimpan waktu server sebagai sumber utama pencatatan.

Kehadiran setelah batas toleransi ditandai sebagai late.

Potongan keterlambatan tidak dihitung dua kali untuk satu kejadian.

FR-06 — Rekap Kehadiran

Sistem harus dapat menampilkan:

Total hadir.

Total terlambat.

Total izin.

Total sakit.

Total alpa / ketidakhadiran yang telah ditetapkan.

Persentase kehadiran.

Riwayat per latihan.

Filter

Periode tanggal.

Nama anggota.

Jenis kegiatan.

Status kehadiran.

Acceptance Criteria

Admin dapat melihat rekap yang dapat ditelusuri kembali ke catatan absensi dan keputusan verifikasi.

FR-07 — Penanganan Tidak Hadir
Alur

Sesi latihan ditutup.

Sistem mengidentifikasi anggota yang belum tercatat hadir.

Anggota ditandai sebagai kandidat tidak hadir.

Admin memeriksa pengajuan izin/sakit atau informasi relevan.

Status akhir ditetapkan.

Potongan dihitung sesuai aturan yang berlaku.

Acceptance Criteria

Kandidat tidak hadir tidak langsung menghasilkan potongan final.

Admin dapat menyetujui atau menolak pengajuan izin/sakit.

Data final dapat digunakan untuk perhitungan penalti.

FR-08 — Peraturan Kehadiran dan Penalti

Sistem harus menyediakan aturan yang dapat dikonfigurasi untuk mendukung peraturan padus.

Aturan yang bersumber dari PDF

Kode

	

Ketentuan

	

Implementasi




RULE-01

	

Full Choir Fee Rp250.000 untuk absensi penuh dan tepat waktu dari awal latihan sampai pengukuhan wisuda

	

Evaluasi periode




RULE-02

	

Terlambat latihan Rp5.000 setiap kejadian

	

Penalti per kejadian




RULE-03

	

Tidak hadir latihan Rp10.000 setiap kejadian

	

Penalti per kejadian




RULE-04

	

Tidak hadir 3 kali → tidak bisa ikut serta lagi

	

Pembatasan kelayakan




RULE-05

	

Tidak hadir di -2 hari sebelum wisuda → tidak bisa ikut serta lagi

	

Aturan pra-wisuda




RULE-06

	

Tidak hadir gladi Rp25.000

	

Penalti acara




RULE-07

	

Tidak tepat waktu saat pengukuhan Rp25.000

	

Penalti acara




RULE-08

	

Tidak hadir pengukuhan → tidak mendapat fee

	

Evaluasi fee




RULE-09

	

Penambahan dana untuk anggota yang memenuhi empat syarat

	

Evaluasi kelayakan

Sumber: PDF yang diberikan. 
SYARAT PADUSS Fix.pdf

Acceptance Criteria

Setiap penalti memiliki anggota, aturan, sumber kejadian, nominal, dan status.

Sistem tidak menghitung potongan ganda untuk kejadian yang sama.

Admin dapat melakukan pemeriksaan dan koreksi sesuai kewenangan.

Fee akhir dapat ditelusuri ke dasar perhitungannya.

Ketentuan yang belum memiliki definisi operasional tidak diaktifkan sebagai keputusan otomatis tanpa konfigurasi.

Aturan yang perlu klarifikasi sebelum otomatisasi penuh

-2 hari sebelum wisuda: Apakah yang dimaksud dua hari kalender sebelum acara, atau dua hari sebelum berdasarkan jadwal kegiatan tertentu?

Penambahan dana: Nominal dan rumus penambahan dana belum dicantumkan dalam PDF.

Ketidakhadiran izin/sakit: Apakah tetap dikenakan potongan Rp10.000 dan dihitung sebagai satu dari tiga ketidakhadiran? Dokumen yang diberikan tidak menjelaskan pengecualian tersebut.

FR-09 — Acara Gladi dan Pengukuhan

Sistem menyediakan pencatatan kegiatan khusus:

Gladi.

Pengukuhan / acara wisuda.

Jadwal dan lokasi acara.

Kedatangan anggota.

Status hadir, terlambat, dan tidak hadir.

Catatan verifikasi panitia.

Acceptance Criteria

Admin dapat membuat acara khusus.

Setiap anggota dapat memiliki satu catatan kehadiran per acara.

Status pengukuhan dapat digunakan dalam evaluasi fee.

Sistem mendukung pencatatan kedatangan dan aturan keterlambatan sesuai konfigurasi acara.

FR-10 — Laporan Absensi
Jenis laporan

Laporan

	

Isi




Laporan per latihan

	

Daftar anggota dan status kehadiran




Rekap per anggota

	

Total kehadiran, keterlambatan, dan ketidakhadiran




Laporan penalti

	

Rincian potongan per anggota




Laporan fee

	

Kelayakan, fee dasar, penalti, dan hasil perhitungan




Laporan acara

	

Kehadiran gladi dan pengukuhan

Format keluaran

Tampilan tabel pada website.

Export Excel.

Export PDF.

FR-11 — Notifikasi

Sistem menyediakan notifikasi untuk:

Jadwal latihan baru.

Perubahan jadwal.

Pembatalan latihan.

Pengingat latihan.

Hasil absensi.

Informasi status pengajuan izin/sakit.

Informasi evaluasi fee.

Acceptance Criteria

Notifikasi dapat ditujukan kepada anggota yang relevan.

Pengguna dapat melihat status sudah dibaca atau belum.

Sistem tidak mengirim notifikasi duplikat untuk satu kejadian yang sama.

4. Persyaratan Nonfungsional

Kategori

	

Persyaratan




Responsif

	

Website dapat digunakan melalui HP dan laptop




Keamanan

	

Supabase Auth dan RLS digunakan untuk pembatasan akses




Privasi

	

Data lokasi hanya digunakan sesuai kebutuhan validasi dan aksesnya dibatasi




Integritas

	

Absensi ganda dicegah melalui constraint database




Akurasi

	

Waktu server digunakan sebagai dasar pencatatan




Kinerja

	

Validasi absensi dapat diselesaikan tanpa proses yang tidak diperlukan




Auditabilitas

	

Perubahan status absensi dan penalti penting dapat ditelusuri




Maintainability

	

Kode dipisahkan berdasarkan modul dan komponen




Skalabilitas

	

Database dirancang untuk jumlah anggota dan sesi latihan yang dapat bertambah

Catatan GPS: Sistem harus menangani lokasi tidak tersedia atau akurasi rendah dengan jelas. GPS tidak menjamin secara mutlak bahwa seseorang mengikuti latihan sepanjang kegiatan.

5. User Flow
5.1 Flow Anggota Melakukan Absensi
5.2 Flow Admin Menutup Sesi
6. Rancangan Data dan Supabase
6.1 Entitas Database

Struktur database menggunakan entitas berikut:

Tabel Utama

Profil & Anggota

profiles, members

Jadwal & Sesi

training_schedules, attendance_sessions

Absensi & Pengajuan

attendance, absence_requests

Acara Khusus

events, event_attendance

Aturan & Keuangan

rules, penalties, fee_evaluations

Pendukung

notifications, app_settings, attendance_audits, reports

6.2 Aturan Data Penting

Aturan

	

Implementasi




Satu anggota satu absensi per sesi

	

Unique constraint (session_id, member_id)




Radius default 100 meter

	

allowed_radius_meters pada jadwal




Toleransi fleksibel

	

late_tolerance_minutes pada jadwal




Audit perubahan

	

Tabel attendance_audits




Penetapan penalti

	

Tabel penalties dengan status




Evaluasi fee

	

Tabel fee_evaluations




Hak akses

	

Supabase Auth + RLS

Perhitungan fee

Secara konseptual:

Total Penalti =
Penalti Keterlambatan
+ Penalti Ketidakhadiran
+ Penalti Gladi
+ Penalti Pengukuhan

Fee akhir tidak boleh diasumsikan selalu sama dengan Rp250.000 dikurangi penalti, karena PDF juga menetapkan bahwa ketidakhadiran saat pengukuhan menyebabkan anggota tidak diberi fee sama sekali. 
SYARAT PADUSS Fix.pdf

Karena itu, perhitungan harus menggunakan status kelayakan dan aturan khusus, bukan hanya pengurangan aritmetika sederhana.

7. Rancangan Halaman / Sitemap
Admin
/admin
├── Dashboard
├── Jadwal Latihan
│   ├── Daftar Jadwal
│   ├── Tambah Jadwal
│   └── Detail Jadwal
├── Sesi Absensi
│   ├── Buka Sesi
│   ├── QR Code
│   └── Tutup Sesi
├── Anggota
├── Rekap Kehadiran
├── Pengajuan Izin/Sakit
├── Peraturan & Penalti
├── Acara Gladi & Wisuda
├── Evaluasi Fee
├── Laporan
└── Notifikasi
Anggota
/member
├── Dashboard
├── Jadwal Latihan
├── Scan Absensi
├── Riwayat Absensi
├── Pengajuan Izin/Sakit
├── Statistik Kehadiran
├── Status Kelayakan Fee
└── Notifikasi
8. Teknologi yang Digunakan

Teknologi

	

Fungsi




React

	

Antarmuka pengguna




Vite

	

Build tool dan development




Tailwind CSS

	

Styling responsif




React Router

	

Routing halaman




Supabase Auth

	

Autentikasi




Supabase PostgreSQL

	

Database




Supabase RLS

	

Pembatasan akses data




Supabase Edge Functions / server-side logic

	

Validasi dan operasi sensitif




QR Code library

	

Generate dan scan QR




Geolocation API

	

Mengambil lokasi perangkat




Excel/PDF library

	

Export laporan

Arsitektur
9. Prioritas Pengembangan (MVP)

Untuk menjaga proyek tetap terarah, fitur dibagi berdasarkan prioritas.

P0 — Wajib
Prioritas tinggi

Login dan role pengguna.

Manajemen anggota.

Jadwal latihan fleksibel.

QR Code untuk absensi.

Validasi GPS radius 100 meter.

Validasi keterlambatan.

Pencegahan absensi ganda.

Rekap kehadiran dasar.

P1 — Penting
Prioritas menengah

Pengajuan izin dan sakit.

Verifikasi ketidakhadiran.

Perhitungan potongan.

Laporan Excel dan PDF.

Notifikasi jadwal dan absensi.

Acara gladi dan pengukuhan.

P2 — Pengembangan Lanjutan
Tahap berikutnya

Evaluasi fee terintegrasi.

Audit perubahan lebih lengkap.

Dashboard statistik lanjutan.

Pengaturan peraturan yang lebih fleksibel.

Penyempurnaan sistem notifikasi.

10. Rencana Pengujian (Acceptance Testing)

ID

	

Skenario

	

Hasil yang Diharapkan




TC-01

	

Anggota scan QR di dalam radius

	

Absensi diproses




TC-02

	

Anggota scan QR di luar radius

	

Absensi ditolak




TC-03

	

Anggota scan QR dua kali

	

Absensi duplikat ditolak




TC-04

	

Anggota datang melewati toleransi

	

Status terlambat




TC-05

	

QR Code tidak valid

	

Absensi ditolak




TC-06

	

GPS tidak tersedia

	

Validasi gagal dengan pesan yang jelas




TC-07

	

Admin menutup sesi

	

Kandidat tidak hadir diidentifikasi




TC-08

	

Anggota mengajukan izin

	

Pengajuan menunggu verifikasi




TC-09

	

Admin mengonfirmasi penalti

	

Riwayat penalti tersimpan




TC-10

	

Anggota tidak hadir pengukuhan

	

Evaluasi fee mengikuti aturan yang ditetapkan




TC-11

	

Admin mengubah jadwal

	

Perubahan tersimpan dan dapat dilihat pengguna




TC-12

	

Pengguna tanpa izin membuka data admin

	

Akses ditolak

Pengujian keuangan: Setiap rumus penalti dan fee harus diuji dengan kasus nyata yang sudah disepakati pengurus. Terutama aturan tiga kali tidak hadir dan ketentuan tidak diberi fee saat pengukuhan.

11. Risiko dan Mitigasi

Risiko

	

Mitigasi




GPS tidak akurat di dalam gedung

	

Simpan akurasi GPS dan tampilkan pesan yang jelas ketika lokasi tidak memadai




QR Code dibagikan kepada anggota lain

	

Gunakan token sesi, validasi login, dan validasi lokasi




Anggota scan lalu meninggalkan latihan

	

Jelaskan bahwa absensi masuk tidak membuktikan kehadiran sepanjang latihan; verifikasi tambahan dapat dipertimbangkan




Potongan dihitung ganda

	

Gunakan sumber kejadian dan mekanisme idempotensi




Aturan organisasi berubah

	

Gunakan tabel aturan dan konfigurasi




Data lokasi sensitif

	

Batasi akses, jelaskan penggunaan, dan minimalkan penyimpanan




Kesalahan perhitungan fee

	

Sediakan audit, verifikasi admin, dan status evaluasi sebelum finalisasi

12. Definisi Selesai (Definition of Done)

Produk MVP dianggap siap untuk pengujian pengguna apabila:

Login admin dan anggota berfungsi.
Admin dapat mengelola anggota.
Admin dapat membuat dan mengubah jadwal.
Sesi QR Code dapat dibuka dan ditutup.
GPS memvalidasi radius 100 meter.
Absensi ganda dicegah.
Toleransi keterlambatan dapat diatur.
Rekap kehadiran dapat ditampilkan.
Kandidat ketidakhadiran dapat diverifikasi.
Potongan memiliki catatan sumber dan nominal.
Sistem memiliki pembatasan akses yang sesuai.
Pengujian skenario utama berhasil.
13. Kesimpulan PRD

Sistem yang dirancang adalah aplikasi web manajemen absensi padus kampus dengan fokus pada validasi kehadiran berbasis QR Code dan GPS, pengelolaan jadwal latihan fleksibel, serta penerapan peraturan kehadiran dan fee.

Fokus pengembangan awal adalah memastikan absensi valid, data anggota dan jadwal terkelola, serta rekap kehadiran dapat dipercaya. Setelah fondasi tersebut berjalan, fitur peraturan penalti, acara wisuda, laporan, dan evaluasi fee dapat dikembangkan secara bertahap.

Dokumen ini dapat digunakan sebagai dasar untuk melanjutkan ke:

Langkah Pengembangan Berikutnya

1. ERD Final

Memeriksa relasi, primary key, foreign key, dan kebutuhan setiap tabel.

2. SQL Supabase Final

Migration, RLS, dan fungsi validasi yang siap diuji.

3. UI/UX Design

Dashboard admin, dashboard anggota, QR scanner, dan halaman rekap.

4. Implementasi React + Vite

Pembangunan aplikasi berdasarkan PRD dan database yang telah disepakati.