import { ImageResponse } from "next/og";
import { C, Moved, signed, swingTint, type ImageFont } from "./share-card-image";
import type { TableCard, TableCardRow } from "./table-card";

/**
 * The tables after a night drawn as a picture, in the match card's colours
 * and type so the two read as a pair when they land in the thread together.
 *
 * Portrait and as tall as the longer table, the same as the match card: the
 * height is added up from what is on it rather than fixed.
 */
const WIDTH = 1080;
const PAD = 60;
const INNER = WIDTH - PAD * 2;
const GAP = 40;
const ROW = 44;

const H = {
  header: 34,
  title: 24 + 72,
  movers: (lines: number) => (lines === 0 ? 0 : 28 + 40 + lines * 40 + (lines - 1) * 6),
  table: (rows: number) => 32 + 34 + rows * ROW,
};

/**
 * One table, every row with its place, how far it moved, the figure and what
 * the night did to it. Whoever played is picked out, as on the match card.
 */
function Table({
  title,
  unit,
  rows,
  width,
}: {
  title: string;
  unit: string;
  rows: TableCardRow[];
  width: number;
}) {
  const label = { display: "flex", justifyContent: "flex-end", color: C.muted, fontSize: 16 } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", width }}>
      <div style={{ display: "flex", alignItems: "baseline", height: 34, fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
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
        <div style={{ ...label, width: 76 }}>{unit.toUpperCase()}</div>
        <div style={{ ...label, width: 70 }}>NIGHT</div>
      </div>
      {rows.map((row) => (
        <div
          key={row.name}
          style={{
            display: "flex",
            alignItems: "center",
            height: ROW - 4,
            marginBottom: 4,
            padding: "0 12px",
            borderRadius: 8,
            background: row.played ? C.raised : "transparent",
            fontSize: 24,
            color: row.played ? C.text : C.muted,
          }}
        >
          <div style={{ display: "flex", width: 36, color: C.muted }}>{row.place}</div>
          <div style={{ display: "flex", width: 56 }}>
            <Moved by={row.moved} size={18} />
          </div>
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
          <div style={{ display: "flex", justifyContent: "flex-end", width: 64, fontWeight: 700, color: C.text }}>
            {row.figure}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: 70,
              fontSize: 20,
              fontWeight: 700,
              color: row.change === undefined ? C.muted : swingTint(row.change),
            }}
          >
            {row.change === undefined ? "" : signed(row.change)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function tableCardImage(card: TableCard, fonts: ImageFont[]): ImageResponse {
  const two = card.league !== undefined && card.league.rows.length > 0;
  const width = two ? (INNER - GAP) / 2 : INNER;
  const rows = Math.max(card.ratings.length, two ? card.league!.rows.length : 0);
  const height = PAD * 2 + H.header + H.title + H.movers(card.movers.length) + H.table(rows);

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
          backgroundImage: `radial-gradient(800px 420px at 50% 8%, ${C.surface} 0%, ${C.bg} 70%)`,
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

        <div style={{ display: "flex", alignItems: "flex-end", height: 72, marginTop: 24, fontSize: 60, fontWeight: 700 }}>
          Where everybody stands
        </div>

        {card.movers.length > 0 && (
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
            {card.movers.map((line, index) => (
              <div
                key={line}
                style={{ display: "flex", alignItems: "center", height: 40, marginTop: index === 0 ? 0 : 6, fontSize: 28 }}
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
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {line}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 32,
          }}
        >
          <Table title="Ratings" unit="rating" rows={card.ratings} width={width} />
          {two && <Table title={card.league!.title} unit="pts" rows={card.league!.rows} width={width} />}
        </div>
      </div>
    ),
    { width: WIDTH, height, fonts }
  );
}
