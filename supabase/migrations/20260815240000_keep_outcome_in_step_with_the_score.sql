-- Keep the outcome in step with the score, rather than refusing the write.
--
-- The constraint added alongside `outcome` rejects a score that disagrees with
-- it. That is the right guarantee and the wrong moment to enforce it: anything
-- writing a score without knowing the column exists — a client running older
-- code, an import, a hand-fixed row — would have its save rejected with a
-- constraint error it could not act on.
--
-- The score is the more specific statement, so it wins. Whenever a write
-- carries both halves of one, the outcome is set from it. The constraint stays
-- as a backstop and can no longer fire.

CREATE OR REPLACE FUNCTION public.sync_match_outcome()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF (NEW.team_a ->> 'score') IS NOT NULL
     AND (NEW.team_b ->> 'score') IS NOT NULL THEN
    NEW.outcome := CASE
      WHEN (NEW.team_a ->> 'score')::int > (NEW.team_b ->> 'score')::int THEN 'a'
      WHEN (NEW.team_a ->> 'score')::int < (NEW.team_b ->> 'score')::int THEN 'b'
      ELSE 'draw'
    END;
  END IF;

  -- A match that has not been played holds no result, whatever it carries.
  IF NEW.status <> 'completed' THEN
    NEW.outcome := NULL;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_match_outcome() IS
  'Derives outcome from the score whenever both are written, so the two cannot disagree.';

DROP TRIGGER IF EXISTS sync_match_outcome ON public.matches;

CREATE TRIGGER sync_match_outcome
  BEFORE INSERT OR UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_match_outcome();
