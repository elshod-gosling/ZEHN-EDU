begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.levelup_settings (
  id boolean primary key default true check (id), developer_email text not null
);
insert into private.levelup_settings values (true, 'elshodcs2@gmail.com') on conflict do nothing;
create table if not exists private.levelup_questions (
  id text primary key, idx integer not null unique, question jsonb not null, answer text not null
);
create table if not exists public.levelup_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','developer')),
  credits integer not null default 0 check (credits >= 0),
  earned integer not null default 0 check (earned >= 0),
  cursor integer not null default 0 check (cursor >= 0),
  phase text not null default 'idle' check (phase in ('idle','learning')),
  "questionId" text not null default '', answer text not null default '',
  "startedAt" timestamptz not null default now(), "lastEarnAt" timestamptz not null default now(),
  "passUntil" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
alter table public.levelup_accounts enable row level security;
drop policy if exists own_wallet on public.levelup_accounts;
create policy own_wallet on public.levelup_accounts for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.levelup_accounts from public, anon, authenticated;
grant select on public.levelup_accounts to authenticated;
revoke all on private.levelup_settings, private.levelup_questions from public, anon, authenticated;

-- These functions alone can create wallets and change credits. The caller's
-- identity, correct answer, elapsed time, and expiry are checked in the database.
create or replace function public.levelup_get_wallet() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); wallet public.levelup_accounts; permitted boolean;
begin
  if uid is null then raise exception 'sign-in-required'; end if;
  insert into public.levelup_accounts(user_id) values(uid) on conflict do nothing;
  select exists(select 1 from auth.users u join private.levelup_settings s on lower(u.email) = lower(s.developer_email)
    where u.id = uid and u.email_confirmed_at is not null) into permitted;
  update public.levelup_accounts set role = case when permitted then 'developer' else 'student' end
    where user_id = uid and role <> case when permitted then 'developer' else 'student' end;
  select * into strict wallet from public.levelup_accounts where user_id = uid;
  return (to_jsonb(wallet) - 'user_id') || jsonb_build_object('serverNow',clock_timestamp());
end $$;

create or replace function public.levelup_start_round(subject text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare wallet public.levelup_accounts; chosen text; slot integer; lesson jsonb;
begin
  perform public.levelup_get_wallet();
  select * into strict wallet from public.levelup_accounts where user_id = auth.uid() for update;
  slot := case subject when 'coding' then 0 when 'office' then 1 when 'math' then 2 when 'typing' then 3 else wallet.cursor % 4 end;
  chosen := 'q' || ((wallet.cursor % 8) * 4 + slot)::text;
  select question into lesson from private.levelup_questions where id = chosen;
  if lesson is null then raise exception 'question-unavailable'; end if;
  update public.levelup_accounts set phase='learning', "questionId"=chosen, answer='', "startedAt"=clock_timestamp(), "updatedAt"=clock_timestamp() where user_id=auth.uid();
  return lesson || jsonb_build_object('id',chosen,'cursor',wallet.cursor);
end $$;

create or replace function public.levelup_finish_round(round_id text, round_cursor integer, submitted_answer text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare wallet public.levelup_accounts; expected text; server_time timestamptz := clock_timestamp();
begin
  perform public.levelup_get_wallet();
  select * into strict wallet from public.levelup_accounts where user_id = auth.uid() for update;
  if wallet.phase <> 'learning' or wallet.cursor <> round_cursor or wallet."questionId" <> round_id then raise exception 'round-changed'; end if;
  if server_time < wallet."startedAt" + interval '60 seconds' or server_time < wallet."lastEarnAt" + interval '60 seconds' then raise exception 'round-too-early'; end if;
  select answer into expected from private.levelup_questions where id = round_id;
  if expected is null or submitted_answer is null or length(submitted_answer) > 100 or submitted_answer <> expected then raise exception 'wrong-answer'; end if;
  update public.levelup_accounts set phase='idle', answer=submitted_answer, credits=credits+10, earned=earned+10, cursor=cursor+1,
    "lastEarnAt"=server_time, "updatedAt"=server_time where user_id=auth.uid();
  return public.levelup_get_wallet();
end $$;

create or replace function public.levelup_redeem_pass() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare wallet public.levelup_accounts; server_time timestamptz := clock_timestamp();
begin
  perform public.levelup_get_wallet();
  select * into strict wallet from public.levelup_accounts where user_id=auth.uid() for update;
  if wallet.role='developer' or wallet."passUntil" > server_time then return public.levelup_get_wallet(); end if;
  if wallet.credits < 100 then raise exception 'not-enough-credits'; end if;
  update public.levelup_accounts set credits=credits-100, "passUntil"=server_time+interval '5 minutes', "updatedAt"=server_time where user_id=auth.uid();
  return public.levelup_get_wallet();
end $$;

revoke all on function public.levelup_get_wallet(), public.levelup_start_round(text), public.levelup_finish_round(text,integer,text), public.levelup_redeem_pass() from public, anon;
grant execute on function public.levelup_get_wallet(), public.levelup_start_round(text), public.levelup_finish_round(text,integer,text), public.levelup_redeem_pass() to authenticated;
commit;
