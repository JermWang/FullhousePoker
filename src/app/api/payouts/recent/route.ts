import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatAmount, ASSET_SYMBOLS } from "@/lib/ledger/money";
import { solscanTxUrl } from "@/lib/solana/explorer";

// Live DB-backed feed — must run per request, never prerendered at build (the
// build env has no DATABASE_URL, and the data must be fresh anyway).
export const dynamic = "force-dynamic";

/**
 * Public, read-only feed of REAL on-chain payouts for the splash-page ticker —
 * only SENT withdrawals (actual transfers that landed), never requested/failed
 * ones, and NO user identity (just amount, asset, time, and the public Solscan
 * link). Edge-cached so a high-traffic splash doesn't hammer the DB.
 */
export async function GET() {
  try {
    const rows = await prisma.withdrawal.findMany({
      where: { status: "SENT" },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { asset: true, amount: true, txSignature: true, updatedAt: true },
    });
    const payouts = rows.map((r) => ({
      amount: formatAmount(r.asset, r.amount),
      sym: ASSET_SYMBOLS[r.asset],
      at: r.updatedAt.toISOString(),
      url: r.txSignature ? solscanTxUrl(r.txSignature) : null,
    }));
    return NextResponse.json(
      { payouts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
        },
      },
    );
  } catch {
    return NextResponse.json({ payouts: [] });
  }
}
