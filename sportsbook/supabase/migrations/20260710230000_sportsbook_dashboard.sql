-- Core authenticated-dashboard tables. Run with `supabase db push`, or paste
-- this migration into the Supabase SQL editor for the connected project.

create table if not exists public.sportsbook_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(14, 2) not null default 0 check (balance >= 0),
  bonus_balance numeric(14, 2) not null default 0 check (bonus_balance >= 0),
  locked_bonus numeric(14, 2) not null default 0 check (locked_bonus >= 0),
  total_winnings numeric(14, 2) not null default 0 check (total_winnings >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.sportsbook_bets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stake numeric(14, 2) not null check (stake > 0),
  total_odds numeric(12, 3) not null check (total_odds > 0),
  potential_return numeric(14, 2) not null check (potential_return >= 0),
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'void', 'cashed_out')),
  selections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sportsbook_bets_user_created_at_idx on public.sportsbook_bets (user_id, created_at desc);

create table if not exists public.sportsbook_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

create index if not exists sportsbook_notifications_user_created_at_idx on public.sportsbook_notifications (user_id, created_at desc);

alter table public.sportsbook_wallets enable row level security;
alter table public.sportsbook_bets enable row level security;
alter table public.sportsbook_notifications enable row level security;

drop policy if exists "wallet owner can read" on public.sportsbook_wallets;
drop policy if exists "bet owner can read" on public.sportsbook_bets;
drop policy if exists "bet owner can create" on public.sportsbook_bets;
drop policy if exists "notification owner can read" on public.sportsbook_notifications;
create policy "wallet owner can read" on public.sportsbook_wallets for select using (auth.uid() = user_id);
create policy "bet owner can read" on public.sportsbook_bets for select using (auth.uid() = user_id);
create policy "bet owner can create" on public.sportsbook_bets for insert with check (auth.uid() = user_id);
create policy "notification owner can read" on public.sportsbook_notifications for select using (auth.uid() = user_id);

create or replace function public.create_wallet_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.sportsbook_wallets (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_wallet on auth.users;
create trigger on_auth_user_created_wallet
  after insert on auth.users for each row execute procedure public.create_wallet_for_new_user();

-- Ensure users that already exist get a wallet as well.
insert into public.sportsbook_wallets (user_id)
select id from auth.users on conflict (user_id) do nothing;
