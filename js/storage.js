const STATE_KEY="betSlipAssistantV3";const HISTORY_KEY="betSlipAssistantV3History";const OLD_KEY="betSlipAssistantV2";
function read(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
export function loadState(){const s=read(STATE_KEY,null);if(s?.slip)return s;const old=read(OLD_KEY,null);if(old?.selections)return{slip:{version:3,...old,selections:old.selections.map(x=>({sport:x.sport||"",event:x.event||"",market:x.market||"",pick:x.pick||x.selection||"",odds:Number(x.odds)||0,startTime:x.startTime||x.start_time||""}))},mode:"live",debug:false};return null}
export function saveState(s){localStorage.setItem(STATE_KEY,JSON.stringify(s))}
export function loadHistory(){return read(HISTORY_KEY,[])}
export function addHistory(x){const h=loadHistory();h.unshift(x);localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,50)))}
export function clearState(){localStorage.removeItem(STATE_KEY);localStorage.removeItem(OLD_KEY)}