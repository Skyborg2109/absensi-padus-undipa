alter table public.rekap_koreksi
  add column if not exists updated_at timestamptz not null default now();

update public.rekap_koreksi
set updated_at = created_at
where updated_at > created_at;
