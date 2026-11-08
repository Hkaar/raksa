-- Run once in the SQL editor after checking that public.officers does not exist.
begin;
create table public.officers (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null check (char_length(btrim(full_name)) between 1 and 150),
    organization text,
    phone text,
    created_at timestamptz not null default now()
);
alter table public.officers enable row level security;
revoke all on public.officers from anon, authenticated;
grant select on public.officers to authenticated;
grant select, insert, update, delete on public.officers to service_role;
create policy "officers_read_own_profile" on public.officers
    for select to authenticated using ((select auth.uid()) = id);
commit;
