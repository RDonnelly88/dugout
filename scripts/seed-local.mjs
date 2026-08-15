/**
 * Seed the local Supabase stack with a squad, two seasons and a season and a
 * half of results, so every page has something real to draw.
 *
 *   npm run seed:local
 *
 * Re-runnable: it clears the tables and recreates the account, so the password
 * is always known and the rows always match this script.
 *
 * Local only, and it refuses to run against anything else.
 *
 * Every choice comes from a seeded generator rather than Math.random, so two
 * runs produce identical data. The screenshot specs diff against this — a
 * squad that reshuffled every seed would make every screenshot a false
 * positive.
 */

import { execSync } from "node:child_process";

const EMAIL = process.argv[2] ?? "demo@example.test";
const PASSWORD = "correct-horse-battery-staple";

let API, SERVICE;
try {
  const status = JSON.parse(
    execSync("supabase status -o json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
  );
  ({ API_URL: API, SERVICE_ROLE_KEY: SERVICE } = status);
} catch {
  console.error("Local stack not running. Start it with `supabase start`.");
  process.exit(2);
}

if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(API)) {
  console.error(`Refusing to seed a non-local API (${API}).`);
  process.exit(2);
}

const admin = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

/** Mulberry32. Small, fast, and the same sequence every run. */
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260815);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const shuffled = (xs) =>
  xs
    .map((x) => [rand(), x])
    .sort((a, b) => a[0] - b[0])
    .map(([, x]) => x);

