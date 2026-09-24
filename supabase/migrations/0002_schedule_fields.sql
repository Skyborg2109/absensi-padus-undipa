alter table public.jadwal add column if not exists mulai text;
alter table public.jadwal add column if not exists selesai text;

update public.jadwal
set mulai = split_part(jam, '–', 1),
    selesai = split_part(jam, '–', 2)
where mulai is null or selesai is null;
