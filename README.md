# LIFETIMEBETS v3

Professional sportsbook-style LIFETIMEBETS app.

## Home screen
The Home screen now behaves like a sportsbook lobby:
- All supported sports
- All returned games
- Sport filter chips
- Current moneylines
- Qualifying -200 to -500 moneylines highlighted
- Today's #1 qualifying play at the top
- Bankroll / record / streak / profit

## Live odds
The server-side `/api/odds` route reads `ODDS_API_KEY` from the hosting environment. Do not put the real key into frontend code or commit it.

## Deployment
This version uses Next.js and should be deployed to a Node-capable host such as Vercel rather than GitHub Pages if you want live odds from the secure backend.

GitHub can remain the source-code repository.

## Current challenge data
Bankroll: $83.29
Record: 3-0
Profit: +$43.29
Challenge: Day 3 / 30
Permanent filter: Moneyline only, -200 through -500
