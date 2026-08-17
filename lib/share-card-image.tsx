import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { initials, type ShareCard, type ShareSide } from "./share-card";

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
};

/** The shape every chat app expects a link preview to be. */
const CARD = { width: 1200, height: 630 };

interface RowSize {
  chip: number;
  name: number;
  gap: number;
}

function Chip({
  name,
  tint,
  size,
  mirrored,
}: {
  name: string;
  tint: string;
  size: RowSize;
  mirrored: boolean;
}) {
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
          fontSize: size.name,
          color: C.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
}

/**
 * How big a name can be drawn.
 *
 * The card is a fixed 1200 by 630 and a squad is not a fixed size, so the
 * rows shrink to fit rather than the eleventh player falling off the bottom
 * edge — which is exactly what a picture of a match should never do.
 */
const ROOM_FOR_NAMES = 236;

function rowSize(rows: number): RowSize {
  const height = Math.min(46, Math.floor(ROOM_FOR_NAMES / Math.max(rows, 1)));
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
  const size = rowSize(Math.max(card.a.players.length, card.b.players.length));

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
            {card.a.players.map((name) => (
              <Chip key={name} name={name} tint={tintA} size={size} mirrored={false} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            {card.b.players.map((name) => (
              <Chip key={name} name={name} tint={tintB} size={size} mirrored />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...CARD, fonts }
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
