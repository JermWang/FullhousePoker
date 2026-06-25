"use client";

/**
 * Card3D — premium CSS-3D playing card (ported from Claude Design's deep-dive).
 *
 * Pure CSS 3D transforms, no WebGL: a cool-white face in Space Grotesk, a milled
 * lilac-silver edge (stacked translateZ layers), and a neon FH-crest back (magenta
 * + teal crosshatch). Pointer tilt, idle float, and a magenta glow are opt-in and
 * respect prefers-reduced-motion.
 *
 * Used for visual emphasis (hero fan, community cards, your hole cards). Flat
 * opponent/table cards use the lighter <PlayingCard>.
 */

import { useEffect, useRef } from "react";
import type { Card as CardCode, Rank, Suit } from "@/lib/poker/types";

export type Card3DSize = "sm" | "md" | "lg" | "hero";

const SIZES: Record<
  Card3DSize,
  {
    w: number; h: number; r: number; t: number;
    rank: number; pip: number; corner: number; pad: number; padX: number;
    crest: number; crestF: number;
  }
> = {
  sm: { w: 50, h: 70, r: 5, t: 4, rank: 14, pip: 20, corner: 11, pad: 4, padX: 5, crest: 22, crestF: 12 },
  md: { w: 66, h: 92, r: 7, t: 5, rank: 18, pip: 28, corner: 13, pad: 6, padX: 7, crest: 30, crestF: 15 },
  lg: { w: 98, h: 137, r: 9, t: 6, rank: 26, pip: 44, corner: 18, pad: 8, padX: 9, crest: 42, crestF: 22 },
  hero: { w: 152, h: 214, r: 13, t: 9, rank: 40, pip: 70, corner: 27, pad: 12, padX: 14, crest: 64, crestF: 34 },
};

const SUIT_SYMBOL: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };

function rankLabel(r: string): string {
  return r === "T" ? "10" : r;
}

