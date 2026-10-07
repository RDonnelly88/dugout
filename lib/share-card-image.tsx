import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { RESULTS_SHOWN } from "./config";
import { ordinal } from "./podium";
import {
  initials,
  type ShareCard,
  type SharePlayer,
  type ShareRow,
  type ShareSide,
} from "./share-card";
import type { RecentResult } from "@/types";

/**
 * A match drawn as a picture, for sending to people who are not in the app.
 *
 * Always dark, whatever theme the person sharing is using. The image leaves
 * the app the moment it is made and lands in a thread beside other people's
 * photographs, so it has to look like one thing rather than two, and it
 * cannot ask the reader what they prefer.
 *
 * The colours are the dark theme's tokens written out, because this is drawn
 * by satori rather than a browser — there is no cascade here and no
 * `var(--surface)` to read.
 */

export const C = {
  bg: "#070b12",
  surface: "#0f151f",
  raised: "#19212e",
  border: "#283343",
  text: "#edf2f7",
  muted: "#9baabf",
  accent: "#2ee5c1",
  win: "#50d782",
  draw: "#f5bb47",
  loss: "#f97b7b",
};

/**
 * Portrait, the shape of the phone it lands on. A landscape card shrinks to
 * the width of a message bubble and its names to a few points high; four by
 * five fills the screen when it is opened and still reads in the thread.
 *
 * As tall as it has something to say: the height is added up from what is
 * on it, so a squad in its first fortnight, with no tables and nothing to
 * tell, gets a shorter card rather than one with a hole in it.
 */
const WIDTH = 1080;
const PAD = 60;
const INNER = WIDTH - PAD * 2;

/** The space between two squares of a run. */
const FORM_GAP = 4;

/** Where a player's league place sits, at the end of their row. */
const PLACE = 76;

/** One of the two tables under the line-ups. */
const TABLE = (INNER - 40) / 2;
const TABLE_ROW = 40;

const FORM_TINT: Record<RecentResult, string> = {
  win: C.win,
  draw: C.draw,
  loss: C.loss,
  dnp: C.raised,
};

const FORM_LETTER: Record<RecentResult, string> = {
  win: "W",
  draw: "D",
  loss: "L",
  // A night the squad played without them, which is a blank rather than a
  // result. The strip in the app draws a struck-through figure here; there is
  // no icon set in a picture, so a dash says the same thing.
  dnp: "–",
};

/**
 * How the last few nights went, oldest first.
 *
 * The run arrives newest first and is drawn the other way round, the same way
 * the app draws it, so it reads forwards and ends on the night the card is
 * about.
 */
function ResultRun({ results, box }: { results: RecentResult[]; box: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        // Always as wide as a full run, and filled from the right, so a
        // newcomer's short run still ends in the same column as everybody
        // else's: the last square is this match on every row.
        width: RESULTS_SHOWN * box + (RESULTS_SHOWN - 1) * FORM_GAP,
        justifyContent: "flex-end",
      }}
    >
      {[...results].slice(0, RESULTS_SHOWN).reverse().map((result, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: box,
            height: box,
            marginLeft: index === 0 ? 0 : FORM_GAP,
            borderRadius: 4,
            background: FORM_TINT[result],
            // A missed night is a square with nothing in it rather than no
            // square at all, so five weeks are still five things wide.
            border: `1px solid ${result === "dnp" ? C.border : "transparent"}`,
            color: result === "dnp" ? C.muted : C.bg,
            fontSize: Math.round(box * 0.6),
            fontWeight: 700,
          }}
        >
          {FORM_LETTER[result]}
        </div>
      ))}
    </div>
  );
}

/** "+4", "−3", "±0": a rounded swing, signed the way the app signs one. */
function signed(value: number): string {
  const moved = Math.round(value);
  return `${moved > 0 ? "+" : moved < 0 ? "−" : "±"}${Math.abs(moved)}`;
}

const swingTint = (value: number) =>
  Math.round(value) > 0 ? C.win : Math.round(value) < 0 ? C.loss : C.muted;

/** Where a player's rating move sits, before their run. */
const MOVE = 84;

/** A player's initials in a ring of their side's colour. */
function Initials({ player, size, tint }: { player: SharePlayer; size: number; tint: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: C.raised,
        border: `2px solid ${tint}`,
        color: C.text,
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
      }}
    >
      {initials(player.name)}
    </div>
  );
}

/**
 * How tall a row of the line-ups is.
 *
 * Five or six a side get a comfortable row; a bigger squad shrinks to fit
 * rather than the eleventh player falling off the bottom edge.
 */
