import { cn } from "@/lib/utils";
import type { Card as CardCode } from "@/lib/poker/types";

/**
 * Flat realistic playing card — the lightweight, server-renderable card used for
 * the table grid and opponents (the design keeps these flat). It shares the
 * cool-white face + neon FH-crest back of <Card3D>, without 3D transforms.
 */

const SUIT_SYMBOL: Record<string, string> = { c: "♣", d: "♦", h: "♥", s: "♠" };

function rankLabel(r: string): string {
  return r === "T" ? "10" : r;
}

const DIMS: Record<"sm" | "md" | "lg", { w: number; h: number; r: number; rank: number; pip: number; corner: number; pad: number }> = {
  sm: { w: 34, h: 48, r: 5, rank: 12, pip: 18, corner: 9, pad: 3 },
  md: { w: 44, h: 62, r: 6, rank: 15, pip: 24, corner: 11, pad: 4 },
  lg: { w: 60, h: 84, r: 8, rank: 20, pip: 34, corner: 14, pad: 6 },
};

export function PlayingCard({
  card,
  size = "md",
  faceDown = false,
}: {
  card?: CardCode;
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
}) {
  const S = DIMS[size];

  if (faceDown || !card) {
    const crest = Math.round(S.w * 0.5);
    return (
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: S.w,
          height: S.h,
          borderRadius: S.r,
          // Deep-plum back, ringed in magenta + amber.
          background: "#1a1030",
          boxShadow:
            "inset 0 0 0 1px rgba(59,130,246,0.42), inset 0 0 0 3px #120a26, inset 0 0 0 4px rgba(255,210,74,0.20), 0 4px 10px -5px rgba(0,0,0,0.6)",
        }}
      >
        {/* Neon crosshatch weave — magenta one way, teal the other. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(45deg, rgba(59,130,246,0.16) 0 1px, transparent 1px 7px), repeating-linear-gradient(-45deg, rgba(20,210,200,0.13) 0 1px, transparent 1px 7px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12), transparent 60%)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: crest,
              height: crest,
              borderRadius: "50%",
              border: "1px solid rgba(255,210,74,0.55)",
              background: "rgba(255,210,74,0.08)",
              boxShadow: "0 0 0 3px rgba(20,210,200,0.10)",
              fontFamily: "var(--font-display), system-ui, sans-serif",
              color: "#ffd24a",
              fontSize: Math.round(S.w * 0.22),
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            FH
          </div>
        </div>
      </div>
    );
  }

  const rank = rankLabel(card[0]!);
  const suit = card[1]!;
  const red = suit === "h" || suit === "d";
  const color = red ? "#d81f6a" : "#221539";
  const sym = SUIT_SYMBOL[suit];

  return (
    <div
      className={cn("relative shrink-0")}
      style={{
        width: S.w,
        height: S.h,
        borderRadius: S.r,
        overflow: "hidden",
        background: "radial-gradient(125% 120% at 50% -10%, #f8f5fc 0%, #efe9f7 72%, #e3dcf0 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(60,40,90,0.14), inset 0 1px 0 rgba(255,255,255,0.8)",
        fontFamily: "var(--font-display), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: S.pad,
          left: S.pad + 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          lineHeight: 0.82,
          color,
        }}
      >
        <span style={{ fontSize: S.rank, fontWeight: 700, letterSpacing: "-0.03em" }}>{rank}</span>
        <span style={{ fontSize: S.corner, lineHeight: 1 }}>{sym}</span>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color,
          fontSize: S.pip,
          lineHeight: 1,
          textShadow: "0 1px 1px rgba(60,40,90,0.18)",
        }}
      >
        {sym}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: S.pad,
          right: S.pad + 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          lineHeight: 0.82,
          color,
          transform: "rotate(180deg)",
        }}
      >
        <span style={{ fontSize: S.rank, fontWeight: 700, letterSpacing: "-0.03em" }}>{rank}</span>
        <span style={{ fontSize: S.corner, lineHeight: 1 }}>{sym}</span>
      </div>
    </div>
  );
}
