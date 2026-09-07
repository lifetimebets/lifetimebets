const SPORTS = [
 ["americanfootball_nfl","NFL"],["americanfootball_ncaaf","NCAAF"],["baseball_mlb","MLB"],
 ["basketball_nba","NBA"],["basketball_ncaab","NCAAB"],["basketball_wnba","WNBA"],
 ["icehockey_nhl","NHL"],["soccer_epl","Soccer"],["soccer_uefa_champs_league","Soccer"],
 ["soccer_spain_la_liga","Soccer"],["soccer_germany_bundesliga","Soccer"],["soccer_italy_serie_a","Soccer"],
 ["soccer_france_ligue_one","Soccer"],["soccer_usa_mls","Soccer"],["soccer_mexico_ligamx","Soccer"],
 ["tennis_atp","Tennis"],["tennis_wta","Tennis"]
];
const inRange=p=>Number.isFinite(p)&&p<=-200&&p>=-500;

export async function GET(){
 const key=process.env.ODDS_API_KEY;
 if(!key) return Response.json({error:"ODDS_API_KEY is not configured. Add it to the hosting environment.",games:[]},{status:503});
 const all=[];
 for(const [sportKey,category] of SPORTS){
  try{
   const u=new URL(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`);
   u.searchParams.set("apiKey",key);u.searchParams.set("regions","us");u.searchParams.set("markets","h2h");u.searchParams.set("oddsFormat","american");
   const r=await fetch(u,{next:{revalidate:60}}); if(!r.ok) continue;
   const events=await r.json();
   for(const e of events){
    let awayOdds=null,homeOdds=null,bestOdds=null,selection=null,book=null;
    for(const b of e.bookmakers||[]){const m=(b.markets||[]).find(x=>x.key==="h2h");if(!m)continue;
      for(const o of m.outcomes||[]){const p=Number(o.price);
       if(o.name===e.away_team && (awayOdds===null||p<awayOdds)) awayOdds=p;
       if(o.name===e.home_team && (homeOdds===null||p<homeOdds)) homeOdds=p;
       if(inRange(p)&&(bestOdds===null||p<bestOdds)){bestOdds=p;selection=o.name;book=b.title;}
      }
    }
    if(awayOdds!==null||homeOdds!==null) all.push({eventId:e.id,sport:category,sportTitle:e.sport_title||category,home:e.home_team,away:e.away_team,commenceTime:e.commence_time,awayOdds,homeOdds,bestOdds,selection,book});
   }
  }catch{}
 }
 all.sort((a,b)=>new Date(a.commenceTime)-new Date(b.commenceTime));
 return Response.json({updatedAt:new Date().toISOString(),games:all});
}
