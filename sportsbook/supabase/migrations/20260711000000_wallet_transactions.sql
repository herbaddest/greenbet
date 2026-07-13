-- ============================================================
-- WALLET TRANSACTIONS & ATOMIC OPERATIONS
-- Adds a transaction ledger and RPC functions for atomic
-- deposit / withdrawal / bet-placement operations.
-- Run with `supabase db push` or paste into the SQL editor.
-- ============================================================

-- ---------- Transaction ledger ----------

create table if not exists public.sportsbook_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('deposit','withdrawal','bet_placed','bet_won','bet_refund','bonus_credit','bonus_expired')),
  amount numeric(14, 2) not null check (amount > 0),
  balance_before numeric(14, 2) not null,
  balance_after numeric(14, 2) not null,
  status text not null default 'completed' check (status in ('pending','completed','failed','cancelled')),
  reference text not null default '',
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sportsbook_transactions_user_created_at_idx
  on public.sportsbook_transactions (user_id, created_at desc);

alter table public.sportsbook_transactions enable row level security;

drop policy if exists "transaction owner can read" on public.sportsbook_transactions;
create policy "transaction owner can read"
  on public.sportsbook_transactions for select
  using (auth.uid() = user_id);

-- ---------- Atomic deposit RPC ----------

create or replace function public.deposit_funds(
  p_user_id uuid,
  p_amount numeric(14,2),
  p_reference text default '',
  p_description text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance_before numeric(14,2);
  v_balance_after numeric(14,2);
  v_tx_id uuid;
begin
  -- Validate amount
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive');
  end if;

  -- Lock the wallet row and read current balance
  select balance into v_balance_before
  from public.sportsbook_wallets
  where user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  v_balance_after := v_balance_before + p_amount;

  -- Update wallet
  update public.sportsbook_wallets
  set balance = v_balance_after,
      total_winnings = total_winnings + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  -- Record transaction
  insert into public.sportsbook_transactions
    (user_id, type, amount, balance_before, balance_after, status, reference, description)
  values
    (p_user_id, 'deposit', p_amount, v_balance_before, v_balance_after, 'completed', p_reference, p_description)
  returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after
  );
end;
$$;

-- ---------- Atomic withdrawal RPC ----------

create or replace function public.withdraw_funds(
  p_user_id uuid,
  p_amount numeric(14,2),
  p_reference text default '',
  p_description text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance_before numeric(14,2);
  v_balance_after numeric(14,2);
  v_tx_id uuid;
begin
  -- Validate amount
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive');
  end if;

  -- Lock the wallet row and read current balance
  select balance into v_balance_before
  from public.sportsbook_wallets
  where user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  -- Check sufficient balance
  if v_balance_before < p_amount then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance');
  end if;

  v_balance_after := v_balance_before - p_amount;

  -- Update wallet
  update public.sportsbook_wallets
  set balance = v_balance_after,
      updated_at = now()
  where user_id = p_user_id;

  -- Record transaction
  insert into public.sportsbook_transactions
    (user_id, type, amount, balance_before, balance_after, status, reference, description)
  values
    (p_user_id, 'withdrawal', p_amount, v_balance_before, v_balance_after, 'completed', p_reference, p_description)
  returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after
  );
end;
$$;

-- ---------- Atomic bet placement RPC ----------

create or replace function public.place_bet(
  p_bet_id text,
  p_user_id uuid,
  p_stake numeric(14,2),
  p_total_odds numeric(12,3),
  p_potential_return numeric(14,2),
  p_selections jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance_before numeric(14,2);
  v_balance_after numeric(14,2);
  v_tx_id uuid;
begin
  -- Validate inputs
  if p_stake <= 0 then
    return jsonb_build_object('success', false, 'error', 'Stake must be positive');
  end if;

  if p_total_odds <= 0 then
    return jsonb_build_object('success', false, 'error', 'Odds must be positive');
  end if;

  -- Prevent duplicate bet IDs
  if exists (select 1 from public.sportsbook_bets where id = p_bet_id) then
    return jsonb_build_object('success', false, 'error', 'Bet already exists (duplicate submission)');
  end if;

  -- Lock the wallet row and read current balance
  select balance into v_balance_before
  from public.sportsbook_wallets
  where user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  -- Check sufficient balance
  if v_balance_before < p_stake then
    return jsonb_build_object('success', false, 'error', 'Insufficient balance');
  end if;

  v_balance_after := v_balance_before - p_stake;

  -- Update wallet (deduct stake)
  update public.sportsbook_wallets
  set balance = v_balance_after,
      updated_at = now()
  where user_id = p_user_id;

  -- Insert bet
  insert into public.sportsbook_bets
    (id, user_id, stake, total_odds, potential_return, status, selections)
  values
    (p_bet_id, p_user_id, p_stake, p_total_odds, p_potential_return, 'open', p_selections);

  -- Record transaction
  insert into public.sportsbook_transactions
    (user_id, type, amount, balance_before, balance_after, status, reference, description)
  values
    (p_user_id, 'bet_placed', p_stake, v_balance_before, v_balance_after, 'completed', p_bet_id, 'Bet placement')
  returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'bet_id', p_bet_id,
    'transaction_id', v_tx_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after
  );
end;
$$;