import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardFan } from "@/components/marketing/card-fan";
import { PayoutTicker } from "@/components/marketing/payout-ticker";

export default function StartScreen() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-between overflow-x-clip px-6 py-8">
      {/* Landing bloom — a soft warm glow that lifts the centerpiece a touch
          brighter than the global ambient. Landing-only, sits behind content. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[42%] h-[88vh] w-[88vh] max-w-[1040px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(236,238,241,0.12), rgba(236,238,241,0.045) 46%, transparent 72%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute left-1/2 top-[40%] h-[44vh] w-[44vh] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(59,130,246,0.12), transparent 70%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* Live payouts ticker — real SENT withdrawals only (social proof). */}
      <PayoutTicker />

      {/* Centerpiece */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-fade-up">
          <CardFan />
        </div>

        <p
          className="mt-2 text-eyebrow animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Private cardroom · Solana
        </p>

        <h1
          className="mt-3 font-display text-6xl leading-none tracking-tight text-ivory md:text-8xl animate-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          Full<span className="text-velvet drop-shadow-[0_0_24px_rgba(59,130,246,0.55)]">house</span>
        </h1>

        <p
          className="mt-5 max-w-md text-lg leading-relaxed text-ash animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          Real money. Real nerve. After dark.
        </p>

        <div
          className="mt-9 flex flex-col items-center gap-3 animate-fade-up sm:flex-row"
          style={{ animationDelay: "300ms" }}
        >
          <Link href="/app/lobby">
            <Button size="lg" className="min-w-[15rem] tracking-wide">
              Enter Lobby
            </Button>
          </Link>
          <Link href="/app/host">
            <Button size="lg" variant="ghost" className="tracking-wide">
              Host a private table
            </Button>
          </Link>
        </div>

      </main>

      {/* Footer — trust badges, legal links + socials, and the 18+ line grouped
          as ONE block so the three rows share one even vertical gap (the badges
          used to live in the hero, which made the middle row's spacing uneven). */}
      <footer className="relative z-10 mt-12 flex w-full max-w-6xl flex-col items-center gap-2 pb-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] uppercase tracking-[0.22em] text-ash/60">
          <span>Verified RNG</span>
          <span className="text-velvet/40">◆</span>
          <span>Instant settlement</span>
          <span className="text-velvet/40">◆</span>
          <span>Invite-only tables</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ash/70">
          <Link href="/legal/rules" className="hover:text-ivory">Game rules</Link>
          <Link href="/legal/responsible-gaming" className="hover:text-ivory">Responsible play</Link>
          <Link href="/legal/terms" className="hover:text-ivory">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-ivory">Privacy</Link>
          <span aria-hidden className="hidden h-3.5 w-px bg-white/15 sm:inline-block" />
          <a
            href="https://x.com/velvetpokerfun"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fullhouse Poker on X"
            className="text-ash/70 transition-colors hover:text-ivory"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
        <p className="text-[11px] text-ash/40">
          18+ where permitted. Real-money play subject to geographic eligibility.
        </p>
      </footer>
    </div>
  );
}
