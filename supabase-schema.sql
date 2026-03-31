create table if not exists public.review_pool (
  id bigserial primary key,
  sequence_no integer not null unique,
  review_text text not null unique,
  keywords jsonb not null default '[]'::jsonb,
  claimed_at timestamptz,
  claimed_by text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.review_pool enable row level security;

revoke all on public.review_pool from anon, authenticated;

create or replace function public.claim_next_review(p_device_id text default null)
returns table (
  id bigint,
  sequence_no integer,
  review_text text,
  keywords jsonb,
  claimed_at timestamptz,
  remaining_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_review public.review_pool%rowtype;
begin
  with next_review as (
    select rp.id
    from public.review_pool rp
    where rp.claimed_at is null
    order by rp.sequence_no asc
    limit 1
    for update skip locked
  )
  update public.review_pool rp
  set
    claimed_at = timezone('utc', now()),
    claimed_by = coalesce(p_device_id, 'unknown-device')
  from next_review
  where rp.id = next_review.id
  returning rp.* into claimed_review;

  if claimed_review.id is null then
    return;
  end if;

  return query
  select
    claimed_review.id,
    claimed_review.sequence_no,
    claimed_review.review_text,
    claimed_review.keywords,
    claimed_review.claimed_at,
    (
      select count(*)
      from public.review_pool remaining
      where remaining.claimed_at is null
    )::bigint as remaining_count;
end;
$$;

grant execute on function public.claim_next_review(text) to anon, authenticated;

create or replace function public.reset_review_pool()
returns void
language sql
security definer
set search_path = public
as $$
  update public.review_pool
  set claimed_at = null,
      claimed_by = null;
$$;