async function rest(path, init) {
  const res = await fetch(`${API}/rest/v1/${path}`, {
    ...init,
    headers: { ...admin, Prefer: "return=representation", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status} ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

// ── account ───────────────────────────────────────────────────────────────

// Reuse the account if it survived a previous run and reset its password,
// rather than deleting and recreating it. A delete that soft-deletes leaves
// the address registered, and the next create then fails with email_exists.
const listed = await (
  await fetch(`${API}/auth/v1/admin/users`, { headers: admin })
).json();

let user = (listed.users ?? []).find((u) => u.email === EMAIL);

if (user) {
  await fetch(`${API}/auth/v1/admin/users/${user.id}`, {
    method: "PUT",
    headers: admin,
    body: JSON.stringify({ password: PASSWORD, email_confirm: true }),
  });
} else {
  user = await (
    await fetch(`${API}/auth/v1/admin/users`, {
      method: "POST",
      headers: admin,
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
      }),
    })
  ).json();
}

if (!user?.id) {
  throw new Error(`Could not create or reuse ${EMAIL}: ${JSON.stringify(user)}`);
}

// ── clear ─────────────────────────────────────────────────────────────────
// Order matters: matches and players reference seasons and teams.

for (const table of ["matches", "players", "seasons", "team_members", "teams"]) {
  await fetch(`${API}/rest/v1/${table}?id=not.is.null`, {
    method: "DELETE",
    headers: admin,
  });
}

// ── squad ─────────────────────────────────────────────────────────────────

const [team] = await rest("teams", {
  method: "POST",
  body: JSON.stringify({ name: "Thursday Nighters", created_by: user.id }),
});

await rest("team_members", {
  method: "POST",
  body: JSON.stringify({ team_id: team.id, user_id: user.id, role: "admin" }),
});

const NAMES = [
  "Baz", "Deano", "Keeper", "Macca", "Nobby", "Ollie",
  "Pikey", "Ritchie", "Scouse", "Tosh", "Vinny", "Woody",
];

const players = await rest("players", {
  method: "POST",
  body: JSON.stringify(
    NAMES.map((name, i) => ({
      name,
      team_id: team.id,
      // Two of them retired, so the active filter has something to hide.
      is_active: i < NAMES.length - 2,
      // Spread across the scale so "even by skill" has work to do.
      skill_level: 1 + (i % 5),
    }))
  ),
});

// ── seasons ───────────────────────────────────────────────────────────────

const DAY = 86_400_000;
// Anchored to a fixed date rather than "now", so the fixture list doesn't
// drift and the screenshots stay comparable.
const anchor = new Date("2026-08-13T19:00:00Z").getTime();

/**
 * Five, because a squad that has run for a couple of years has about that many
 * and one that has run for two months tells you nothing about how the app
 * behaves. A player's season tabs used to be seeded with two, which is why
 * they were never seen spilling out of the bar that holds them.
 *
 * Days are counted back from the anchor, so the fixture list never drifts.
 */
const SEASONS = [
  { name: "Autumn 2024", from: 700, to: 620 },
  { name: "Spring 2025", from: 612, to: 530 },
  { name: "Autumn 2025", from: 522, to: 440 },
  { name: "Spring 2026", from: 210, to: 120 },
  { name: "Summer 2026", from: 112, to: null },
];

const seasons = await rest("seasons", {
  method: "POST",
  body: JSON.stringify(
    SEASONS.map(({ name, from, to }) => ({
      name,
      team_id: team.id,
      start_date: new Date(anchor - from * DAY).toISOString(),
      // Explicitly null rather than omitted: PostgREST rejects a bulk insert
      // whose objects don't all carry the same keys.
      end_date: to === null ? null : new Date(anchor - to * DAY).toISOString(),
      is_current: to === null,
      is_finished: to !== null,
    }))
  ),
});

// ── results ───────────────────────────────────────────────────────────────

/**
 * Each player carries a hidden strength, so the table settles into an order
 * with a clear top and bottom rather than converging on everyone at 50%. It is
 * only used to weight the scoreline — nothing stores it, and the app derives
 * every rating it shows from the results alone.
 */
const strength = new Map(players.map((p, i) => [p.id, 0.35 + (i % 7) * 0.06]));

function fixture(seasonId, date) {
  const playing = shuffled(players).slice(0, 10);
  const a = playing.slice(0, 5);
  const b = playing.slice(5);

  const rate = (side) =>
    side.reduce((sum, p) => sum + strength.get(p.id), 0) / side.length;
  const edge = rate(a) - rate(b);

  // A five-a-side ends somewhere in the low single figures; the edge nudges
  // which way rather than deciding it.
  const base = () => 2 + Math.floor(rand() * 5);
  let scoreA = Math.max(0, base() + Math.round(edge * 6));
  let scoreB = Math.max(0, base() - Math.round(edge * 6));

  // Level them up now and then. Draws are worth a point, so a season without
  // any doesn't exercise the table at all — every earlier run showed 0 in the
  // Draws column for all twelve players.
  if (rand() < 0.18) scoreB = scoreA;

  return {
    date: new Date(date).toISOString().slice(0, 10),
    // Who won is the result; the score is detail on top of it.
    outcome: scoreA > scoreB ? "a" : scoreA < scoreB ? "b" : "draw",
    team_a: { name: "Bibs", players: a.map((p) => p.id), score: scoreA },
    team_b: { name: "No bibs", players: b.map((p) => p.id), score: scoreB },
    status: "completed",
    season_id: seasonId,
    team_id: team.id,
    notes: rand() < 0.15 ? pick([
      "Pitch flooded, played through it.",
      "Nobby went in goal after ten minutes.",
      "Two nil down at half time.",
      "Last-minute winner.",
    ]) : null,
  };
}

// One game a week through each season, up to its end or to the anchor for the
// one still running.
const fixtures = [];
SEASONS.forEach(({ from, to }, i) => {
  const last = to ?? 0;
  for (let day = from - 7; day > last; day -= 7) {
    fixtures.push(fixture(seasons[i].id, anchor - day * DAY));
  }
});

await rest("matches", { method: "POST", body: JSON.stringify(fixtures) });

console.log(
  `Seeded ${players.length} players, ${seasons.length} seasons and ${fixtures.length} matches.\n` +
    `Sign in at http://localhost:3000/login as ${EMAIL} / ${PASSWORD}`
);
