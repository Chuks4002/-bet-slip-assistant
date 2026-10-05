const SPORT_IDS = {
  football: "sr:sport:1",
  soccer: "sr:sport:1",

  basketball: "sr:sport:2",
  baseball: "sr:sport:3",
  "ice hockey": "sr:sport:4",
  icehockey: "sr:sport:4",

  tennis: "sr:sport:5",
  handball: "sr:sport:6",

  golf: "sr:sport:9",
  boxing: "sr:sport:10",

  motorsport: "sr:sport:11",
  "motor sport": "sr:sport:11",

  rugby: "sr:sport:12",

  aussierules: "sr:sport:13",
  "aussie rules": "sr:sport:13",

  bandy: "sr:sport:15",

  americanfootball: "sr:sport:16",
  "american football": "sr:sport:16",
  nfl: "sr:sport:16",

  cycling: "sr:sport:17",

  snooker: "sr:sport:19",
  "table tennis": "sr:sport:20",
  tabletennis: "sr:sport:20",

  cricket: "sr:sport:21",
  darts: "sr:sport:22",

  volleyball: "sr:sport:23",

  "field hockey": "sr:sport:24",
  fieldhockey: "sr:sport:24",

  pool: "sr:sport:25",
  waterpolo: "sr:sport:26",
  "water polo": "sr:sport:26",

  futsal: "sr:sport:29",
  badminton: "sr:sport:31",

  chess: "sr:sport:33",

  "beach volleyball": "sr:sport:34",
  beachvolleyball: "sr:sport:34",

  squash: "sr:sport:37",

  lacrosse: "sr:sport:39",

  softball: "sr:sport:54",

  "beach soccer": "sr:sport:60",
  beachsoccer: "sr:sport:60",

  esport: "sr:sport:107",
  esports: "sr:sport:107",

  "counter strike": "sr:sport:109",
  csgo: "sr:sport:109",
  cs2: "sr:sport:109",

  lol: "sr:sport:110",
  "league of legends": "sr:sport:110",

  dota2: "sr:sport:111",
  dota: "sr:sport:111",

  mma: "sr:sport:117",

  "call of duty": "sr:sport:118",

  overwatch: "sr:sport:121",

  "rainbow six": "sr:sport:125",

  "rocket league": "sr:sport:128",

  valorant: "sr:sport:194",

  "basketball 3x3": "sr:sport:155",
  basketball3x3: "sr:sport:155"
};
const STOP=new Set(["fc","cf","club","the","men","women","team","ac","sc"]);
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}
function toks(s){return norm(s).split(" ").filter(x=>x&&!STOP.has(x))}
function ov(a,b){const A=new Set(toks(a)),B=new Set(toks(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(A.size,B.size)}
function sides(s){const p=String(s||"").split(/\s+(?:vs\.?|v\.?|versus)\s+|\s+[-–—]\s+/i);return p.length===2?p:["",s]}
export function eventScore(req,e){const [rh,ra]=sides(req);const direct=(ov(rh,e.homeTeamName)+ov(ra,e.awayTeamName))/2;const reverse=(ov(rh,e.awayTeamName)+ov(ra,e.homeTeamName))/2;return Math.max(direct,reverse*.97,ov(req,String(e.homeTeamName)+" vs "+String(e.awayTeamName))*.85)}
function marketScore(req,m,pick){const a=norm(req),b=norm(m);if(a===b)return 1;if(b.includes(a)||a.includes(b))return .88;const aliases={"match winner":["match winner","winner","moneyline"],"double chance":["double chance"],"total goals":["total goals","over under"],"both teams to score":["both teams to score","btts"],"draw no bet":["draw no bet","dnb"]};for(const k in aliases)if(aliases[k].some(v=>norm(v)===a)&&aliases[k].some(v=>b.includes(norm(v))))return .86;return 0}
function outcomeScore(req,d){const a=norm(req),b=norm(d);if(a===b)return 1;if(a&&b&&(b.includes(a)||a.includes(b)))return .9;return ov(a,b)}
export function chooseEvent(req,candidates){const r=candidates.map(e=>({...e,_score:eventScore(req,e)})).sort((a,b)=>b._score-a._score);if(!r.length||r[0]._score<.42)return{status:"NOT_FOUND",candidates:r.slice(0,3)};if(r[1]&&r[0]._score-r[1]._score<.06)return{status:"AMBIGUOUS",candidates:r.slice(0,3)};return{status:"FOUND",event:r[0]}}
function lineFromPick(p){const m=String(p||"").match(/(?:over|under|exactly|at least|below)?\s*(\d+(?:\.\d+)?)/i);return m?m[1]:null}
export function chooseMarket(req,markets,pick){const line=lineFromPick(pick);const r=(markets||[]).map(m=>{let score=marketScore(req,m.desc||m.name||"");const spec=String(m.specifier||"");if(line&&spec===line)score+=.12;else if(line&&norm(m.desc||"").includes(norm(line)))score+=.08;return{...m,_score:score}}).sort((a,b)=>b._score-a._score);if(!r[0]||r[0]._score<.55)return{status:"UNAVAILABLE",candidates:r.slice(0,4)};if(r[1]&&r[0]._score-r[1]._score<.05)return{status:"AMBIGUOUS",candidates:r.slice(0,4)};return{status:"FOUND",market:r[0]}}
export function chooseOutcome(req,outcomes){const r=(outcomes||[]).map(o=>({...o,_score:outcomeScore(req,o.desc||o.name||"")})).sort((a,b)=>b._score-a._score);if(!r[0]||r[0]._score<.55)return{status:"UNAVAILABLE",candidates:r.slice(0,5)};if(r[1]&&r[0]._score-r[1]._score<.04)return{status:"AMBIGUOUS",candidates:r.slice(0,5)};return{status:"FOUND",outcome:r[0]}}
export function sportId(s){return SPORT_IDS[s]||null}
