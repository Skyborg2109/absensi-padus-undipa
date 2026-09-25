drop policy if exists rekap_koreksi_select on public.rekap_koreksi;
create policy rekap_koreksi_select on public.rekap_koreksi for select to authenticated using (public.is_admin() or member_id = public.profile_id());

drop policy if exists absensi_member_delete on public.absensi;
create policy absensi_member_delete on public.absensi for delete to authenticated using (member_id = public.profile_id());
