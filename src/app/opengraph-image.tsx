import { ImageResponse } from "next/og";

// Social share card (Open Graph + Twitter). Next auto-wires this file as the
// og:image / twitter:image for the site.
//
// Satori (the @vercel/og engine) is picky: flexbox only, inline styles, and
// only simple gradients — radial-gradient with an explicit "<size> at <pos>"
// is NOT supported and breaks the build, so we use a linear-gradient backdrop.
// `force-dynamic` also keeps this off the static-prerender path entirely, so a
// render hiccup can never fail `next build`; it renders on request instead.
export const dynamic = "force-dynamic";
export const alt = "Fullhouse Poker — private real-money poker on Solana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load a real TTF for the brand display font (on-brand + dodges @vercel/og's
// default-font path issues). Requesting the Google Fonts CSS without a modern
// UA returns TTF URLs that Satori can use.
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`)
    ).text();
    const url = css.match(/src: url\((https:\/\/[^)]+\.ttf)\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [bold, medium] = await Promise.all([loadFont(700), loadFont(500)]);
  const fonts = [
    bold && { name: "Space Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
    medium && { name: "Space Grotesk", data: medium, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 700 | 500; style: "normal" }[];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 100px",
          fontFamily: "Space Grotesk, sans-serif",
          background: "linear-gradient(135deg, #1a0f3a 0%, #0d0420 52%, #0a0318 100%)",
        }}
      >
        {/* eyebrow */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", width: 46, height: 3, background: "#ffd24a", marginRight: 18 }} />
          <div style={{ display: "flex", color: "#14d2c8", fontSize: 26, fontWeight: 700, letterSpacing: 8 }}>
            PRIVATE CARDROOM · SOLANA
          </div>
        </div>

        {/* wordmark */}
        <div style={{ display: "flex", marginTop: 16, fontSize: 158, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>
          <div style={{ display: "flex", color: "#f4eef7" }}>Full</div>
          <div style={{ display: "flex", color: "#3b82f6" }}>house</div>
        </div>

        {/* tagline */}
        <div style={{ display: "flex", marginTop: 30, fontSize: 48, fontWeight: 500, color: "#bcaeda" }}>
          Real money. Real nerve. After dark.
        </div>

        {/* footer row: FH chip + line */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 62 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 30,
              border: "2px solid rgba(255,210,74,0.6)",
              background: "#160a2e",
              color: "#ffd24a",
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: -1,
              marginRight: 20,
            }}
          >
            FH
          </div>
          <div style={{ display: "flex", color: "#d4c9ec", fontSize: 30, fontWeight: 500 }}>
            Real-money Texas Hold’em · instant crypto settlement
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
