export function combinedOdds(list){return(list||[]).reduce((p,s)=>p*(Number(s.liveOdds??s.currentOdds??s.odds)||1),1)}
export function potentialReturn(stake,odds){return(Number(stake)||0)*(Number(odds)||1)}
export function impliedProbability(odds){return odds>0?100/odds:0}
export function gapText(cur,target){if(!cur||!target)return"Import a slip to begin.";if(cur>=target)return"Target reached: "+cur.toFixed(2)+"× ≥ "+target.toFixed(2)+"×.";return"Current combined odds "+cur.toFixed(2)+"× — target is "+target.toFixed(2)+"×."}