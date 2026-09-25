create table if not exists public.rekap_koreksi (
  member_id text primary key references public.profiles(id) on delete cascade,
  hadir integer not null default 0 check (hadir >= 0),
  terlambat integer not null default 0 check (terlambat >= 0),
  izin integer not null default 0 check (izin >= 0),
  sakit integer not null default 0 check (sakit >= 0),
  alpa integer not null default 0 check (alpa >= 0),
  potongan integer not null default 0 check (potongan >= 0),
  catatan text not null default '',
  created_at timestamptz not null default now()
);

alter table public.rekap_koreksi enable row level security;

drop policy if exists rekap_koreksi_select on public.rekap_koreksi;
create policy rekap_koreksi_select on public.rekap_koreksi for select to authenticated using (public.is_admin());

drop policy if exists rekap_koreksi_admin_insert on public.rekap_koreksi;
create policy rekap_koreksi_admin_insert on public.rekap_koreksi for insert to authenticated with check (public.is_admin());

drop policy if exists rekap_koreksi_admin_update on public.rekap_koreksi;
create policy rekap_koreksi_admin_update on public.rekap_koreksi for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists rekap_koreksi_admin_delete on public.rekap_koreksi;
create policy rekap_koreksi_admin_delete on public.rekap_koreksi for delete to authenticated using (public.is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rekap_koreksi'
  ) then
    alter publication supabase_realtime add table public.rekap_koreksi;
  end if;
end $$;
