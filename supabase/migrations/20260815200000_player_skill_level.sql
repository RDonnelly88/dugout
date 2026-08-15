-- A hand-set rating, one to five, for balancing sides.
--
-- Elo and recent form are both derived from results, which means they say
-- nothing about somebody who has played twice and are slow to notice that the
-- lad who was hopeless in March has got good. This is the one number a human
-- gets to set, so it needs no games behind it and never moves on its own.
--
-- Three is the middle of the scale and the default, so an untouched squad
-- balances to an even split on numbers alone.

alter table public.players
  add column if not exists skill_level smallint not null default 3;

alter table public.players
  drop constraint if exists players_skill_level_range;

alter table public.players
  add constraint players_skill_level_range
  check (skill_level between 1 and 5);

comment on column public.players.skill_level is
  'Hand-set ability, 1 (weakest) to 5 (strongest). Defaults to 3. Never derived from results.';
