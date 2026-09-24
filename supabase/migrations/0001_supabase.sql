create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid unique references auth.users(id) on delete set null,
  nama text not null,
  nim text not null unique,
  suara text not null check (suara in ('Sopran', 'Alto', 'Tenor', 'Bas')),
  role text not null default 'anggota' check (role in ('admin', 'anggota')),
  angkatan integer not null default 2026,
  hadir integer not null default 0,
  lambat integer not null default 0,
  izin integer not null default 0,
  sakit integer not null default 0,
  alpa integer not null default 0,
  potongan integer not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.jadwal (
  id text primary key default gen_random_uuid()::text,
  nama text not null,
  tanggal text not null,
  jam text not null,
  lokasi text not null,
  toleransi integer not null default 10,
  status text not null default 'Terjadwal',
  created_at timestamptz not null default now()
);

create table if not exists public.sesi (
  id text primary key default gen_random_uuid()::text,
  nama text not null,
  tanggal text not null,
  jam text not null,
  lokasi text not null,
  mulai_menit integer not null,
  batas_menit integer not null,
  batas_tepat text not null,
  toleransi integer not null default 0,
  radius integer not null default 100,
  token text not null unique,
  dibuka_pada text not null,
  status text not null default 'terbuka' check (status in ('terbuka', 'jeda', 'ditutup')),
  created_at timestamptz not null default now()
);

create table if not exists public.absensi (
  id text primary key default gen_random_uuid()::text,
  member_id text not null references public.profiles(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  nama text not null,
  token text not null,
  jam text not null,
  jarak integer not null,
  akurasi integer not null,
  status text not null check (status in ('tepat', 'lambat')),
  created_at timestamptz not null default now(),
  unique (member_id, token)
);

create table if not exists public.pengajuan (
  id text primary key default gen_random_uuid()::text,
  member_id text not null references public.profiles(id) on delete restrict,
  nama text not null,
  suara text not null,
  jenis text not null,
  tanggal text not null,
  alasan text not null,
  status text not null default 'Menunggu' check (status in ('Menunggu', 'Disetujui', 'Ditolak')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifikasi (
  id text primary key default gen_random_uuid()::text,
  judul text not null,
  isi text not null,
  waktu text not null,
  belum_dibaca boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin' and aktif = true
  );
$$;

create or replace function public.profile_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() and aktif = true limit 1;
$$;

alter table public.profiles enable row level security;
alter table public.jadwal enable row level security;
alter table public.sesi enable row level security;
alter table public.absensi enable row level security;
alter table public.pengajuan enable row level security;
alter table public.notifikasi enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (true);
drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles for insert to authenticated with check (public.is_admin());
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles for delete to authenticated using (public.is_admin());

drop policy if exists jadwal_select on public.jadwal;
create policy jadwal_select on public.jadwal for select to authenticated using (true);
drop policy if exists jadwal_admin_insert on public.jadwal;
create policy jadwal_admin_insert on public.jadwal for insert to authenticated with check (public.is_admin());
drop policy if exists jadwal_admin_update on public.jadwal;
create policy jadwal_admin_update on public.jadwal for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists jadwal_admin_delete on public.jadwal;
create policy jadwal_admin_delete on public.jadwal for delete to authenticated using (public.is_admin());

drop policy if exists sesi_select on public.sesi;
create policy sesi_select on public.sesi for select to authenticated using (true);
drop policy if exists sesi_admin_insert on public.sesi;
create policy sesi_admin_insert on public.sesi for insert to authenticated with check (public.is_admin());
drop policy if exists sesi_admin_update on public.sesi;
create policy sesi_admin_update on public.sesi for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists sesi_admin_delete on public.sesi;
create policy sesi_admin_delete on public.sesi for delete to authenticated using (public.is_admin());

drop policy if exists absensi_select on public.absensi;
create policy absensi_select on public.absensi for select to authenticated using (public.is_admin() or member_id = public.profile_id());
drop policy if exists absensi_member_insert on public.absensi;
create policy absensi_member_insert on public.absensi for insert to authenticated with check (public.is_admin() or member_id = public.profile_id());
drop policy if exists absensi_admin_update on public.absensi;
create policy absensi_admin_update on public.absensi for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists pengajuan_select on public.pengajuan;
create policy pengajuan_select on public.pengajuan for select to authenticated using (public.is_admin() or member_id = public.profile_id());
drop policy if exists pengajuan_member_insert on public.pengajuan;
create policy pengajuan_member_insert on public.pengajuan for insert to authenticated with check (public.is_admin() or member_id = public.profile_id());
drop policy if exists pengajuan_admin_update on public.pengajuan;
create policy pengajuan_admin_update on public.pengajuan for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists notifikasi_select on public.notifikasi;
create policy notifikasi_select on public.notifikasi for select to authenticated using (true);
drop policy if exists notifikasi_insert on public.notifikasi;
create policy notifikasi_insert on public.notifikasi for insert to authenticated with check (true);
drop policy if exists notifikasi_update on public.notifikasi;
create policy notifikasi_update on public.notifikasi for update to authenticated using (true) with check (true);

insert into public.profiles (id, nama, nim, suara, angkatan)
values
  ('A01', 'Maria Lestari', '202201011', 'Sopran', 2022),
  ('A02', 'Yohana Priska', '202301042', 'Sopran', 2023),
  ('A03', 'Clara Nathania', '202401008', 'Sopran', 2024),
  ('A04', 'Debora Sinta', '202201097', 'Sopran', 2022),
  ('A05', 'Ruth Angelina', '202301077', 'Alto', 2023),
  ('A06', 'Marta Wijaya', '202201055', 'Alto', 2022),
  ('A07', 'Kesya Putri', '202401033', 'Alto', 2024),
  ('A08', 'Lydia Monika', '202301019', 'Alto', 2023),
  ('A09', 'Yosua Damara', '202201063', 'Tenor', 2022),
  ('A10', 'Rafael Junio', '202301088', 'Tenor', 2023),
  ('A11', 'Gilang Pratama', '202401021', 'Tenor', 2024),
  ('A12', 'Samuel Tandi', '202201034', 'Tenor', 2022),
  ('A13', 'Petrus Allo', '202301051', 'Bas', 2023),
  ('A14', 'Daniel Somba', '202201080', 'Bas', 2022),
  ('A15', 'Abraham Kala', '202401012', 'Bas', 2024),
  ('A16', 'Yeremia Rante', '202301066', 'Bas', 2023)
on conflict (id) do nothing;
