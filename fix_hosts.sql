-- One-off backfill for legacy `events.hosts` rows stored as a single host
-- object (pre-migration shape) instead of an array. Idempotent: safe to
-- re-run, the WHERE clauses match zero rows once applied.
--
-- Usage (take a backup first):
--   pg_dump "$PROD_DATABASE_URL" -t events > events_backup_$(date +%Y%m%d).sql
--   psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 -f fix_hosts.sql

\echo '--- Before: rows where hosts is not an array ---'
SELECT id, slug, hosts, jsonb_typeof(hosts) AS hosts_type
FROM events
WHERE jsonb_typeof(hosts) <> 'array';

BEGIN;

-- Empty placeholder objects ({}) -> empty array.
-- These carry no real host data (a TypeORM sync artifact from adding the
-- NOT NULL column), so wrapping them would produce a fake blank host card
-- instead of correctly showing no hosts.
UPDATE events
SET hosts = '[]'::jsonb
WHERE jsonb_typeof(hosts) <> 'array' AND hosts = '{}'::jsonb;

-- Real single-host objects (has actual name/role fields) -> wrapped in an
-- array, preserving the legacy host's data instead of discarding it.
UPDATE events
SET hosts = jsonb_build_array(hosts)
WHERE jsonb_typeof(hosts) <> 'array' AND hosts <> '{}'::jsonb;

-- Hard guard: if anything is still not a proper array at this point,
-- something unexpected is in the data (not object/array shaped at all) —
-- abort instead of committing a partial/unknown fix.
DO $$
DECLARE
  remaining int;
BEGIN
  SELECT count(*) INTO remaining
  FROM events
  WHERE jsonb_typeof(hosts) <> 'array';

  IF remaining > 0 THEN
    RAISE EXCEPTION 'Aborting: % row(s) still have non-array hosts after backfill', remaining;
  END IF;
END $$;

COMMIT;

\echo '--- After: verification (should return zero rows) ---'
SELECT id, slug, hosts
FROM events
WHERE jsonb_typeof(hosts) <> 'array';

\echo '--- Done. Commit succeeded if no exception was raised above. ---'