function rowHeight(perSide: number): number {
  return perSide <= 6 ? 50 : Math.max(32, Math.floor(300 / perSide));
}

/**
 * One side's line-up: who played, a row each, with how far the night moved
 * their rating, the run they are on and where the league has them, in
 * columns that line up down both sides.
 */
function LineUp({
  side,
  tint,
  height,
  labelled,
}: {
  side: ShareSide;
  tint: string;
  height: number;
  /** Whether to say over the columns what they are; once is enough. */
  labelled: boolean;
}) {
  const face = Math.min(42, height - 8);
  const box = Math.min(24, Math.round(height * 0.48));
  const runs = side.players.some((player) => player.results && player.results.length > 0);
  const label = { display: "flex", justifyContent: "center", fontSize: 15, color: C.muted } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 34,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 2,
          color: tint,
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>{side.name.toUpperCase()}</div>
        {labelled && side.players.some((player) => player.change !== undefined) && (
          <div style={{ ...label, justifyContent: "flex-end", width: MOVE, marginRight: 22 }}>RATING</div>
        )}
        {labelled && runs && (
          <div style={{ ...label, width: RESULTS_SHOWN * box + (RESULTS_SHOWN - 1) * FORM_GAP }}>LAST {RESULTS_SHOWN}</div>
        )}
        {labelled && side.players.some((player) => player.rank !== undefined) && (
          <div style={{ ...label, justifyContent: "flex-end", width: PLACE }}>POS</div>
        )}
      </div>
      {side.players.map((player) => (
        <div key={player.name} style={{ display: "flex", alignItems: "center", height }}>
          <Initials player={player} size={face} tint={tint} />
          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              marginLeft: 16,
              fontSize: Math.min(32, Math.round(height * 0.62)),
              color: C.text,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {player.name}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: MOVE,
              marginRight: 22,
              flexShrink: 0,
              fontSize: Math.min(28, Math.round(height * 0.54)),
              fontWeight: 700,
              color: player.change === undefined ? C.muted : swingTint(player.change),
            }}
          >
            {player.change === undefined ? "" : signed(player.change)}
          </div>
          {player.results && player.results.length > 0 && (
            <ResultRun results={player.results} box={box} />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: PLACE,
              flexShrink: 0,
              fontSize: Math.min(26, Math.round(height * 0.5)),
              fontWeight: 700,
              color: C.muted,
            }}
          >
            {player.rank !== undefined ? ordinal(player.rank) : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * One of the two tables under the line-ups, with what its numbers are
 * written over them.
 *
 * Whoever played that night is picked out, because the question a table
 * answers on a match card is not "who is best" but "and where does that
 * leave us?".
 */
function Table({ title, unit, rows }: { title: string; unit?: string; rows: ShareRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: TABLE }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          height: 34,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            color: C.accent,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {title.toUpperCase()}
        </div>
        {unit && (
          <div style={{ display: "flex", marginLeft: 12, color: C.muted, fontSize: 16 }}>
            {unit.toUpperCase()}
          </div>
        )}
      </div>
      {rows.map((row) => (
        <div
          key={row.name}
          style={{
            display: "flex",
            alignItems: "center",
            height: TABLE_ROW - 4,
            marginBottom: 4,
            padding: "0 12px",
            borderRadius: 8,
            background: row.played ? C.raised : "transparent",
            fontSize: 24,
            color: row.played ? C.text : C.muted,
          }}
        >
          <div style={{ display: "flex", width: 32, color: C.muted }}>{row.place}</div>
          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              fontWeight: row.played ? 700 : 400,
            }}
          >
            {row.name}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", width: 66, fontWeight: 700 }}>
            {row.figure}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A side's name over the score, and what the result locked in for each of them. */
function Side({
  side,
  tint,
  align,
}: {
  side: ShareSide;
  tint: string;
  align: "flex-start" | "flex-end";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align, width: 300 }}>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: side.won ? tint : C.text }}>
        {side.name}
      </div>
      {side.points !== undefined && (
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 6, fontSize: 24 }}>
          <span style={{ fontWeight: 700, color: swingTint(side.points) }}>{signed(side.points)}</span>
          <span style={{ marginLeft: 8, color: C.muted }}>each for the result</span>
        </div>
      )}
    </div>
  );
}

/** The heights the card is added up from; see `WIDTH`. */
const H = {
  header: 34,
  score: 32 + 136,
  headline: 10 + 44,
  story: (lines: number) => (lines === 0 ? 0 : 28 + 40 + lines * 40 + (lines - 1) * 6),
  lineUps: (row: number, perSide: number) => 28 + 2 * (34 + perSide * row) + 20,
  tables: 28 + 24 + 34 + 5 * TABLE_ROW,
};

