import { ImageResponse } from "next/og";
import { C, type ImageFont } from "./share-card-image";
import { displayRating } from "./elo";
import type { Wrapped } from "./season-wrapped";
import type { PointValues } from "./season-positions";
import { pointsPerGame, ppg } from "./measure";

/**
 * A player's season wrapped, as one picture for the group chat.
 *
 * Portrait and phone-shaped, because it is opened in a thread on a phone and
 * nowhere else; dark whatever the sharer's theme, like the match card, so the
 * two look like they came from the same place. Drawn by satori, so the
 * colours are the dark theme's tokens written out.
 */

const WIDTH = 1080;
const HEIGHT = 1350;

const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};

export interface WrappedCard {
  story: Wrapped;
  playerName: string;
  seasonName: string;
  finished: boolean;
  partnerName?: string;
  nemesisName?: string;
  /** What a win and a draw were worth, for points a game. */
  values: PointValues | null;
}

function Tile({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // Two to a row inside the padding, with the gap between.
        width: (WIDTH - 128 - 20) / 2,
        padding: "26px 30px",
        borderRadius: 24,
        background: C.surface,
        border: `2px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: tint ?? C.text }}>
        {value}
      </div>
      <div style={{ display: "flex", marginTop: 6, fontSize: 24, letterSpacing: 2, color: C.muted }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

export function wrappedImage(card: WrappedCard, fonts: ImageFont[]): ImageResponse {
  const { story } = card;
  const { record } = story;
  const values = card.values;
  const record3 = (l: { wins: number; draws: number; losses: number }) =>
    `${l.wins}W ${l.draws}D ${l.losses}L`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 64,
          background: C.bg,
          backgroundImage: `radial-gradient(1000px 600px at 50% 0%, ${C.raised} 0%, ${C.bg} 70%)`,
          fontFamily: "Archivo",
          color: C.text,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 3 }}>
          <div style={{ display: "flex", color: C.muted }}>
            {`${card.seasonName.toUpperCase()} · WRAPPED${card.finished ? "" : " SO FAR"}`}
          </div>
          <div style={{ display: "flex", color: C.accent, fontWeight: 700 }}>THE DUGOUT</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            // A long name steps down rather than running off the edge.
            fontSize: card.playerName.length > 14 ? 88 : 112,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {card.playerName}
        </div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 32, color: C.muted }}>
          {`Played ${record.played} of ${story.nights} nights`}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", marginTop: 48, fontSize: 168, fontWeight: 700, lineHeight: 1 }}>
          <span style={{ color: C.win }}>{record.wins}</span>
          <span style={{ color: C.border, margin: "0 24px" }}>–</span>
          <span style={{ color: C.draw }}>{record.draws}</span>
          <span style={{ color: C.border, margin: "0 24px" }}>–</span>
          <span style={{ color: C.loss }}>{record.losses}</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 56 }}>
          <Tile
            label={card.finished ? "Finished" : "Place so far"}
            value={story.place ? `${ordinal(story.place.position)} of ${story.place.of}` : "—"}
            tint={story.place?.position === 1 ? C.win : undefined}
          />
          <Tile label="Points a game" value={values ? ppg(pointsPerGame(record, values)) : "—"} />
          <Tile
            label="Rating"
            value={
              story.rating
                ? `${displayRating(story.rating.from)} to ${displayRating(story.rating.to)}`
                : "—"
            }
          />
          <Tile label="Best run" value={`${story.winRun} wins`} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", fontSize: 30, color: C.muted, gap: 10 }}>
          {card.partnerName && story.partner && (
            <div style={{ display: "flex" }}>
              {`Best partnership: ${card.partnerName}, ${record3(story.partner.ledger)} together`}
            </div>
          )}
          {card.nemesisName && story.nemesis && (
            <div style={{ display: "flex" }}>
              {`Nemesis: ${card.nemesisName}, ${record3(story.nemesis.ledger)} against`}
            </div>
          )}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts }
  );
}
