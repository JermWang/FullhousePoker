import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { TableCard, type TableCardData } from "@/components/lobby/table-card";
import { JoinPrivate } from "@/components/lobby/join-private";
import { Button } from "@/components/ui/button";
import { getAssetPrices } from "@/lib/pricing/prices";
import { env } from "@/lib/env";
import { ContractAddressChip } from "@/components/app-shell/contract-address";

// Public cash games are wagered in the house token; show it on the card pill.
// Falls back to the brand ticker until NEXT_PUBLIC_TOKEN_SYMBOL is configured.
const TOKEN_TAG =
  env.tokenSymbol && env.tokenSymbol !== "TOKEN" ? env.tokenSymbol : "FULLHOUSE";

export const dynamic = "force-dynamic";

// Public — no wallet required to browse the lobby or open a table to spectate.
export default async function LobbyPage() {
  const [tables, prices] = await Promise.all([
    prisma.pokerTable.findMany({
      where: { visibility: "PUBLIC", status: { in: ["WAITING", "ACTIVE"] } },
      // Free-play demo first, then cash games ordered low → high (by stakes).
      orderBy: [{ isDemo: "desc" }, { bigBlind: "asc" }, { smallBlind: "asc" }],
      include: { seats: { where: { status: { not: "EMPTY" } } } },
    }),
    getAssetPrices(),
  ]);

  const data: TableCardData[] = tables.map((t) => ({
    id: t.id,
    name: t.name,
    asset: t.asset,
    smallBlind: t.smallBlind,
    bigBlind: t.bigBlind,
    minBuyIn: t.minBuyIn,
    maxBuyIn: t.maxBuyIn,
    maxSeats: t.maxSeats,
    seatsOccupied: t.seats.length,
    visibility: t.visibility,
    status: t.status,
    isDemo: t.isDemo,
  }));

  // Games actually being played (a hand in progress), vs tables merely open.
  const inPlay = data.filter((t) => t.status === "ACTIVE").length;
  const seatsTaken = data.reduce((n, t) => n + t.seatsOccupied, 0);

  // Public cash games are temporarily paused while $FULLHOUSE is still bonding
  // (unbonded tokens can have unreliable on-chain txs). Tables stay browsable
  // and spectatable; buy-ins are locked. Free play is unaffected.
  const paused = env.publicPlayPaused;
  // Soft caution shown at the very top while play is OPEN but the token is still
  // bonding — a heads-up, not a lock.
  const warn = env.publicPlayWarning && !paused;

  return (
    <div className="space-y-6 py-2">
      {/* Token contract address — click-to-copy, prominent at the very top. */}
      <ContractAddressChip />

      {/* Heads-up — public play is open, but the token is still bonding so
          on-chain txs can occasionally hiccup. */}
      {warn && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-4 sm:p-5">
          <span aria-hidden className="mt-0.5 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Heads up — ${TOKEN_TAG} is still bonding
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ash">
              Public tables are open and ready to play. While the token is still
              bonding on its launch market, on-chain transactions — buy-ins,
              deposits, and payouts — can occasionally be delayed or fail. If one
              doesn&apos;t go through, your funds are safe and it&apos;ll settle once
              the token bonds. Please play at your own discretion until the price
              stabilizes.
            </p>
          </div>
        </div>
      )}

      {/* Hero — title on the left, live snapshot tiles on the right. */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-eyebrow">Open to all</p>
          <h1 className="mt-1.5 font-display text-3xl text-ivory sm:text-4xl">
            Public lobby
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ash">
            Jump into any open table, or spin up your own private game. Public
            cash games are wagered in{" "}
            <span className="font-semibold text-velvet">${TOKEN_TAG}</span>.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <StatTile label="Open" value={data.length} />
          <StatTile label="In play" value={inPlay} accent={inPlay > 0} />
          <StatTile label="Seated" value={seatsTaken} />
        </div>
      </header>

      {/* Temporary notice — public cash games paused while the token bonds. */}
      {paused && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-4 sm:p-5">
          <span aria-hidden className="mt-0.5 text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Public cash games are paused
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ash">
              <span className="font-semibold text-velvet">${TOKEN_TAG}</span> is
              still bonding on its launch market. Until a token bonds, on-chain
              transfers can be intermittent — so we&apos;ve temporarily paused
              public buy-ins to keep every deposit and payout safe. You can still
              open and spectate any table. We&apos;ll reopen public tables once the
              coin has bonded and its price settles.
            </p>
            <p className="mt-2 text-sm font-medium text-emerald-200">
              Private tables (SOL &amp; USDC) and free play are open and live
              right now — host a game or join with an invite code.
            </p>
          </div>
        </div>
      )}

      {/* Body — tables grid as the main column, a sticky "private play" rail
          beside it on desktop. On mobile the rail drops to the top so the
          house specialty (private games) stays prominent, then the tables. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Public tables */}
        <section className="order-2 lg:order-1">
          {data.length === 0 ? (
            <div className="glass p-12 text-center">
              <p className="text-ash">No public tables are open right now.</p>
              <Link href="/app/host" className="mt-4 inline-block">
                <Button>Be the first to host</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {data.map((t) => (
                <TableCard
                  key={t.id}
                  table={t}
                  prices={prices}
                  tokenSymbol={TOKEN_TAG}
                  paused={paused && !t.isDemo}
                />
              ))}
            </div>
          )}
        </section>

        {/* Private-play rail — the house specialty. */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
          <div className="glass glass-velvet relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-velvet/10 blur-3xl" />
            <div className="relative">
              <p className="text-eyebrow">Invite-only</p>
              <h2 className="mt-2 font-display text-2xl leading-tight text-ivory">
                The best games are private
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                Host your own table in seconds, or drop in with an invite code.
              </p>
              <Link href="/app/host" className="mt-5 block">
                <Button size="lg" className="w-full tracking-wide">
                  Host a private table
                </Button>
              </Link>
              <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-ash/50">
                <span className="h-px flex-1 bg-white/10" />
                or join with a code
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <JoinPrivate />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Compact live-snapshot tile for the lobby hero. */
function StatTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-center sm:px-4">
      <p
        className={`font-display text-2xl leading-none ${
          accent ? "text-emerald-300" : "text-ivory"
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-ash/60">
        {label}
      </p>
    </div>
  );
}
