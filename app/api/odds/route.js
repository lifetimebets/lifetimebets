import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TIME_ZONE = "America/New_York";

function dateInTimeZone(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

const API="https://api.the-odds-api.com/v4";
const SPORT_KEYS=[
  "americanfootball_nfl","americanfootball_ncaaf",
  "baseball_mlb","basketball_nba","basketball_ncaab","basketball_wnba","icehockey_nhl",
  "soccer_epl","soccer_uefa_champs_league","soccer_usa_mls","soccer_spain_la_liga","soccer_italy_serie_a","soccer_germany_bundesliga","soccer_france_ligue_one","soccer_fifa_world_cup",
  "tennis_atp_us_open","tennis_wta_us_open"
];
const LABELS={americanfootball_nfl:"NFL",americanfootball_ncaaf:"NCAAF",baseball_mlb:"MLB",basketball_nba:"NBA",basketball_ncaab:"NCAAB",basketball_wnba:"WNBA",icehockey_nhl:"NHL",soccer_epl:"Soccer",soccer_uefa_champs_league:"Soccer",soccer_usa_mls:"Soccer",soccer_spain_la_liga:"Soccer",soccer_italy_serie_a:"Soccer",soccer_germany_bundesliga:"Soccer",soccer_france_ligue_one:"Soccer",soccer_fifa_world_cup:"Soccer",tennis_atp_us_open:"Tennis",tennis_wta_us_open:"Tennis"};

function bestLines(event){
  const byTeam={};
  for(const book of event.bookmakers||[]){
    const market=(book.markets||[]).find(m=>m.key==="h2h");
    if(!market) continue;
    for(const out of market.outcomes||[]){
      if(!byTeam[out.name] || out.price>byTeam[out.name].price){ byTeam[out.name]={price:out.price,book:book.title}; }
    }
  }
  return byTeam;
}
function implied(o){ return o<0 ? (-o/(-o+100))*100 : (100/(o+100))*100; }

export async function GET(){
  const key=process.env.ODDS_API_KEY;
  if(!key) return NextResponse.json({error:"ODDS_API_KEY is not configured in Vercel.",games:[],bestPick:null},{status:503});
  const results=await Promise.allSettled(SPORT_KEYS.map(async sport=>{
    const u=new URL(`${API}/sports/${sport}/odds`); u.searchParams.set("regions","us"); u.searchParams.set("markets","h2h"); u.searchParams.set("oddsFormat","american"); u.searchParams.set("apiKey",key); u.searchParams.set("dateFormat","iso");
    const r=await fetch(u,{cache:"no-store"});
    if(!r.ok) return [];
    const data=await r.json();
    return data.map(e=>{
      const lines=bestLines(e);
      const candidates=Object.entries(lines).map(([name,v])=>({name,...v}));
      const q=candidates.filter(x=>x.price>=-500 && x.price<=-200).sort((a,b)=>implied(b.price)-implied(a.price));
      return {eventId:e.id,sport:LABELS[sport]||sport,sportKey:sport,sportTitle:LABELS[sport]||sport,home:e.home_team,away:e.away_team,commence:e.commence_time,lines:candidates,qualifying:q,bestOdds:q[0]?.price??null,selection:q[0]?.name??null,book:q[0]?.book??null};
    });
  }));
  const games=results.flatMap(x=>x.status==="fulfilled"?x.value:[]).sort((a,b)=>new Date(a.commence)-new Date(b.commence));
  const today=dateInTimeZone();
  const todayGames=games.filter(g=>dateInTimeZone(g.commence)===today);
  const qualifying=todayGames.flatMap(g=>g.qualifying.map(q=>({...g,bestOdds:q.price,selection:q.name,book:q.book}))).sort((a,b)=>implied(b.bestOdds)-implied(a.bestOdds));
  return NextResponse.json({games,bestPick:qualifying[0]||null,today,todayGames:todayGames.length,updatedAt:new Date().toISOString(),sports:SPORT_KEYS.length});
}
