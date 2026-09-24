do $$
declare
  nama_tabel text;
begin
  foreach nama_tabel in array array['profiles', 'jadwal', 'sesi', 'absensi', 'pengajuan', 'notifikasi']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = nama_tabel
    ) then
      execute format('alter publication supabase_realtime add table public.%I', nama_tabel);
    end if;
  end loop;
end $$;
