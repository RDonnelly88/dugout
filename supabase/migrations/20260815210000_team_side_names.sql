-- What a team calls its two sides.
--
-- Every five-a-side has its own word for it, and the app used three: the
-- randomiser dealt into Bibs and Skins, a saved match stored "Team A" and
-- "Team B", and the match page fell back to "Team A" when the stored name was
-- missing. So the sides you picked were not the sides you were shown.
--
-- Held on the team rather than in the code because it is the sort of thing one
-- group is certain to disagree with. Defaults match what the randomiser
-- already said, so nobody has to set anything.

alter table public.teams
  add column if not exists side_a_name text not null default 'Bibs',
  add column if not exists side_b_name text not null default 'No bibs';

alter table public.teams
  drop constraint if exists teams_side_names_present;

-- A blank name would render an unlabelled column on the match page.
alter table public.teams
  add constraint teams_side_names_present
  check (
    length(btrim(side_a_name)) between 1 and 30
    and length(btrim(side_b_name)) between 1 and 30
  );

comment on column public.teams.side_a_name is
  'What this team calls the first side. Team A everywhere in the schema.';
comment on column public.teams.side_b_name is
  'What this team calls the second side.';