export function matchCardImage(card: ShareCard, fonts: ImageFont[]): ImageResponse {
  const drawn = !card.a.won && !card.b.won;
  const tintA = drawn ? C.draw : card.a.won ? C.win : C.muted;
  const tintB = drawn ? C.draw : card.b.won ? C.win : C.muted;
  const scored = card.a.score !== undefined && card.b.score !== undefined;
  // Whichever of the two there is something to say about. A squad in its first
  // fortnight has neither, and an empty heading over four blank rows is worse
  // than leaving the space to the result.
  const tables = [
    card.ladder.length > 0 && <Table key="ladder" title="Ratings" rows={card.ladder} />,
    card.standings.length > 0 && (
      <Table key="standings" title={card.standingsTitle} unit="pts" rows={card.standings} />
    ),
  ].filter(Boolean);

  const perSide = Math.max(card.a.players.length, card.b.players.length, 1);
  const row = rowHeight(perSide);
  const height =
    PAD * 2 +
    H.header +
    H.score +
    H.headline +
    H.story(card.story.length) +
    H.lineUps(row, perSide) +
    (tables.length > 0 ? H.tables : 0);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: PAD,
          background: C.bg,
          // A wash behind the scoreline, so the card has a centre of gravity
          // rather than reading as a table.
          backgroundImage: `radial-gradient(800px 420px at 50% 14%, ${C.surface} 0%, ${C.bg} 70%)`,
          fontFamily: "Archivo",
          color: C.text,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: H.header }}>
          <div style={{ display: "flex", color: C.muted, fontSize: 26 }}>
            {card.date}
            {card.location ? `  ·  ${card.location}` : ""}
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 3, color: C.accent }}>
            THE DUGOUT
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
            height: 136,
          }}
        >
          <Side side={card.a} tint={tintA} align="flex-start" />
          {scored ? (
            <div style={{ display: "flex", alignItems: "center", fontSize: 128, fontWeight: 700 }}>
              <span style={{ color: tintA }}>{card.a.score}</span>
              <span style={{ color: C.border, margin: "0 20px" }}>–</span>
              <span style={{ color: tintB }}>{card.b.score}</span>
            </div>
          ) : (
            // Nobody counted the goals, which is most nights. The headline
            // still says who won, so the space goes to the sides instead of a
            // pair of noughts that were never true.
            <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: C.border }}>v</div>
          )}
          <Side side={card.b} tint={tintB} align="flex-end" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            height: 44,
            fontSize: 34,
            fontWeight: 700,
            color: drawn ? C.draw : scored ? C.muted : C.win,
          }}
        >
          {scored ? card.blurb : card.headline}
        </div>

        {card.story.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 28,
              padding: "20px 28px",
              borderRadius: 20,
              background: C.surface,
              border: `2px solid ${C.border}`,
            }}
          >
            {card.story.map((line, index) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 40,
                  marginTop: index === 0 ? 0 : 6,
                  fontSize: 28,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 10,
                    height: 10,
                    marginRight: 18,
                    borderRadius: 5,
                    background: C.accent,
                    flexShrink: 0,
                  }}
                />
                {line}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 28,
          }}
        >
          <LineUp side={card.a} tint={tintA} height={row} labelled />
          <div style={{ display: "flex", height: 20 }} />
          <LineUp side={card.b} tint={tintB} height={row} labelled={false} />
        </div>

        {tables.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: tables.length === 1 ? "center" : "space-between",
              marginTop: 28,
              paddingTop: 24,
              borderTop: `2px solid ${C.border}`,
            }}
          >
            {tables}
          </div>
        )}
      </div>
    ),
    { width: WIDTH, height, fonts }
  );
}

/** What `ImageResponse` wants a font as. */
export interface ImageFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

/**
 * The app's own typeface, read off disk rather than fetched.
 *
 * satori has no browser to ask for a font, and next/font's copy of Archivo
 * lives somewhere only the client bundle knows about. The two files are
 * carried into the deployment by `outputFileTracingIncludes` in
 * `next.config.mjs`, since nothing imports them in a way the tracer can see.
 */
export async function cardFonts(): Promise<ImageFont[]> {
  const dir = join(process.cwd(), "lib", "fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "Archivo-Regular.ttf")),
    readFile(join(dir, "Archivo-Bold.ttf")),
  ]);

  return [
    { name: "Archivo", data: regular.buffer as ArrayBuffer, weight: 400, style: "normal" },
    { name: "Archivo", data: bold.buffer as ArrayBuffer, weight: 700, style: "normal" },
  ];
}
