import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { theme } from "./site-theme";

const { fontFamily } = loadFont();
const C = theme.colors;
const FONT = `${fontFamily}, system-ui, sans-serif`;

// ---- video constants -------------------------------------------------------
export const PROMO_FPS = 30;
export const PROMO_W = 1920;
export const PROMO_H = 1080;

const T = 14; // transition length
const D_OPEN = 78;
const D_WORD = 90;
const D_FEAT = 66; // ×5
const D_CTA = 104;
// 8 sequences, 7 overlapping transitions.
export const PROMO_DURATION =
  D_OPEN + D_WORD + D_FEAT * 5 + D_CTA - 7 * T;

// ---- helpers ---------------------------------------------------------------
const SUITS = ["♠", "♥", "♦", "♣"] as const;

function ease(frame: number, a: number, b: number, from: number, to: number) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
}

/** Drifting plum field with cobalt + teal neon auras — the brand backdrop. */
const NeonBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const ax = Math.sin(f / 90) * 60;
  const ay = Math.cos(f / 110) * 50;
  return (
    <AbsoluteFill style={{ background: C.charcoal900, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 900px at ${78 + ax / 30}% ${-8 + ay / 30}%, rgba(59,130,246,0.30), transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 900px at ${-8 - ax / 30}% ${110 - ay / 30}%, rgba(20,210,200,0.22), transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(140% 120% at 50% 45%, transparent 55%, rgba(5,2,14,0.7) 100%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/** The neon FH chip. */
const Chip: React.FC<{ size: number; glow?: number }> = ({ size, glow = 1 }) => {
  const ring = `conic-gradient(from 0deg, ${C.velvet} 0deg 60deg, ${C.feltLight} 60deg 120deg, ${C.velvet} 120deg 180deg, ${C.feltLight} 180deg 240deg, ${C.velvet} 240deg 300deg, ${C.feltLight} 300deg 360deg)`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        position: "relative",
        background: ring,
        boxShadow: `0 0 ${60 * glow}px ${18 * glow}px rgba(59,130,246,${0.45 * glow}), 0 30px 60px -20px rgba(0,0,0,0.8)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: size * 0.11,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 35%, ${C.charcoal700}, ${C.charcoal900})`,
          boxShadow: `inset 0 0 0 ${size * 0.02}px rgba(255,210,74,0.5), inset 0 0 ${size * 0.18}px rgba(0,0,0,0.7)`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: size * 0.34,
            letterSpacing: "-0.05em",
            background: "linear-gradient(180deg,#ffe7a8,#ffd24a 55%,#e8951f)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          FH
        </span>
      </div>
    </div>
  );
};

/** A cool-white playing card with a neon back when face-down. */
const Card: React.FC<{
  rank: string;
  suit: string;
  w: number;
  rot?: number;
  x?: number;
  y?: number;
}> = ({ rank, suit, w, rot = 0, x = 0, y = 0 }) => {
  const h = w * 1.4;
  const red = suit === "♥" || suit === "♦";
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        left: "50%",
        top: "50%",
        marginLeft: -w / 2,
        marginTop: -h / 2,
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
        borderRadius: w * 0.12,
        background: "radial-gradient(125% 120% at 50% -8%, #f8f5fc, #efe9f7 70%, #e3dcf0)",
        boxShadow: "0 30px 50px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.8)",
        color: red ? "#d81f6a" : "#221539",
        fontFamily: FONT,
      }}
    >
      <div style={{ position: "absolute", top: w * 0.1, left: w * 0.12, lineHeight: 0.9, textAlign: "center" }}>
        <div style={{ fontSize: w * 0.3, fontWeight: 700 }}>{rank}</div>
        <div style={{ fontSize: w * 0.24 }}>{suit}</div>
      </div>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: w * 0.62 }}>{suit}</div>
    </div>
  );
};

const Glow: React.FC<{ children: React.ReactNode; color: string; blur?: number }> = ({
  children,
  color,
  blur = 24,
}) => <span style={{ textShadow: `0 0 ${blur}px ${color}` }}>{children}</span>;

// ---- scenes ----------------------------------------------------------------

