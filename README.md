# LIFETIMEBETS v8

Production-ready personal sports betting tracker and live odds dashboard.

## Stack
- Next.js on Vercel
- The Odds API for live moneylines
- Server-side API key only
- Local browser storage for personal bankroll/history/settings

## Required environment variable
`ODDS_API_KEY` — add in Vercel Project Settings → Environment Variables for Production, Preview, and Development as needed. Never put the real key in GitHub or a `NEXT_PUBLIC_` variable.

## Rules
- Moneyline only
- Qualifying range: -200 through -500
- One automatic #1 pick when a qualifying line exists
- No forced bet when nothing qualifies
- All sports lobby plus sport filters

## Launch checklist
1. Upload the repository contents to GitHub. Keep the existing `CNAME` if you already use it.
2. Vercel deploys the `main` branch automatically.
3. Add `ODDS_API_KEY` in Vercel and redeploy.
4. Verify `/api/health` and the Home/Picks/Sports/Stats/Challenge/Settings screens.
5. Point the production domain at Vercel after the Vercel deployment is verified.
