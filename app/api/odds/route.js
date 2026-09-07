const SPORTS = [
  ['americanfootball_nfl','NFL'],['americanfootball_ncaaf','NCAAF'],['baseball_mlb','MLB'],['basketball_nba','NBA'],['basketball_ncaab','NCAAB'],['basketball_wnba','WNBA'],['icehockey_nhl','NHL'],
  ['soccer_epl','Soccer'],['soccer_uefa_champs_league','Soccer'],['soccer_spain_la_liga','Soccer'],['soccer_italy_serie_a','Soccer'],['soccer_germany_bundesliga','Soccer'],['soccer_france_ligue_one','Soccer'],
  ['tennis_atp_us_open','Tennis'],['tennis_wta_us_open','Tennis']
];
const american = x => Number.isFinite(Number(x)) ? Number(x) : null;
export async function GET(){
  const key=process.env.ODDS_API_KEY;
  if(!key) return Response.json({error:'ODDS_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.',games:[],bestOdds:null},{status:503});
  const base='https://api.the-odds-api.com/v4/sports/';
  const results=await Promise.allSettled(SPORTS.map(async([sport,sportGroup])=>{
    const u=new URL(base+sport+'/odds'); u.searchParams.set('apiKey',key); u.searchParams.set('regions','us'); u.searchParams.set('markets','h2h'); u.searchParams.set('oddsFormat','american');
    const r=await fetch(u,{cache:'no-store'}); if(!r.ok) return [];
    const data=await r.json();
    return (Array.isArray(data)?data:[]).map(e=>{
      const books=(e.bookmakers||[]).flatMap(b=>(b.markets||[]).filter(m=>m.key==='h2h').map(m=>({book:b.title,outcomes:m.outcomes||[]})));
      const odds={};
      books.forEach(b=>b.outcomes.forEach(o=>{ const p=american(o.price); if(p!==null) odds[o.name]=odds[o.name]===undefined?p:(Math.abs(p)<Math.abs(odds[o.name])?p:odds[o.name]); }));
      const away=odds[e.away_team] ?? null, home=odds[e.home_team] ?? null;
      const q=[away,home].filter(x=>Number.isFinite(x)&&x<=-200&&x>=-500);
      const best=q.length?Math.min(...q):null;
      const selection=best===away?e.away_team:(best===home?e.home_team:null);
      return {eventId:e.id,sport:sportGroup,sportTitle:sportGroup,away:e.away_team,home:e.home_team,commenceTime:e.commence_time,awayOdds:away,homeOdds:home,bestOdds:best,selection,book:books.find(b=>b.outcomes.some(o=>o.name===selection))?.book||'Best available'};
    });
  }));
  const games=results.flatMap(x=>x.status==='fulfilled'?x.value:[]).sort((a,b)=>new Date(a.commenceTime)-new Date(b.commenceTime));
  const qualifying=games.filter(g=>Number.isFinite(g.bestOdds)&&g.bestOdds<=-200&&g.bestOdds>=-500).sort((a,b)=>a.bestOdds-b.bestOdds);
  return Response.json({games,bestOdds:qualifying[0]||null,updatedAt:new Date().toISOString()});
}
