"use client";

/**
 * AmbientBackground — sleek, restrained mood layer (Fullhouse neon reskin).
 *
 * Reinterpreted from the old domain-warped FBM cloud into a slow "card-suit
 * rain": columns of ♠ ♥ ♦ ♣ glyphs drift downward like neon code-rain, each
 * stream tinted magenta, teal or amber with an ivory leading glyph. A residual
 * FBM field still breathes through it as a brightness wave (the heritage of the
 * old shader), and the same radial center-mask keeps the rain in the OUTSKIRTS
 * so content stays clean, with a soft additive bloom for the neon glow. Quiet by
 * design — an accent, not a centerpiece.
 *
 * Client-only (mounts after hydration): there is no reason to server-render an
 * animated canvas, and doing so was breaking static prerender. Honors
 * prefers-reduced-motion, throttles, pauses when hidden, pointer-events: none.
 */

import { useEffect, useRef, useState } from "react";

// Suit-heavy glyph set (suits weighted by repetition) with a few rank letters.
const GLYPHS = ["♠", "♥", "♦", "♣", "♠", "♥", "♦", "♣", "A", "K", "Q", "J", "T"];
const CELL = 16; // glyph cell — a touch larger so the suits read cleanly
const FPS = 30;
const NS = 0.07; // noise scale for the residual FBM brightness wave

// Stream tints: magenta, teal, amber. Leading glyph is ivory.
const TINTS: ReadonlyArray<readonly [number, number, number]> = [
  [59, 130, 246],
  [20, 210, 200],
  [255, 210, 74],
];
const IVORY: readonly [number, number, number] = [244, 238, 247];

function hash2(ix: number, iy: number): number {
  const s = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function fbm(x: number, y: number): number {
  let f = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 3; i++) {
    f += amp * valueNoise(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return f / 0.875;
}

export function AmbientBackground({ intensity = 1 }: { intensity?: number }) {
  // Client-only: there's no reason to SSR an animated canvas, so mount it after
  // hydration. Renders on every screen size (including mobile) — the radial
  // center-fade keeps content clean while the rain lives in the outskirts.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <AmbientCanvas intensity={intensity} />;
}

interface Column {
  head: number; // leading-glyph row (float)
  speed: number; // rows advanced per frame
  trail: number; // glyph count behind the head
  tint: readonly [number, number, number];
  seed: number; // per-column glyph offset so each stream differs
}

function AmbientCanvas({ intensity }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const glyph = document.createElement("canvas");
    const gctx = glyph.getContext("2d");
    if (!gctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let columns: Column[] = [];

    /** A fresh column, optionally starting above the top so it falls in. */
    const makeColumn = (stagger: boolean): Column => {
      const r = Math.random();
      const tint = TINTS[r < 0.45 ? 0 : r < 0.85 ? 1 : 2]!;
      return {
        head: stagger ? -Math.floor(Math.random() * rows) : -Math.floor(Math.random() * 8) - 1,
        speed: 0.16 + Math.random() * 0.5,
        trail: 7 + Math.floor(Math.random() * 12),
        tint,
        seed: Math.floor(Math.random() * 9973),
      };
    };

    const resize = () => {
      const nextW = window.innerWidth || document.documentElement.clientWidth || 0;
      const nextH = window.innerHeight || document.documentElement.clientHeight || 0;
      if (nextW === 0 || nextH === 0) return;
      const changed = nextW !== w || nextH !== h;
      w = nextW;
      h = nextH;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      glyph.width = w;
      glyph.height = h;
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      if (changed || columns.length !== cols) seedColumns();
    };

    const seedColumns = () => {
      columns = Array.from({ length: cols }, () => makeColumn(true));
    };

    resize();
    seedColumns();
    requestAnimationFrame(() => resize());
    const kick = setTimeout(() => resize(), 120);

    /** Stable glyph for a cell — a column shows a consistent falling stream. */
    const glyphFor = (col: Column, row: number): string => {
      const i = Math.floor(hash2(col.seed + row, col.seed) * GLYPHS.length);
      return GLYPHS[i] ?? "♠";
    };

    gctx.textBaseline = "top";

    const drawFrame = (t: number) => {
      gctx.clearRect(0, 0, w, h);
      gctx.font = `${CELL}px ui-monospace, "Cascadia Code", "Courier New", monospace`;
      const baseAlpha = 0.95 * intensity;
      const ccx = cols / 2;
      const ccy = rows / 2;
      const maxD = Math.hypot(ccx, ccy);

      for (let c = 0; c < cols; c++) {
        const col = columns[c];
        if (!col) continue;
        const headRow = col.head;
        for (let k = 0; k < col.trail; k++) {
          const row = Math.floor(headRow) - k;
          if (row < 0 || row >= rows) continue;

          // Center-fade: clean in the very center, fullest toward the edges.
          const dist = Math.hypot(c - ccx, row - ccy) / maxD;
          const edge = smoothstep(0.12, 0.86, dist);
          if (edge <= 0.02) continue;

          // Residual FBM field, now a slow brightness wave rolling through the rain.
          const wave = 0.62 + 0.38 * fbm(c * NS + t * 0.12, row * NS - t * 0.04);
          const trailFade = k === 0 ? 1 : Math.max(0, 1 - k / col.trail);
          const a = baseAlpha * edge * wave * (0.22 + 0.78 * trailFade);
          if (a <= 0.015) continue;

          // Leading glyph burns ivory; the tail glows in the column's tint.
          let r: number, g: number, b: number, alpha: number;
          if (k === 0) {
            [r, g, b] = IVORY;
            alpha = Math.min(1, a * 1.7);
          } else if (k === 1) {
            // blend tint toward ivory for a hot second glyph
            r = (col.tint[0] + IVORY[0]) / 2;
            g = (col.tint[1] + IVORY[1]) / 2;
            b = (col.tint[2] + IVORY[2]) / 2;
            alpha = Math.min(1, a * 1.2);
          } else {
            [r, g, b] = col.tint;
            alpha = a;
          }
          gctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`;
          gctx.fillText(glyphFor(col, row), c * CELL, row * CELL);
        }

        // Advance; respawn once the whole trail has cleared the bottom.
        col.head += col.speed;
        if (Math.floor(col.head) - col.trail > rows) {
          columns[c] = makeColumn(false);
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.drawImage(glyph, 0, 0);
      // Additive neon bloom — multi-radius "lighter" passes for the glow halo.
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.8 * intensity;
      ctx.filter = "blur(5px)";
      ctx.drawImage(glyph, 0, 0);
      ctx.globalAlpha = 0.6 * intensity;
      ctx.filter = "blur(14px)";
      ctx.drawImage(glyph, 0, 0);
      ctx.globalAlpha = 0.42 * intensity;
      ctx.filter = "blur(30px)";
      ctx.drawImage(glyph, 0, 0);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let lastT = 0;
    let t = 0;
    const interval = 1000 / FPS;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastT < interval) return;
      lastT = now;
      t += 0.045;
      drawFrame(t);
    };

    if (reduce) drawFrame(8);
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      if (reduce) drawFrame(8);
    };
    const ro = new ResizeObserver(() => {
      const had = w;
      resize();
      if (reduce && (had === 0 || w !== had)) drawFrame(8);
    });
    ro.observe(canvas.parentElement ?? canvas);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) {
        lastT = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(kick);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intensity]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
          opacity: 0.45,
        }}
      />
      <div className="absolute inset-0 crt-flicker" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 40%, transparent 58%, rgba(6,7,9,0.5) 100%)",
        }}
      />
    </div>
  );
}
