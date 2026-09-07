"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, CalendarDays, ChevronRight, CircleDollarSign, Flame, Home, ListChecks, Menu, RefreshCw, Settings, ShieldCheck, Sparkles, Trophy } from "lucide-react";

const SPORT_ORDER = ["All","NFL","NCAAF","MLB","NBA","NCAAB","WNBA","NHL","Soccer","Tennis"];
const SPORT_LABELS = { All:"All Sports", NFL:"NFL", NCAAF:"College Football", MLB:"MLB", NBA:"NBA", NCAAB:"College Basketball", WNBA:"WNBA", NHL:"NHL", Soccer:"Soccer", Tennis:"Tennis" };

const initialHistory = [
  { day:1, date:"Sep 4, 2026", team:"Michigan State", opponent:"Toledo", odds:-405, result:"WIN" },
  { day:2, date:"Sep 5, 2026", team:"Auburn", opponent:"Baylor", odds:-300, result:"WIN" },
  { day:3, date:"Sep 5, 2026", team:"LSU", opponent:"Clemson", odds:-500, result:"WIN" }
];

function implied(o){ return o < 0 ? (-o/(-o+100))*100 : (100/(o+100))*100; }

function Stat({icon,label,value,positive}) {
  return <div className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><b className={positive?"positive":""}>{value}</b></div>;
}
function Nav({active,icon,label,onClick}) { return <button className={active?"nav active":"nav"} onClick={onClick}>{icon}<span>{label}</span></button>; }
function PageTitle({title,subtitle}) { return <div className="page-title"><div className="section-kicker">LIFETIMEBETS</div><h1>{title}</h1><p>{subtitle}</p></div>; }

