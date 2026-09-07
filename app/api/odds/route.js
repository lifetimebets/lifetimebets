import { NextResponse } from 'next/server';

const SPORTS = [
  ['americanfootball_nfl','NFL'],
  ['americanfootball_ncaaf','College Football'],
  ['baseball_mlb','MLB'],
  ['basketball_nba','NBA'],
  ['basketball_ncaab','College Basketball'],
  ['basketball_wnba','WNBA'],
  ['icehockey_nhl','NHL'],
  ['soccer_epl','Soccer'],
  ['soccer_usa_mls','Soccer'],
  ['soccer_uefa_champs_league','Soccer'],
  ['soccer_uefa_europa_league','Soccer'],
  ['soccer_uefa_europa_conference_league','Soccer'],
  ['tennis_atp_us_open','Tennis'],
  ['tennis_wta_us_open','Tennis'],
];

function american(outcome) {
  const price = outcome?.price;
  return typeof price === 'number' ? price : null;
}

export async function GET() {
  const key = process.env.ODDS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'ODDS_API_KEY is not configured', games: [] }, { status: 503 });
  }

  const results = [];
  const errors = [];

  await Promise.all(SPORTS.map(async ([sportKey, sportTitle]) => {
    try {
      const url = new URL(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`);
      url.searchParams.set('apiKey', key);
      url.searchParams.set('regions', 'us');
      url.searchParams.set('markets', 'h2h');
      url.searchParams.set('oddsFormat', 'american');
      const response = await fetch(url, { next: { revalidate: 30 } });
      if (!response.ok) {
        errors.push(`${sportKey}:${response.status}`);
        return;
      }
      const games = await response.json();
      for (const event of games) {
        let bestAway = null;
        let bestHome = null;
        let bestBook = null;
        for (const book of event.bookmakers || []) {
          const market = (book.markets || []).find(m => m.key === 'h2h');
          if (!market) continue;
          for (const outcome of market.outcomes || []) {
            const price = american(outcome);
            if (price == null) continue;
            if (outcome.name === event.away_team && (bestAway == null || price > bestAway)) bestAway = price;
            if (outcome.name === event.home_team && (bestHome == null || price > bestHome)) bestHome = price;
            if (price <= -200 && price >= -500) bestBook = book.title;
          }
        }
        const qualifying = [bestAway, bestHome].filter(v => Number.isFinite(v) && v <= -200 && v >= -500);
        const bestOdds = qualifying.length ? Math.max(...qualifying) : null;
        const selection = bestOdds === bestAway ? event.away_team : bestOdds === bestHome ? event.home_team : null;
        results.push({
          eventId: event.id,
          sport: sportKey.includes('soccer') ? 'Soccer' : sportKey === 'tennis_atp_us_open' || sportKey === 'tennis_wta_us_open' ? 'Tennis' : sportKey.includes('americanfootball_nfl') ? 'NFL' : sportKey.includes('ncaaf') ? 'NCAAF' : sportKey.includes('baseball') ? 'MLB' : sportKey.includes('basketball_nba') ? 'NBA' : sportKey.includes('ncaab') ? 'NCAAB' : sportKey.includes('wnba') ? 'WNBA' : sportKey.includes('icehockey') ? 'NHL' : sportKey,
          sportTitle,
          commenceTime: event.commence_time,
          away: event.away_team,
          home: event.home_team,
          awayOdds: bestAway,
          homeOdds: bestHome,
          bestOdds,
          selection,
          book: bestBook,
        });
      }
    } catch (error) {
      errors.push(`${sportKey}:${error?.message || 'request failed'}`);
    }
  }));

  results.sort((a, b) => new Date(a.commenceTime) - new Date(b.commenceTime));
  const deduped = Array.from(new Map(results.map(g => [g.eventId, g])).values());
  return NextResponse.json({ games: deduped, qualifying: deduped.filter(g => Number.isFinite(g.bestOdds)), errors });
}
