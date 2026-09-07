# LIFETIMEBETS v7

Professional Next.js sports-betting dashboard.

## v7 changes
- Home and Picks are now separate screens.
- Picks automatically selects the #1 qualifying moneyline from the full returned slate.
- Moneyline rule remains -200 through -500 only.
- Added live all-sports API route for NFL, NCAAF, MLB, NBA, NCAAB, WNBA, NHL, major soccer leagues, and US Open tennis.
- Sports tabs filter the live slate by sport.
- Stats includes the betting calendar.
- Exact LIFETIMEBETS LB logo is included in `public/lifetimebets-logo.png`.

## Environment
Set `ODDS_API_KEY` in Vercel Environment Variables. Never put the real key in GitHub.

## Run
npm install
npm run dev

## Deploy
Push to GitHub and let the connected Vercel project deploy automatically.
