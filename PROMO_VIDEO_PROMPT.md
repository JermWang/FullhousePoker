# Fullhouse Poker Platform Promo Prompt

Use this brief for the Remotion composition in `src/remotion`. The video must only use visual materials already in this codebase.

## Hard Constraints

- Use only repo assets from `public/`: `fullhouse-chip.svg`, `banner.png`, and `PFP.png`.
- Use only repo styling tokens from `tailwind.config.ts` and `src/app/globals.css`: deep-plum night, ivory, glowing teal felt, electric magenta, amber, ash, glass surfaces, neon-after-dark typography.
- Use only local/system font stacks already declared in the codebase fallbacks. Do not fetch Google Fonts, stock footage, icon libraries, AI-generated images, or remote assets.
- Use frame-driven Remotion animation only. Do not use CSS transitions or CSS keyframe animations.
- Keep the product tone confident, private, operational, and buzzing — neon-lit but never cluttered. No meme visuals, casino clutter, or generic crypto motifs.

## Composition

- ID: `FullhousePlatformPromo`
- Format: 1920x1080, 30fps, 27 seconds
- Output: `out/fullhouse-platform-promo.mp4`

## Storyboard

1. **0-4s: Brand open**
   - Fullhouse FH chip mark, deep-plum field, faint banner texture, royal-flush card fan.
   - Copy: `Private cardroom / Solana`, `Real money. Real nerve. After dark.`

2. **4-9s: Access and private rooms**
   - UI surface animates in with lobby/sidebar layout.
   - Highlight wallet-only entry, private invite codes, hosted rooms.

3. **9-14s: Gameplay**
   - Felt poker table, seats, community cards, action state.
   - Highlight server-authoritative real-time Hold'em and table-locked buy-ins.

4. **14-19s: Cashier and ledger**
   - Balance pill, deposit/withdrawal rows, reconciliation line.
   - Highlight Solana settlement, SOL/USDC, double-entry ledger.

5. **19-23s: Trust and ops**
   - Hand proof and admin/risk panels.
   - Highlight commit-reveal verification, hand history, admin review queues.

6. **23-27s: Close**
   - Return to brand and summarize: `Private tables. Transparent money. Verifiable play.`

## Voiceover Direction

Calm, high-trust, concise:

> Fullhouse Poker is a private real-money Solana cardroom built for serious tables. Players enter with a wallet, host invite-first games, and play server-authoritative Hold'em in real time. Deposits, withdrawals, buy-ins, and cash-outs flow through a balanced internal ledger with Solana settlement. Every hand can be verified with commit-reveal proof, while admins get the controls they need for risk, reviews, and operations. Private tables. Transparent money. Verifiable play.

## Visual Language

- Camera language: slow push-ins, clean parallax, no frantic cuts.
- Surfaces: glass panels, hairline borders, magenta focus rings and neon glow (with teal/amber accents).
- Motion: cubic-bezier ease-out equivalents via Remotion `interpolate()` and `Easing.bezier(0.16, 1, 0.3, 1)`.
- Data/UI: show convincing product states without screenshots from external sources.
