/**
 * Withdrawal fee policy.
 *
 * Every withdrawal pays a flat `WITHDRAWAL_FEE_BPS` fee (default 1%) UNLESS the
 * user holds the house token ($FULLHOUSE) on-chain. The waiver is checked
 * against the user's own Solana wallets (the ones they sign in / play with — not
 * the custodial deposit address). The fee is computed in the withdrawn asset's
 * base units and is realized at SEND time, so rejected/failed withdrawals always
 * refund in full. See `sendApprovedWithdrawal` / `settleWithdrawalSent`.
 */

import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { prisma } from "@/lib/db/prisma";
import { env, isTokenConfigured } from "@/lib/env";
import { getConnection } from "./connection";

export interface WithdrawalFeeQuote {
  /** Fee taken from the withdrawal, in the asset's base units. */
  fee: bigint;
  /** What the user actually receives on-chain (gross amount − fee). */
  net: bigint;
  /** True when no fee applies (a $FULLHOUSE holder, or fees disabled). */
  exempt: boolean;
  /** The rate that was applied (0 when exempt). */
  bps: bigint;
}

/**
 * Whether the user holds enough $FULLHOUSE on-chain to waive the withdrawal fee.
 * Returns false (no waiver) when the token mint isn't configured yet, or if the
 * balance can't be confirmed — fee-on is the safe default. Checks the user's
 * own wallets (EMBEDDED / EXTERNAL); custodial DEPOSIT/HOT/TREASURY wallets are
 * excluded.
 */
export async function userHoldsHouseToken(userId: string): Promise<boolean> {
  if (!isTokenConfigured()) return false;

  const min =
    env.withdrawalFeeExemptMinToken > 0n ? env.withdrawalFeeExemptMinToken : 1n;
  const wallets = await prisma.wallet.findMany({
    where: { userId, chain: "SOLANA", type: { in: ["EMBEDDED", "EXTERNAL"] } },
    select: { address: true },
  });
  if (wallets.length === 0) return false;

  let mint: PublicKey;
  try {
    mint = new PublicKey(env.tokenMint);
  } catch {
    return false;
  }
  const connection = getConnection();

  for (const w of wallets) {
    try {
      const ata = await getAssociatedTokenAddress(mint, new PublicKey(w.address));
      const bal = await connection.getTokenAccountBalance(ata);
      if (BigInt(bal.value.amount) >= min) return true;
    } catch {
      // No associated token account, bad address, or an RPC hiccup for this
      // wallet → treat as non-holding and check the rest.
    }
  }
  return false;
}

/**
 * Compute the fee for a withdrawal. Performs an on-chain holder check, so call
 * this OUTSIDE any DB transaction (it does network I/O). Floor division means
 * dust amounts round the fee down to zero.
 */
export async function quoteWithdrawalFee(params: {
  userId: string;
  amount: bigint;
}): Promise<WithdrawalFeeQuote> {
  const bps = env.withdrawalFeeBps;
  if (bps <= 0n || params.amount <= 0n) {
    return { fee: 0n, net: params.amount, exempt: true, bps: 0n };
  }

  const exempt = await userHoldsHouseToken(params.userId);
  const fee = exempt ? 0n : (params.amount * bps) / 10_000n;
  return { fee, net: params.amount - fee, exempt, bps: exempt ? 0n : bps };
}
