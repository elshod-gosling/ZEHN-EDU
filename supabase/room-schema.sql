begin;
-- Ephemeral connection details are never exposed as a browsable table.
create table private.levelup_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[0-9A-F]{8}$'),
  host_id uuid not null unique references auth.users(id) on delete cascade,
  guest_id uuid references auth.users(id) on delete cascade,
  offer text not null check (length(offer) between 1 and 64000),
  answer text check (length(answer) between 1 and 64000),
  expires_at timestamptz not null default (clock_timestamp() + interval '10 minutes'),
  check (guest_id is null or guest_id <> host_id)
);
create index levelup_rooms_expiry on private.levelup_rooms(expires_at);
create index levelup_rooms_guest on private.levelup_rooms(guest_id);
alter table private.levelup_rooms enable row level security;
revoke all on private.levelup_rooms from public, anon, authenticated;

create function private.levelup_require_pass() returns void
language plpgsql security definer set search_path='' as $$
declare wallet jsonb;
begin
  wallet := public.levelup_get_wallet();
  if wallet->>'role' <> 'developer' and (wallet->>'passUntil')::timestamptz <= clock_timestamp() then
    raise exception 'pass-required';
  end if;
end $$;
revoke all on function private.levelup_require_pass() from public, anon, authenticated;

create function public.levelup_create_room(connection_offer text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare room private.levelup_rooms;
begin
  perform private.levelup_require_pass();
  if connection_offer is null or length(connection_offer) not between 1 and 64000 then raise exception 'invalid-signal'; end if;
  -- Serialize simultaneous create requests from the same account.
  perform 1 from public.levelup_accounts where user_id=auth.uid() for update;
  delete from private.levelup_rooms where expires_at <= clock_timestamp() or host_id=auth.uid();
  loop
    begin
      insert into private.levelup_rooms(code,host_id,offer)
      values(upper(substr(md5(gen_random_uuid()::text),1,8)),auth.uid(),connection_offer) returning * into room;
      exit;
    exception when unique_violation then null;
    end;
  end loop;
  return jsonb_build_object('id',room.id,'code',room.code);
end $$;

create function public.levelup_join_room(room_code text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare room private.levelup_rooms; normalized text := upper(regexp_replace(room_code,'[[:space:]-]','','g'));
begin
  perform private.levelup_require_pass();
  if normalized is null or normalized !~ '^[0-9A-F]{8}$' then raise exception 'room-not-found'; end if;
  select * into room from private.levelup_rooms where code=normalized for update;
  if not found or room.expires_at <= clock_timestamp() then raise exception 'room-not-found'; end if;
  if room.host_id=auth.uid() then raise exception 'own-room'; end if;
  if room.guest_id is not null and room.guest_id <> auth.uid() then raise exception 'room-full'; end if;
  update private.levelup_rooms set guest_id=auth.uid() where id=room.id;
  return jsonb_build_object('id',room.id,'offer',room.offer);
end $$;

create function public.levelup_answer_room(room_id uuid, connection_answer text) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform private.levelup_require_pass();
  if connection_answer is null or length(connection_answer) not between 1 and 64000 then raise exception 'invalid-signal'; end if;
  update private.levelup_rooms set answer=connection_answer where id=room_id and guest_id=auth.uid()
    and expires_at > clock_timestamp() and (answer is null or answer=connection_answer);
  if not found then raise exception 'room-unavailable'; end if;
end $$;

create function public.levelup_room_status(room_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare room private.levelup_rooms;
begin
  perform private.levelup_require_pass();
  select * into room from private.levelup_rooms where id=room_id and (host_id=auth.uid() or guest_id=auth.uid());
  if not found or room.expires_at <= clock_timestamp() then raise exception 'room-unavailable'; end if;
  return jsonb_build_object('answer',case when room.host_id=auth.uid() then room.answer else null end,'joined',room.guest_id is not null);
end $$;

create function public.levelup_close_room(room_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'sign-in-required'; end if;
  delete from private.levelup_rooms where id=room_id and (host_id=auth.uid() or guest_id=auth.uid());
end $$;
revoke all on function public.levelup_create_room(text),public.levelup_join_room(text),public.levelup_answer_room(uuid,text),public.levelup_room_status(uuid),public.levelup_close_room(uuid) from public,anon;
grant execute on function public.levelup_create_room(text),public.levelup_join_room(text),public.levelup_answer_room(uuid,text),public.levelup_room_status(uuid),public.levelup_close_room(uuid) to authenticated;
commit;
