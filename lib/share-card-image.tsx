import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  initials,
  type ShareCard,
  type SharePlayer,
  type ShareRow,
  type ShareSide,
} from "./share-card";

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

const C = {
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
 * The card is as tall as it has something to say.
 *
 * A link preview wants 1200 by 630, but this is never a link preview — the
 * file itself is what gets sent, so the only shape it has to suit is a phone
 * screen. With tables under the result it grows to fit them; without, it
 * stays short rather than leaving a third of the picture empty, which is
 * precisely what a squad in its first fortnight would get.
 */
const WIDTH = 1200;
const HEIGHT = { withTables: 900, plain: 630 };

interface RowSize {
  chip: number;
  name: number;
  gap: number;
}

function Swing({ change, size }: { change: number; size: number }) {
  const moved = Math.round(change);
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 700,
        // A night that moved nothing is a night inside the grace, not a loss.
        color: moved > 0 ? C.win : moved < 0 ? C.loss : C.muted,
      }}
    >
      {moved > 0 ? "+" : moved < 0 ? "−" : "±"}
      {Math.abs(moved)}
    </div>
  );
}

function Chip({
  player,
  tint,
  size,
  mirrored,
}: {
  player: SharePlayer;
  tint: string;
  size: RowSize;
  mirrored: boolean;
}) {
  const { name } = player;
  return (
    <div
      style={{
        display: "flex",
        // The away side reads right to left, so its initials sit against the
        // edge of the card and the two lists frame the middle rather than
        // both pointing the same way.
        flexDirection: mirrored ? "row-reverse" : "row",
        alignItems: "center",
        marginBottom: size.gap,
        maxWidth: 460,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size.chip,
          height: size.chip,
          borderRadius: size.chip / 2,
          marginLeft: mirrored ? 12 : 0,
          marginRight: mirrored ? 0 : 12,
          background: C.raised,
          border: `2px solid ${tint}`,
          color: tint,
          fontSize: size.chip * 0.4,
          fontWeight: 700,
        }}
      >
        {initials(name)}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: mirrored ? "row-reverse" : "row",
          alignItems: "baseline",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: size.name,
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {player.change !== undefined && (
          <div
            style={{
              display: "flex",
              marginLeft: mirrored ? 0 : 10,
              marginRight: mirrored ? 10 : 0,
            }}
          >
            <Swing change={player.change} size={Math.round(size.name * 0.8)} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One of the two tables under the result.
 *
 * Whoever played that night is picked out, because the question a table
 * answers on a match card is not "who is best" but "and where does that
 * leave us?".
 */
function Table({ title, rows }: { title: string; rows: ShareRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 480 }}>
      <div
        style={{
          display: "flex",
          marginBottom: 12,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 2,
          color: C.accent,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title.toUpperCase()}
      </div>
      {rows.map((row, i) => (
        <div
          key={row.name}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
            padding: "5px 12px",
            borderRadius: 8,
            background: row.played ? C.raised : "transparent",
            fontSize: 24,
            color: row.played ? C.text : C.muted,
          }}
        >
          <div style={{ display: "flex", width: 34, color: C.muted }}>{i + 1}</div>
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: row.played ? 700 : 400,
            }}
          >
            {row.name}
          </div>
          <div style={{ display: "flex", fontWeight: 700 }}>{row.figure}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * How big a name can be drawn.
 *
 * The card is a fixed width and a squad is not a fixed size, so the rows
 * shrink to fit rather than the eleventh player falling off the bottom edge —
 * which is exactly what a picture of a match should never do.
 */
const ROOM_FOR_NAMES = { withTables: 250, plain: 236 };

function rowSize(rows: number, room: number): RowSize {
  const height = Math.min(46, Math.floor(room / Math.max(rows, 1)));
  return {
    chip: Math.min(40, height - 6),
    name: Math.min(28, Math.round(height * 0.62)),
    gap: 6,
  };
}

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: align }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 40,
          fontWeight: 700,
          color: side.won ? tint : C.text,
        }}
      >
        {side.name}
      </div>
      {side.won && (
        <div
          style={{
            display: "flex",
            marginTop: 8,
            padding: "4px 14px",
            borderRadius: 999,
            background: tint,
            color: C.bg,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          WINNERS
        </div>
      )}
    </div>
  );
}

export function matchCardImage(card: ShareCard, fonts: ImageFont[]): ImageResponse {
  const drawn = !card.a.won && !card.b.won;
  const tintA = drawn ? C.draw : card.a.won ? C.win : C.muted;
  const tintB = drawn ? C.draw : card.b.won ? C.win : C.muted;
  const scored = card.a.score !== undefined && card.b.score !== undefined;
  // Whichever of the two there is something to say about. A squad in its first
  // fortnight has neither, and an empty heading over four blank rows is worse
  // than leaving the space to the result.
  const tables = [
    card.ladder.length > 0 && (
      <Table key="ladder" title="Ratings" rows={card.ladder} />
    ),
    card.standings.length > 0 && (
      <Table
        key="standings"
        title={card.seasonName ?? "League table"}
        rows={card.standings}
      />
    ),
  ].filter(Boolean);

  const roomy = tables.length > 0;
  const size = rowSize(
    Math.max(card.a.players.length, card.b.players.length),
    roomy ? ROOM_FOR_NAMES.withTables : ROOM_FOR_NAMES.plain
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 56,
          background: C.bg,
          // A wash of the accent behind the scoreline, so the card has a
          // centre of gravity rather than reading as a table.
          backgroundImage: `radial-gradient(900px 420px at 50% 34%, ${C.surface} 0%, ${C.bg} 70%)`,
          fontFamily: "Archivo",
          color: C.text,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", color: C.muted, fontSize: 24 }}>
            {card.date}
            {card.location ? `  ·  ${card.location}` : ""}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.accent,
            }}
          >
            THE DUGOUT
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 36,
          }}
        >
          <Side side={card.a} tint={tintA} align="flex-start" />
          {scored ? (
            <div style={{ display: "flex", alignItems: "center", fontSize: 116, fontWeight: 700 }}>
              <span style={{ color: tintA }}>{card.a.score}</span>
              <span style={{ color: C.border, margin: "0 24px" }}>–</span>
              <span style={{ color: tintB }}>{card.b.score}</span>
            </div>
          ) : (
            // Nobody counted the goals, which is most Tuesdays. The headline
            // still says who won, so the space goes to the sides instead of a
            // pair of noughts that were never true.
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: C.border }}>v</div>
          )}
          <Side side={card.b} tint={tintB} align="flex-end" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            fontSize: 32,
            color: drawn ? C.draw : scored ? C.muted : C.win,
            fontWeight: 700,
          }}
        >
          {scored ? card.blurb : card.headline}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flex: 1,
            alignItems: "center",
            marginTop: 28,
            paddingTop: 24,
            borderTop: `2px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {card.a.players.map((player) => (
              <Chip
                key={player.name}
                player={player}
                tint={tintA}
                size={size}
                mirrored={false}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            {card.b.players.map((player) => (
              <Chip key={player.name} player={player} tint={tintB} size={size} mirrored />
            ))}
          </div>
        </div>

        {tables.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: tables.length === 1 ? "center" : "space-between",
              marginTop: 20,
              paddingTop: 24,
              borderTop: `2px solid ${C.border}`,
            }}
          >
            {tables}
          </div>
        )}
      </div>
    ),
    {
      width: WIDTH,
      height: roomy ? HEIGHT.withTables : HEIGHT.plain,
      fonts,
    }
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
