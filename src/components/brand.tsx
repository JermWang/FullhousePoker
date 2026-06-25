import Link from "next/link";
import { cn } from "@/lib/utils";

/** App name placeholder — kept in one place so the product is easy to rename. */
export const APP_NAME = "Fullhouse";
export const APP_NAME_FULL = "Fullhouse Poker";

/**
 * The FH chip mark — an amber "FH" monogram on a plum marble disc ringed in a
 * faint amber/magenta glow. Rendered in CSS so it stays crisp at any size and
 * needs no image asset. Matches the Fullhouse brand guide.
 */
export function ChipMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-grid place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        border: "1px solid rgba(255,210,74,0.5)",
        background:
          "radial-gradient(circle at 50% 35%, rgba(255,210,74,0.22), rgba(59,130,246,0.10))",
      }}
    >
      <span
        className="font-display font-bold leading-none text-amber"
        style={{ fontSize: size * 0.42, letterSpacing: "-0.04em" }}
      >
        FH
      </span>
    </span>
  );
}

export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <ChipMark size={32} className="transition-transform group-hover:scale-105" />
      <span className="font-display text-lg font-semibold tracking-tight text-ivory">
        Full<span className="text-velvet drop-shadow-[0_0_18px_rgba(59,130,246,0.5)]">house</span>
      </span>
    </Link>
  );
}
