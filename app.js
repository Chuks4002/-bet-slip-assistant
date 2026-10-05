import {parseSlip} from './parser.js';import adapter from './sportybet-mock.js';
let slip={selections:[]},results=[];
const $=id=>document.getElementById(id);
function save(){localStorage.setItem('bsa_v3',JSON.stringify(slip));}
function render(){const odds=slip.selections.reduce((a,s)=>a*(Number(s.odds)||1),1);$('summary').innerHTML=`Selections: ${slip.selections.length}<br>Combined Odds: ${odds.toFixed(2)}x`;save();}
importBtn.onclick=()=>{slip=parseSlip(importBox.value);render();debug.textContent=JSON.stringify(slip,null,2);};
validateBtn.onclick=async()=>{results=[];for(const s of slip.selections)results.push(await adapter.validateSelection(s));resultsEl=results.map(r=>`<div class='ok'>✓ ${r.selection.event} (${r.liveOdds})</div>`).join('');document.getElementById('results').innerHTML=resultsEl;};
buildBtn.onclick=async()=>{const b=await adapter.buildBooking(results);booking.innerHTML=`Code: ${b.bookingCode}<br><a target='_blank' href='${b.shareUrl}'>Open SportyBet</a>`;};
const old=localStorage.getItem('bsa_v3');if(old){slip=JSON.parse(old);render();}
