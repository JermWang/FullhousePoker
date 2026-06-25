import { NextResponse } from "next/server";
import { VersionedTransaction } from "@solana/web3.js";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getConnection } from "@/lib/solana/connection";
import { tooMany } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Pre-flight simulation for the at-table deposit, BEFORE we ask the wallet to
 * sign. Phantom hard-blocks ("this dApp could be malicious") any request it
 * can't simulate cleanly — most often because the transaction would simply
 * FAIL on-chain (e.g. the wallet can't cover the amount + network fee). Per
 * Phantom's guidance we simulate with `sigVerify:false` and
 * `replaceRecentBlockhash:true` (so a stale/unpropagated blockhash is never the
 * failure point) and only let the wallet see transactions that will succeed.
 *
 * Body: { tx: number[] }  // the unsigned v0 VersionedTransaction bytes
 * Returns: { ok: true } or { ok: false, err, logs }
 */
export async function POST(req: Request) {
  const limited = tooMany(req, "deposit-sim", { capacity: 30, refillPerSec: 1 });
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { tx?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.tx) || body.tx.length === 0) {
    return NextResponse.json({ error: "Missing tx" }, { status: 400 });
  }

  try {
    const vtx = VersionedTransaction.deserialize(Uint8Array.from(body.tx));
    const sim = await getConnection().simulateTransaction(vtx, {
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "processed",
    });
    if (sim.value.err) {
      return NextResponse.json({
        ok: false,
        err: JSON.stringify(sim.value.err),
        logs: sim.value.logs ?? [],
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    // RPC/parse hiccup — don't block the deposit on our own infra; let the
    // wallet be the final arbiter. Surface a soft signal.
    return NextResponse.json({
      ok: true,
      warning: e instanceof Error ? e.message : "simulate unavailable",
    });
  }
}
