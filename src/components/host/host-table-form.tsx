"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectButton } from "@/components/auth/connect-button";
import { HelpHint } from "@/components/ui/tooltip";
import { authedFetch } from "@/lib/auth/privy-token";

// Tidy a shorthand decimal so the field shows a clean value
// (".3" -> "0.3", "3." -> "3"). The server accepts either form regardless.
function normalizeDecimal(s: string): string {
  let v = s.trim();
  if (!v) return v;
  if (v.startsWith(".")) v = `0${v}`;
  if (v.endsWith(".")) v = v.slice(0, -1);
  return v;
}

export function HostTableForm({
  authed,
  tokenConfigured,
  tokenSymbol,
  privateActive,
  privateMax,
  publicPaused = false,
}: {
  authed: boolean;
  tokenConfigured: boolean;
  tokenSymbol: string;
  privateActive: number;
  privateMax: number;
  /** Public cash games paused (token still bonding) — hosting defaults to (and
   *  is limited to) private games while the pause is on. */
  publicPaused?: boolean;
}) {
  const router = useRouter();
  const privateFull = privateActive >= privateMax;
  const privateLeft = Math.max(0, privateMax - privateActive);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Public hosting needs the token configured AND not paused. While public play
  // is paused, only private games (SOL/USDC) can be created.
  const publicAvailable = tokenConfigured && !publicPaused;
  const [visibility, setVisibility] = useState(
    publicAvailable ? "PUBLIC" : "PRIVATE",
  );
  // Public tables are token-only; private tables are SOL or USDC (SOL default).
  const [asset, setAsset] = useState(publicAvailable ? "TOKEN" : "SOL");

  // Controlled copies of the fields the live summary reflects. Inputs keep their
  // `name`, so submission still reads everything off the form via FormData.
  const [name, setName] = useState("");
  const [maxSeats, setMaxSeats] = useState("6");
  const [smallBlind, setSmallBlind] = useState("");
  const [bigBlind, setBigBlind] = useState("");
  const [minBuyIn, setMinBuyIn] = useState("");
  const [maxBuyIn, setMaxBuyIn] = useState("");
  const [actionTimeout, setActionTimeout] = useState("30");

  // Asset options allowed for the current visibility. Public = token only;
  // private = SOL or USDC (SOL first / default).
  const assetOptions =
    visibility === "PUBLIC"
      ? [{ value: "TOKEN", label: tokenSymbol }]
      : [
          { value: "SOL", label: "SOL" },
          { value: "USDC", label: "USDC" },
        ];

  function onVisibilityChange(next: string) {
    setVisibility(next);
    // Force a valid asset for the new visibility: public ⇒ token, private ⇒ SOL.
    setAsset(next === "PUBLIC" ? "TOKEN" : "SOL");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (visibility === "PRIVATE" && privateFull) {
      setError(
        `All private tables are full (${privateActive}/${privateMax}). Please wait for one to open up.`,
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      asset,
      maxSeats: Number(form.get("maxSeats")),
      smallBlind: String(form.get("smallBlind") ?? ""),
      bigBlind: String(form.get("bigBlind") ?? ""),
      minBuyIn: String(form.get("minBuyIn") ?? ""),
      maxBuyIn: String(form.get("maxBuyIn") ?? ""),
      visibility,
      password: String(form.get("password") ?? "") || undefined,
      actionTimeoutSeconds: Number(form.get("actionTimeoutSeconds") ?? 30),
      spectatorsAllowed: form.get("spectatorsAllowed") === "on",
    };

    let res: Response;
    try {
      res = await authedFetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setSubmitting(false);
      setError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    // Parse defensively: an error response can come back empty / non-JSON, which
    // must never leave the button stuck on "Creating…".
    const json = (await res.json().catch(() => null)) as
      | { id?: string; error?: string }
      | null;
    setSubmitting(false);
    if (!res.ok) {
      setError(json?.error ?? `Could not create the table (error ${res.status}).`);
      return;
    }
    if (!json?.id) {
      setError("Table created, but no id came back. Please refresh and check the lobby.");
      return;
    }
    router.push(`/app/tables/${json.id}`);
  }

  const assetLabel = asset === "TOKEN" ? tokenSymbol : asset;
  const seatsLabel =
    maxSeats === "2" ? "Heads-up" : `${maxSeats}-max`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      {/* The form — grouped into clear sections. Comes first on mobile so the
          first input is reachable without scrolling past the preview. */}
      <Card className="order-1">
        <CardContent className="py-6">
          <form onSubmit={onSubmit} className="space-y-7">
            {/* Game */}
            <FormSection title="Game" desc="Name your table and pick its size.">
              <div>
                <Label htmlFor="name">Table name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="The Penthouse"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="asset"
                    className="inline-flex items-center gap-1.5"
                  >
                    Asset
                    <HelpHint
                      label={`Private tables use SOL or USDC. Public tables use ${tokenSymbol} only.`}
                    />
                  </Label>
                  <Select
                    id="asset"
                    name="asset"
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    disabled={visibility === "PUBLIC"}
                  >
                    {assetOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                  {visibility === "PUBLIC" && (
                    <p className="mt-1 text-xs text-ash/70">
                      Public tables are {tokenSymbol}-only.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="maxSeats">Table size</Label>
                  <Select
                    id="maxSeats"
                    name="maxSeats"
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(e.target.value)}
                  >
                    <option value="2">Heads-up (2 max)</option>
                    <option value="6">6-max</option>
                    <option value="9">9-max</option>
                  </Select>
                </div>
              </div>
            </FormSection>

            {/* Stakes */}
            <FormSection
              title="Stakes"
              desc="Set the blinds, buy-in range, and time bank."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="smallBlind">Small blind</Label>
                  <Input
                    id="smallBlind"
                    name="smallBlind"
                    placeholder="0.01"
                    inputMode="decimal"
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(e.target.value)}
                    onBlur={(e) => setSmallBlind(normalizeDecimal(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bigBlind">Big blind</Label>
                  <Input
                    id="bigBlind"
                    name="bigBlind"
                    placeholder="0.02"
                    inputMode="decimal"
                    value={bigBlind}
                    onChange={(e) => setBigBlind(e.target.value)}
                    onBlur={(e) => setBigBlind(normalizeDecimal(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minBuyIn">Min buy-in</Label>
                  <Input
                    id="minBuyIn"
                    name="minBuyIn"
                    placeholder="1"
                    inputMode="decimal"
                    value={minBuyIn}
                    onChange={(e) => setMinBuyIn(e.target.value)}
                    onBlur={(e) => setMinBuyIn(normalizeDecimal(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxBuyIn">Max buy-in</Label>
                  <Input
                    id="maxBuyIn"
                    name="maxBuyIn"
                    placeholder="4"
                    inputMode="decimal"
                    value={maxBuyIn}
                    onChange={(e) => setMaxBuyIn(e.target.value)}
                    onBlur={(e) => setMaxBuyIn(normalizeDecimal(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="sm:max-w-[50%] sm:pr-2">
                <Label htmlFor="actionTimeoutSeconds">Action timer (seconds)</Label>
                <Input
                  id="actionTimeoutSeconds"
                  name="actionTimeoutSeconds"
                  type="number"
                  value={actionTimeout}
                  onChange={(e) => setActionTimeout(e.target.value)}
                  min={10}
                  max={120}
                />
              </div>
            </FormSection>

            {/* Access */}
            <FormSection
              title="Access"
              desc="Who can find and join the table."
            >
              <div>
                <Label
                  htmlFor="visibility"
                  className="inline-flex items-center gap-1.5"
                >
                  Visibility
                  <HelpHint label="Public tables are listed in the lobby for anyone to join. Private tables are reachable only by invite link or code." />
                </Label>
                <Select
                  id="visibility"
                  name="visibility"
                  value={visibility}
                  onChange={(e) => onVisibilityChange(e.target.value)}
                >
                  <option value="PUBLIC" disabled={!publicAvailable}>
                    Public — listed in the lobby
                    {!tokenConfigured
                      ? " (token not set)"
                      : publicPaused
                        ? " (paused)"
                        : ""}
                  </option>
                  <option value="PRIVATE">Private — invite only</option>
                </Select>
                {publicPaused && (
                  <p className="mt-1 text-xs text-ash/70">
                    Public games are paused while ${tokenSymbol} bonds — private
                    tables (SOL/USDC) are open and live.
                  </p>
                )}
              </div>

              {visibility === "PRIVATE" && (
                <div>
                  <Label htmlFor="password">Optional password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Leave blank for link-only access"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-ash">
                <input type="checkbox" name="spectatorsAllowed" defaultChecked />
                Allow spectators
              </label>
            </FormSection>

            {error && <p className="text-sm text-red-300">{error}</p>}

            {authed ? (
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || (visibility === "PRIVATE" && privateFull)}
              >
                {submitting
                  ? "Creating…"
                  : visibility === "PRIVATE" && privateFull
                    ? "Private tables full — please wait"
                    : "Create table"}
              </Button>
            ) : (
              <div className="space-y-2">
                <ConnectButton label="Connect wallet to host" />
                <p className="text-xs text-ash/70">
                  Set everything up first — you only need to connect to create the
                  table.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Live summary rail — reflects the form as it's filled in. Below the
          form on mobile; a sticky right rail on desktop. */}
      <aside className="order-2 space-y-4 lg:sticky lg:top-6">
        <div className="glass glass-velvet relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-velvet/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <p className="text-eyebrow">Preview</p>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-ash">
                  {visibility === "PUBLIC" ? "Public" : "Private"}
                </span>
                <span className="rounded-full border border-velvet/30 bg-velvet/10 px-2.5 py-0.5 text-[11px] font-medium text-velvet">
                  {assetLabel}
                </span>
              </div>
            </div>
            <h3 className="mt-2 truncate font-display text-xl text-ivory">
              {name.trim() || "Your table"}
            </h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-ash/70">
              No-Limit Hold&apos;em · {seatsLabel}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <PreviewStat
                label="Blinds"
                value={`${smallBlind || "—"} / ${bigBlind || "—"}`}
              />
              <PreviewStat
                label="Buy-in"
                value={`${minBuyIn || "—"} – ${maxBuyIn || "—"}`}
              />
              <PreviewStat label="Seats" value={seatsLabel} />
              <PreviewStat
                label="Timer"
                value={`${actionTimeout || "30"}s`}
              />
            </div>
          </div>
        </div>

        {/* Private capacity — server-overload guard, shown only when relevant. */}
        {visibility === "PRIVATE" && (
          <div
            className={`rounded-2xl border p-4 ${
              privateFull
                ? "border-amber-400/30 bg-amber-400/[0.06]"
                : "border-white/8 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-[0.18em] text-ash/70">
                Private tables in play
              </span>
              <span className="font-mono text-ivory">
                {privateActive}/{privateMax}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full ${privateFull ? "bg-amber-400" : "bg-velvet"}`}
                style={{
                  width: `${Math.min(100, Math.round((privateActive / Math.max(1, privateMax)) * 100))}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ash">
              {privateFull
                ? "All private tables are full right now. Please wait for one to open up before creating a new game."
                : `${privateLeft} slot${privateLeft === 1 ? "" : "s"} open. We cap concurrent private games to keep tables fast and stable.`}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-relaxed text-ash">
          As host you set the stakes and seating. You do not control the deck,
          RNG, payouts, pot logic, balances, or rake — all are enforced by the
          server.
        </div>
      </aside>
    </div>
  );
}

/** A labeled group of fields within the host form. */
function FormSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-white/8 pt-6 first:border-0 first:pt-0">
      <div>
        <h2 className="font-display text-lg text-ivory">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-ash/70">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

/** A single read-only stat in the live preview card. */
function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.025] px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-[0.22em] text-ash/55">{label}</p>
      <p className="mt-1 truncate text-[15px] font-semibold leading-none text-ivory">
        {value}
      </p>
    </div>
  );
}