export default function Home(){
  const [tab,setTab]=useState("home"), [sport,setSport]=useState("All"), [games,setGames]=useState([]), [loading,setLoading]=useState(false), [msg,setMsg]=useState(""), [menu,setMenu]=useState(false);
  const [history]=useState(initialHistory), [bankroll]=useState(83.29);
  const wins=history.filter(x=>x.result==="WIN").length, losses=history.length-wins, profit=bankroll-40;
  const qualifying=useMemo(()=>games.filter(g=>Number.isFinite(g.bestOdds)&&g.bestOdds<=-200&&g.bestOdds>=-500).sort((a,b)=>a.bestOdds-b.bestOdds),[games]);
  const top=qualifying[0]||null;
  const visible=sport==="All"?games:games.filter(g=>g.sport===sport);

  async function refresh(){
    setLoading(true); setMsg("");
    try{
      const r=await fetch("/api/odds");
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Live odds unavailable");
      setGames(d.games||[]);
      setMsg(d.games?.length ? `Live slate updated • ${d.games.length} games` : "No games returned.");
    }catch(e){setMsg(e.message);}
    finally{setLoading(false);}
  }
  useEffect(()=>{refresh()},[]);

  function home(){
    return <>
      <div className="hero">
        <div><div className="eyebrow"><Sparkles size={14}/> LIVE SPORTSBOOK SLATE</div>
          <h1>Every game.<br/><span>One system.</span></h1>
          <p>Browse the entire slate across every supported sport. LIFETIMEBETS highlights the moneylines that meet your -200 to -500 rule.</p>
        </div>
        <div className="hero-logo">LB</div>
      </div>

      <section className="stats-grid">
        <Stat icon={<CircleDollarSign/>} label="Bankroll" value={`$${bankroll.toFixed(2)}`}/>
        <Stat icon={<Trophy/>} label="Record" value={`${wins}-${losses}`}/>
        <Stat icon={<Flame/>} label="Streak" value={`W${wins}`}/>
        <Stat icon={<BarChart3/>} label="Profit" value={`+$${profit.toFixed(2)}`} positive/>
      </section>

      <section className="card featured">
        <div className="card-head"><div><div className="section-kicker">TODAY'S #1 PLAY</div><h2>{top?top.selection:"Scanning live slate..."}</h2></div>
          <button className="icon-btn" onClick={refresh} disabled={loading} aria-label="Refresh odds"><RefreshCw className={loading?"spin":""} size={18}/></button>
        </div>
        {top?<><div className="matchup">{top.away} <span>at</span> {top.home}</div>
          <div className="play-row"><div className="odds-pill">{top.bestOdds}</div><div><div className="confidence">{implied(top.bestOdds).toFixed(1)}% implied</div><div className="muted">{top.sportTitle} • {top.book||"Best available"}</div></div></div>
          <div className="analysis"><ShieldCheck size={20}/><div><b>Qualifying play.</b><br/>Inside the permanent -200 to -500 moneyline range. The live slate is ranked by the strongest qualifying market price.</div></div>
        </>:<div className="empty"><Activity size={28}/><b>{loading?"Loading every sport...":"No qualifying play right now."}</b><span>The app will not force a bet outside the rules.</span></div>}
      </section>

      <section className="slate-head"><div><div className="section-kicker">TODAY'S SLATE</div><h2>All Sports</h2></div><span className="game-count">{visible.length} games</span></section>

      <div className="sport-tabs" role="tablist">
        {SPORT_ORDER.map(s=><button key={s} className={sport===s?"active":""} onClick={()=>setSport(s)}>{SPORT_LABELS[s]}</button>)}
      </div>

      <section className="games">
        {visible.length ? visible.map(g=><GameCard key={g.eventId} game={g}/>) : <div className="empty slate-empty"><Activity size={25}/><b>{loading?"Pulling the live slate...":"No games available."}</b><span>Tap refresh to check again.</span></div>}
      </section>
    </>;
  }

  function stats(){return <><PageTitle title="Stats" subtitle="Your LIFETIMEBETS performance."/><section className="stats-grid large"><Stat label="Win Rate" value={`${((wins/history.length)*100).toFixed(1)}%`}/><Stat label="Profit" value={`+$${profit.toFixed(2)}`} positive/><Stat label="Avg. Odds" value={Math.round(history.reduce((a,b)=>a+b.odds,0)/history.length)}/><Stat label="Record" value={`${wins}-${losses}`}/></section><section className="card"><div className="section-kicker">BANKROLL</div><div className="bankroll-big">${bankroll.toFixed(2)}</div><div className="muted">Starting bankroll $40.00</div></section></>;}
  function historyPage(){return <><PageTitle title="Bet History" subtitle="Every official LIFETIMEBETS play."/><section className="card history">{history.map(b=><div className="history-row" key={b.day}><div className="day">DAY {b.day}</div><div className="history-main"><b>{b.team}</b><span>vs {b.opponent} • {b.date}</span></div><div className="history-odds">{b.odds}</div><div className="win">{b.result}</div></div>)}</section></>;}
  function challenge(){return <><PageTitle title="Challenge" subtitle="Build the bankroll one official play at a time."/><section className="challenge-card"><div className="challenge-number">3<span>/30</span></div><div className="challenge-copy"><b>30-Day Challenge</b><span>27 days remaining</span></div></section><section className="card rules"><div className="section-kicker">LOCKED RULES</div>{["Moneyline only","Odds must be -200 through -500","Any sport can qualify","One official play per day","No forced bet when nothing qualifies"].map(x=><div className="rule" key={x}><ShieldCheck size={18}/><span>{x}</span></div>)}</section></>;}
  function settings(){return <><PageTitle title="Settings" subtitle="Control how LIFETIMEBETS operates."/><section className="card rules">{[["Starting bankroll","$40.00"],["Current bankroll",`$${bankroll.toFixed(2)}`],["Odds range","-200 to -500"],["Market","Moneyline"],["Sports","All supported"],["Challenge","30 days"]].map(([a,b])=><div className="setting" key={a}><span>{a}</span><b>{b}</b></div>)}</section></>;}

  return <main>
    <header className="topbar"><button className="menu-btn" onClick={()=>setMenu(!menu)}><Menu/></button><div className="brand"><span>LB</span> LIFETIMEBETS</div><div className="live-dot"><i/> LIVE</div></header>
    {menu&&<div className="menu-pop"><b>LIFETIMEBETS</b><span>Professional sportsbook interface</span><span>Live all-sports slate</span><span>Moneyline filter: -200 to -500</span></div>}
    <div className="content">{tab==="home"?home():tab==="stats"?stats():tab==="history"?historyPage():tab==="challenge"?challenge():settings()}</div>
    {msg&&<div className="toast">{msg}</div>}
    <nav className="bottom-nav"><Nav active={tab==="home"} icon={<Home/>} label="Home" onClick={()=>setTab("home")}/><Nav active={tab==="home"} icon={<ListChecks/>} label="Picks" onClick={()=>setTab("home")}/><Nav active={tab==="stats"} icon={<BarChart3/>} label="Stats" onClick={()=>setTab("stats")}/><Nav active={tab==="challenge"} icon={<CalendarDays/>} label="Challenge" onClick={()=>setTab("challenge")}/><Nav active={tab==="settings"} icon={<Settings/>} label="Settings" onClick={()=>setTab("settings")}/></nav>
  </main>;
}

function GameCard({game:g}){
  const aq=Number.isFinite(g.awayOdds)&&g.awayOdds<=-200&&g.awayOdds>=-500, hq=Number.isFinite(g.homeOdds)&&g.homeOdds<=-200&&g.homeOdds>=-500;
  return <article className="game-card"><div className="game-main"><div className="sport-label">{g.sportTitle}</div><div className="teams"><span>{g.away}</span><span>{g.home}</span></div><div className="game-time">{new Date(g.commenceTime).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})}</div></div><div className="lines"><Line name="ML" value={g.awayOdds} qualify={aq}/><Line name="ML" value={g.homeOdds} qualify={hq}/></div></article>;
}
function Line({name,value,qualify}){return <div className={qualify?"line qualify":"line"}><small>{name}</small><b>{Number.isFinite(value)?(value>0?"+":"")+value:"—"}</b>{qualify&&<em>QUALIFIES</em>}</div>;}