const SceneOpen: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 12, mass: 0.8 } });
  const chipScale = interpolate(pop, [0, 1], [0.2, 1]);
  const chipRot = interpolate(pop, [0, 1], [-40, 0]);
  const burst = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const burstFade = interpolate(f, [10, 40], [0.55, 0], { extrapolateRight: "clamp" });
  const labelUp = ease(f, 26, 50, 30, 0);
  const labelOp = ease(f, 26, 46, 0, 1);
  return (
    <NeonBg>
      {/* radial burst behind the chip */}
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            width: 1200 * burst,
            height: 1200 * burst,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(96,165,250,0.5), transparent 60%)",
            opacity: burstFade,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div style={{ transform: `scale(${chipScale}) rotate(${chipRot}deg)` }}>
          <Chip size={300} glow={1.2} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ display: "grid", placeItems: "end center", paddingBottom: 150 }}>
        <div
          style={{
            transform: `translateY(${labelUp}px)`,
            opacity: labelOp,
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: C.feltLight,
          }}
        >
          Private cardroom · Solana
        </div>
      </AbsoluteFill>
    </NeonBg>
  );
};

const SceneWordmark: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // card fan sweeps in
  const fan = spring({ frame: f, fps, config: { damping: 18 } });
  const cards = ["10", "J", "Q", "K", "A"];
  // wordmark letters rise
  const wm = spring({ frame: f - 14, fps, config: { damping: 16 } });
  const wmUp = interpolate(wm, [0, 1], [70, 0]);
  const tag = ease(f, 40, 64, 0, 1);
  const tagUp = ease(f, 40, 64, 24, 0);
  return (
    <NeonBg>
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", width: 900, height: 300, transform: "translateY(-150px)" }}>
          {cards.map((r, i) => {
            const spread = (i - 2) * fan;
            return (
              <Card
                key={r}
                rank={r}
                suit="♠"
                w={150}
                rot={spread * 9}
                x={spread * 110}
                y={Math.abs(i - 2) * 14 * fan}
              />
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", transform: `translateY(${130 + wmUp}px)`, opacity: interpolate(wm, [0, 1], [0, 1]) }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 168, letterSpacing: "-0.04em", lineHeight: 1 }}>
            <span style={{ color: C.ivory }}>Full</span>
            <Glow color="rgba(59,130,246,0.6)" blur={40}>
              <span style={{ color: C.velvet }}>house</span>
            </Glow>
          </div>
          <div
            style={{
              marginTop: 22,
              opacity: tag,
              transform: `translateY(${tagUp}px)`,
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 40,
              color: C.ivoryMuted,
            }}
          >
            Real money. Real nerve. After dark.
          </div>
        </div>
      </AbsoluteFill>
    </NeonBg>
  );
};

const FeatureScene: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  sub: string;
  accent: string;
}> = ({ icon, title, sub, accent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 16, mass: 0.7 } });
  const iconScale = interpolate(s, [0, 1], [0.4, 1]);
  const iconOp = interpolate(s, [0, 1], [0, 1]);
  const titleUp = ease(f, 8, 30, 50, 0);
  const titleOp = ease(f, 8, 26, 0, 1);
  const subOp = ease(f, 20, 38, 0, 1);
  const line = ease(f, 22, 46, 0, 1);
  return (
    <NeonBg>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        <div style={{ transform: `scale(${iconScale})`, opacity: iconOp, filter: `drop-shadow(0 0 40px ${accent})` }}>
          {icon}
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 92,
              letterSpacing: "-0.03em",
              color: C.ivory,
              transform: `translateY(${titleUp}px)`,
              opacity: titleOp,
              lineHeight: 1.02,
            }}
          >
            {title}
          </div>
          <div
            style={{
              margin: "26px auto 0",
              height: 4,
              width: 220 * line,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
            }}
          />
          <div
            style={{
              marginTop: 22,
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 38,
              color: C.ash,
              opacity: subOp,
            }}
          >
            {sub}
          </div>
        </div>
      </AbsoluteFill>
    </NeonBg>
  );
};

// ---- feature icons (CSS/SVG, neon line-art) --------------------------------
const IconCards = () => (
  <div style={{ position: "relative", width: 260, height: 200 }}>
    {["♦", "♠", "♥"].map((s, i) => (
      <Card key={s} rank={["A", "K", "Q"][i]!} suit={s} w={120} rot={(i - 1) * 14} x={(i - 1) * 70} />
    ))}
  </div>
);

const Ring = ({ children, accent }: { children: React.ReactNode; accent: string }) => (
  <div
    style={{
      width: 220,
      height: 220,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      border: `3px solid ${accent}`,
      background: "rgba(255,255,255,0.03)",
      boxShadow: `inset 0 0 50px ${accent}55`,
    }}
  >
    {children}
  </div>
);

