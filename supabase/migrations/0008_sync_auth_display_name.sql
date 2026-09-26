-- Sinkronkan nama anggota ke metadata Auth supaya kolom "Display name" terisi.

create or replace function public.sinkron_nama_ke_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;
  update auth.users
     set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
       || jsonb_build_object('nama', new.nama, 'display_name', new.nama)
   where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists trg_sinkron_nama_ke_auth on public.profiles;
create trigger trg_sinkron_nama_ke_auth
after insert or update of nama, user_id on public.profiles
for each row
execute function public.sinkron_nama_ke_auth();

-- Isi ulang untuk akun yang sudah ada sebelum trigger dipasang.
update auth.users u
   set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
       || jsonb_build_object('nama', p.nama, 'display_name', p.nama)
  from public.profiles p
 where p.user_id = u.id
   and coalesce(u.raw_user_meta_data ->> 'display_name', '') is distinct from p.nama;
