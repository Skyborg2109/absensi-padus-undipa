-- Lengkapi kolom waktu sesi yang masih kosong.
-- Sesi lama tanpa mulai_menit/batas_menit membuat perbandingan "tepat/lambat"
-- gagal, sehingga anggota yang tepat waktu ikut kena potongan.

create or replace function public.menit_dari_jam(p_jam text)
returns integer
language plpgsql
immutable
as $$
declare
  bagian text[];
begin
  if p_jam is null or trim(p_jam) = '' then
    return null;
  end if;
  bagian := regexp_split_to_array(trim(split_part(p_jam, '–', 1)), '[:.]');
  if array_length(bagian, 1) is distinct from 2 then
    return null;
  end if;
  return bagian[1]::integer * 60 + bagian[2]::integer;
exception when others then
  return null;
end;
$$;

update public.sesi
   set mulai_menit = coalesce(mulai_menit, public.menit_dari_jam(jam), public.menit_dari_jam(dibuka_pada))
 where mulai_menit is null;

update public.sesi
   set toleransi = 0
 where toleransi is null;

update public.sesi
   set batas_menit = coalesce(batas_menit, mulai_menit + toleransi)
 where batas_menit is null;

update public.sesi
   set batas_tepat = coalesce(
         batas_tepat,
         lpad((batas_menit / 60)::text, 2, '0') || '.' || lpad((batas_menit % 60)::text, 2, '0')
       )
 where batas_tepat is null and batas_menit is not null;

alter table public.sesi
  alter column toleransi set default 0;
