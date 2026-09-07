"use client";

import { useEffect, useMemo, useState } from "react";

const SPORT_ORDER = ["All","NFL","NCAAF","MLB","NBA","NCAAB","WNBA","NHL","Soccer","Tennis"];
const SPORT_LABELS = { All:"All Sports", NFL:"NFL", NCAAF:"College Football", MLB:"MLB", NBA:"NBA", NCAAB:"College Basketball", WNBA:"WNBA", NHL:"NHL", Soccer:"Soccer", Tennis:"Tennis" };


function Icon({type}) {
  const paths = {
    sparkles:<><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"/></>,
    dollar:<><circle cx="12" cy="12" r="9"/><path d="M14.5 8.5c-.6-.5-1.4-.8-2.5-.8-1.5 0-2.5.7-2.5 1.8 0 1.1.8 1.5 2.6 1.9 1.8.4 2.9.9 2.9 2.2 0 1.2-1.1 2-2.8 2-1.2 0-2.2-.3-3-.9M12 6.5v11"/></>,
    trophy:<><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 12v4M9 20h6M10 16h4"/></>,
    flame:<><path d="M13 3c1.5 3.2-.2 4.7 2 6.4 1.7 1.3 2.5 2.8 2.5 4.5A5.5 5.5 0 0 1 12 19.5 5.5 5.5 0 0 1 6.5 14c0-2.5 1.2-4.4 3.6-6.1-.2 2.1.5 3.1 1.2 3.6C12.7 9.5 11.9 6.3 13 3Z"/></>,
    chart:<><path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/></>,
    refresh:<><path d="M20 11a8 8 0 0 0-14.7-3L4 10"/><path d="M4 5v5h5M4 13a8 8 0 0 0 14.7 3L20 14"/><path d="M20 19v-5h-5"/></>,
    shield:<><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    activity:<><path d="M3 12h4l2-6 4 12 2-6h6"/></>,
    menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
    home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    list:<><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>,
    calendar:<><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.4 1.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L9 17.2l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H7v-2h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8.4 9l1.4-1.4.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V6h2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.2 9l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2h-.2a1.7 1.7 0 0 0-1 1Z"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

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
        <div><div className="eyebrow"><Icon type="sparkles"/> LIVE SPORTSBOOK SLATE</div>
          <h1>Every game.<br/><span>One system.</span></h1>
          <p>Browse the entire slate across every supported sport. LIFETIMEBETS highlights the moneylines that meet your -200 to -500 rule.</p>
        </div>
        <div className="hero-logo">LB</div>
      </div>

      <section className="stats-grid">
        <Stat icon={<Icon type="dollar"/>} label="Bankroll" value={`$${bankroll.toFixed(2)}`}/>
        <Stat icon={<Icon type="trophy"/>} label="Record" value={`${wins}-${losses}`}/>
        <Stat icon={<Icon type="flame"/>} label="Streak" value={`W${wins}`}/>
        <Stat icon={<Icon type="chart"/>} label="Profit" value={`+$${profit.toFixed(2)}`} positive/>
      </section>

      <section className="card featured">
        <div className="card-head"><div><div className="section-kicker">TODAY'S #1 PLAY</div><h2>{top?top.selection:"Scanning live slate..."}</h2></div>
          <button className="icon-btn" onClick={refresh} disabled={loading} aria-label="Refresh odds"><span className={loading?"spin":""}><Icon type="refresh"/></span></button>
        </div>
        {top?<><div className="matchup">{top.away} <span>at</span> {top.home}</div>
          <div className="play-row"><div className="odds-pill">{top.bestOdds}</div><div><div className="confidence">{implied(top.bestOdds).toFixed(1)}% implied</div><div className="muted">{top.sportTitle} • {top.book||"Best available"}</div></div></div>
          <div className="analysis"><Icon type="shield"/><div><b>Qualifying play.</b><br/>Inside the permanent -200 to -500 moneyline range. The live slate is ranked by the strongest qualifying market price.</div></div>
        </>:<div className="empty"><Icon type="activity"/><b>{loading?"Loading every sport...":"No qualifying play right now."}</b><span>The app will not force a bet outside the rules.</span></div>}
      </section>

      <section className="slate-head"><div><div className="section-kicker">TODAY'S SLATE</div><h2>All Sports</h2></div><span className="game-count">{visible.length} games</span></section>

      <div className="sport-tabs" role="tablist">
        {SPORT_ORDER.map(s=><button key={s} className={sport===s?"active":""} onClick={()=>setSport(s)}>{SPORT_LABELS[s]}</button>)}
      </div>

      <section className="games">
        {visible.length ? visible.map(g=><GameCard key={g.eventId} game={g}/>) : <div className="empty slate-empty"><Icon type="activity"/><b>{loading?"Pulling the live slate...":"No games available."}</b><span>Tap refresh to check again.</span></div>}
      </section>
    </>;
  }

  function stats(){return <><PageTitle title="Stats" subtitle="Your LIFETIMEBETS performance."/><section className="stats-grid large"><Stat label="Win Rate" value={`${((wins/history.length)*100).toFixed(1)}%`}/><Stat label="Profit" value={`+$${profit.toFixed(2)}`} positive/><Stat label="Avg. Odds" value={Math.round(history.reduce((a,b)=>a+b.odds,0)/history.length)}/><Stat label="Record" value={`${wins}-${losses}`}/></section><section className="card"><div className="section-kicker">BANKROLL</div><div className="bankroll-big">${bankroll.toFixed(2)}</div><div className="muted">Starting bankroll $40.00</div></section></>;}
  function historyPage(){return <><PageTitle title="Bet History" subtitle="Every official LIFETIMEBETS play."/><section className="card history">{history.map(b=><div className="history-row" key={b.day}><div className="day">DAY {b.day}</div><div className="history-main"><b>{b.team}</b><span>vs {b.opponent} • {b.date}</span></div><div className="history-odds">{b.odds}</div><div className="win">{b.result}</div></div>)}</section></>;}
  function challenge(){return <><PageTitle title="Challenge" subtitle="Build the bankroll one official play at a time."/><section className="challenge-card"><div className="challenge-number">3<span>/30</span></div><div className="challenge-copy"><b>30-Day Challenge</b><span>27 days remaining</span></div></section><section className="card rules"><div className="section-kicker">LOCKED RULES</div>{["Moneyline only","Odds must be -200 through -500","Any sport can qualify","One official play per day","No forced bet when nothing qualifies"].map(x=><div className="rule" key={x}><Icon type="shield"/><span>{x}</span></div>)}</section></>;}
  function settings(){return <><PageTitle title="Settings" subtitle="Control how LIFETIMEBETS operates."/><section className="card rules">{[["Starting bankroll","$40.00"],["Current bankroll",`$${bankroll.toFixed(2)}`],["Odds range","-200 to -500"],["Market","Moneyline"],["Sports","All supported"],["Challenge","30 days"]].map(([a,b])=><div className="setting" key={a}><span>{a}</span><b>{b}</b></div>)}</section></>;}

  return <main>
    <header className="topbar"><button className="menu-btn" onClick={()=>setMenu(!menu)}><Icon type="menu"/></button><div className="brand"><span>LB</span> LIFETIMEBETS</div><div className="live-dot"><i/> LIVE</div></header>
    {menu&&<div className="menu-pop"><b>LIFETIMEBETS</b><span>Professional sportsbook interface</span><span>Live all-sports slate</span><span>Moneyline filter: -200 to -500</span></div>}
    <div className="content">{tab==="home"?home():tab==="stats"?stats():tab==="history"?historyPage():tab==="challenge"?challenge():settings()}</div>
    {msg&&<div className="toast">{msg}</div>}
    <nav className="bottom-nav"><Nav active={tab==="home"} icon={<Icon type="home"/>} label="Home" onClick={()=>setTab("home")}/><Nav active={tab==="home"} icon={<Icon type="list"/>} label="Picks" onClick={()=>setTab("home")}/><Nav active={tab==="stats"} icon={<Icon type="chart"/>} label="Stats" onClick={()=>setTab("stats")}/><Nav active={tab==="challenge"} icon={<Icon type="calendar"/>} label="Challenge" onClick={()=>setTab("challenge")}/><Nav active={tab==="settings"} icon={<Icon type="settings"/>} label="Settings" onClick={()=>setTab("settings")}/></nav>
  </main>;
}

function GameCard({game:g}){
  const aq=Number.isFinite(g.awayOdds)&&g.awayOdds<=-200&&g.awayOdds>=-500, hq=Number.isFinite(g.homeOdds)&&g.homeOdds<=-200&&g.homeOdds>=-500;
  return <article className="game-card"><div className="game-main"><div className="sport-label">{g.sportTitle}</div><div className="teams"><span>{g.away}</span><span>{g.home}</span></div><div className="game-time">{new Date(g.commenceTime).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})}</div></div><div className="lines"><Line name="ML" value={g.awayOdds} qualify={aq}/><Line name="ML" value={g.homeOdds} qualify={hq}/></div></article>;
}
function Line({name,value,qualify}){return <div className={qualify?"line qualify":"line"}><small>{name}</small><b>{Number.isFinite(value)?(value>0?"+":"")+value:"—"}</b>{qualify&&<em>QUALIFIES</em>}</div>;}