const Bolt = () => (
  <Ring accent={C.amber}>
    <svg width="110" height="110" viewBox="0 0 24 24" fill={C.amber}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  </Ring>
);
const Lock = () => (
  <Ring accent={C.feltLight}>
    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke={C.feltLight} strokeWidth="2">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="m9.5 15.5 1.8 1.8 3.2-3.4" stroke={C.ivory} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </Ring>
);
const Mic = () => {
  const f = useCurrentFrame();
  return (
    <Ring accent={C.velvet}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="70" height="100" viewBox="0 0 24 24" fill="none" stroke={C.velvetSoft} strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" fill={C.velvetSoft} stroke="none" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 90 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                borderRadius: 99,
                background: C.feltLight,
                height: 24 + Math.abs(Math.sin((f + i * 7) / 6)) * 56,
              }}
            />
          ))}
        </div>
      </div>
    </Ring>
  );
};
const Bot = () => (
  <Ring accent={C.velvetSoft}>
    <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke={C.velvetSoft} strokeWidth="1.8">
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <circle cx="9" cy="14" r="1.6" fill={C.feltLight} stroke="none" />
      <circle cx="15" cy="14" r="1.6" fill={C.feltLight} stroke="none" />
      <path d="M12 4v4M9 20v2M15 20v2" />
      <circle cx="12" cy="3" r="1.4" fill={C.amber} stroke="none" />
    </svg>
  </Ring>
);

const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14 } });
  const chip = interpolate(s, [0, 1], [0.4, 1]);
  const pulse = 1 + Math.sin(f / 7) * 0.02;
  const urlOp = ease(f, 24, 44, 0, 1);
  const ctaOp = ease(f, 36, 56, 0, 1);
  const ctaUp = ease(f, 36, 56, 22, 0);
  return (
    <NeonBg>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={{ transform: `scale(${chip * pulse})` }}>
          <Chip size={180} glow={1.3} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 120, letterSpacing: "-0.04em", opacity: interpolate(s, [0, 1], [0, 1]) }}>
          <span style={{ color: C.ivory }}>Full</span>
          <Glow color="rgba(59,130,246,0.6)" blur={36}>
            <span style={{ color: C.velvet }}>house</span>
          </Glow>
        </div>
        <div
          style={{
            opacity: urlOp,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 46,
            color: C.feltLight,
            letterSpacing: "0.02em",
          }}
        >
          fullhousepoker.fun
        </div>
        <div
          style={{
            marginTop: 8,
            opacity: ctaOp,
            transform: `translateY(${ctaUp}px)`,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 30,
            color: "#fff",
            background: `linear-gradient(180deg, ${C.velvetSoft}, ${C.velvetDim})`,
            padding: "16px 40px",
            borderRadius: 16,
            boxShadow: `0 14px 40px -12px ${C.velvet}`,
          }}
        >
          Take your seat
        </div>
      </AbsoluteFill>
    </NeonBg>
  );
};

// ---- composition -----------------------------------------------------------
const tSpring = springTiming({ config: { damping: 200 }, durationInFrames: T });
const tLinear = linearTiming({ durationInFrames: T });

export const FullhousePromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal900 }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_OPEN}>
          <SceneOpen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={tSpring} />

        <TransitionSeries.Sequence durationInFrames={D_WORD}>
          <SceneWordmark />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={tSpring} />

        <TransitionSeries.Sequence durationInFrames={D_FEAT}>
          <FeatureScene icon={<IconCards />} title="Private tables on Solana" sub="Spin up an invite-only room in seconds." accent={C.velvet} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={tLinear} />

        <TransitionSeries.Sequence durationInFrames={D_FEAT}>
          <FeatureScene icon={<Bolt />} title="Instant crypto settlement" sub="Deposit and cash out in seconds." accent={C.amber} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={tSpring} />

        <TransitionSeries.Sequence durationInFrames={D_FEAT}>
          <FeatureScene icon={<Lock />} title="Every hand provably fair" sub="Commit-reveal proof on every deal." accent={C.feltLight} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip()} timing={tSpring} />

        <TransitionSeries.Sequence durationInFrames={D_FEAT}>
          <FeatureScene icon={<Mic />} title="Live voice at the table" sub="Talk, read, and bluff in real time." accent={C.velvet} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={tLinear} />

        <TransitionSeries.Sequence durationInFrames={D_FEAT}>
          <FeatureScene icon={<Bot />} title="Warm up free vs AI" sub="Jump into a free seat — no wallet needed." accent={C.velvetSoft} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={tSpring} />

        <TransitionSeries.Sequence durationInFrames={D_CTA}>
          <SceneCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