export interface Card3DProps {
  card?: CardCode;
  rank?: string;
  suit?: Suit;
  size?: Card3DSize;
  faceDown?: boolean;
  tilt?: boolean;
  float?: boolean;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Card3D({
  card,
  rank: rankProp,
  suit: suitProp,
  size = "lg",
  faceDown = false,
  tilt = true,
  float = false,
  glow = false,
  className,
  style,
}: Card3DProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  const S = SIZES[size];
  const suit = (suitProp ?? (card?.[1] as Suit) ?? "s") as Suit;
  const rank = rankLabel(rankProp ?? (card?.[0] as Rank) ?? "A");
  const red = suit === "h" || suit === "d";
  const suitColor = red ? "#d81f6a" : "#221539";
  const sym = SUIT_SYMBOL[suit];
  const half = S.t / 2;

  // Stacked lilac-silver layers form the card's milled edge.
  const layerCount = Math.max(7, Math.round(S.t * 2.4));
  const layers = Array.from({ length: layerCount }, (_, i) => {
    const z = -half + 0.5 + (i / (layerCount - 1)) * (S.t - 1);
    return z;
  });

  useEffect(() => {
    const root = rootRef.current;
    const cardEl = cardRef.current;
    if (!root || !cardEl) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const apply = () => {
      const baseY = faceDown ? 180 : 0;
      cardEl.style.transform = `rotateY(${(baseY + tiltRef.current.y).toFixed(
        2,
      )}deg) rotateX(${tiltRef.current.x.toFixed(2)}deg)`;
    };

    cardEl.style.transition = "transform 0.62s cubic-bezier(.2,.75,.2,1)";
    apply();

    if (!tilt || reduce) return;

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      tiltRef.current.y = ((e.clientX - r.left) / r.width - 0.5) * 26;
      tiltRef.current.x = -((e.clientY - r.top) / r.height - 0.5) * 20;
      cardEl.style.transition = "transform 0.08s linear";
      apply();
    };
    const onLeave = () => {
      tiltRef.current = { x: 0, y: 0 };
      cardEl.style.transition = "transform 0.62s cubic-bezier(.2,.75,.2,1)";
      apply();
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [tilt, faceDown]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ display: "grid", placeItems: "center", perspective: "1100px", ...style }}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          animation: float ? "vp-float 6.5s ease-in-out infinite" : "none",
        }}
      >
        {/* Magenta glow halo */}
        <div
          style={{
            position: "absolute",
            inset: "-32%",
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(59,130,246,0.42), rgba(59,130,246,0.06) 55%, transparent 72%)",
            opacity: glow ? 1 : 0,
            filter: "blur(6px)",
            transition: "opacity .45s ease",
            transform: "translateZ(-8px)",
          }}
        />
        <div
          ref={cardRef}
          style={{
            position: "relative",
            width: S.w,
            height: S.h,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Back face — deep-plum with a magenta+teal neon weave and FH crest. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: S.r,
              backfaceVisibility: "hidden",
              transform: `rotateY(180deg) translateZ(${half}px)`,
              overflow: "hidden",
              background: "#150b2a",
              boxShadow:
                "inset 0 0 0 1px rgba(59,130,246,0.34), inset 0 0 0 4px rgba(18,10,38,1), inset 0 0 0 5px rgba(255,210,74,0.18)",
            }}
          >
            {/* Neon crosshatch weave — magenta one way, teal the other. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(45deg, rgba(59,130,246,0.14) 0 1px, transparent 1px 8px), repeating-linear-gradient(-45deg, rgba(20,210,200,0.12) 0 1px, transparent 1px 8px)",
              }}
            />
            {/* Soft magenta core glow behind the crest. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12), transparent 58%)",
              }}
            />
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: S.crest,
                  height: S.crest,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,210,74,0.5)",
                  background: "rgba(255,210,74,0.06)",
                  boxShadow: "0 0 0 4px rgba(21,11,42,0.85), 0 0 0 5px rgba(20,210,200,0.18)",
                  fontFamily: "var(--font-display), system-ui, sans-serif",
                  color: "#ffd24a",
                  fontSize: S.crestF,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                }}
              >
                FH
              </div>
            </div>
          </div>

          {/* Milled lilac-silver edge */}
          {layers.map((z, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: S.r,
                transform: `translateZ(${z.toFixed(2)}px)`,
                background: "linear-gradient(170deg, #f4f0fa 0%, #d6cee8 42%, #b1a7cb 100%)",
              }}
            />
          ))}

          {/* Front face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: S.r,
              backfaceVisibility: "hidden",
              transform: `translateZ(${half}px)`,
              overflow: "hidden",
              background:
                "radial-gradient(125% 120% at 50% -8%, #f8f5fc 0%, #efe9f7 70%, #e3dcf0 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -14px 26px rgba(60,40,90,0.06), inset 0 0 0 1px rgba(60,40,90,0.10)",
              fontFamily: "var(--font-display), system-ui, sans-serif",
            }}
          >
            <Corner rank={rank} sym={sym} color={suitColor} S={S} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: suitColor,
                fontSize: S.pip,
                lineHeight: 1,
                textShadow: "0 1px 1px rgba(60,40,90,0.18)",
              }}
            >
              {sym}
            </div>
            <Corner rank={rank} sym={sym} color={suitColor} S={S} bottom />
          </div>
        </div>
      </div>
    </div>
  );
}

function Corner({
  rank,
  sym,
  color,
  S,
  bottom,
}: {
  rank: string;
  sym: string;
  color: string;
  S: (typeof SIZES)[Card3DSize];
  bottom?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        ...(bottom ? { bottom: S.pad, right: S.padX } : { top: S.pad, left: S.padX }),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 0.82,
        color,
        transform: bottom ? "rotate(180deg)" : undefined,
      }}
    >
      <span style={{ fontSize: S.rank, fontWeight: 700, letterSpacing: "-0.03em" }}>
        {rank}
      </span>
      <span style={{ fontSize: S.corner, lineHeight: 1 }}>{sym}</span>
    </div>
  );
}
