-- Acara wisuda: gladi dan pengukuhan dicatat terpisah dari jadwal latihan.
-- Satu baris per jenis acara, hanya admin yang boleh menulis.

create table if not exists public.acara (
  jenis text primary key check (jenis in ('gladi', 'pengukuhan')),
  nama text not null default '',
  tanggal text not null default '',
  jam text not null default '',
  lokasi text not null default '',
  toleransi integer not null default 0,
  catatan text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.acara enable row level security;

drop policy if exists acara_select on public.acara;
create policy acara_select on public.acara for select to authenticated using (true);

drop policy if exists acara_admin_insert on public.acara;
create policy acara_admin_insert on public.acara for insert to authenticated with check (public.is_admin());

drop policy if exists acara_admin_update on public.acara;
create policy acara_admin_update on public.acara for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists acara_admin_delete on public.acara;
create policy acara_admin_delete on public.acara for delete to authenticated using (public.is_admin());

insert into public.acara (jenis, nama, tanggal, jam, lokasi, toleransi, catatan)
values
  ('gladi', 'Gladi kotor', '2026-09-26', '09.00', 'Gedung serbaguna', 5, 'Tidak hadir berarti potongan Rp25.000.'),
  ('pengukuhan', 'Pengukuhan', '2026-09-27', '08.00', '', 0, 'Tidak tepat waktu berarti potongan Rp25.000. Tidak hadir berarti tanpa fee — tanpa pengecualian.')
on conflict (jenis) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'acara'
  ) then
    alter publication supabase_realtime add table public.acara;
  end if;
end $$;
