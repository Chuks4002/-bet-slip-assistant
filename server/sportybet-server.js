export async function health(){
  return {ok:true, service:"bet-slip-assistant-backend"};
}

export async function validateSelection(selection){
  return {
    status:"UNAVAILABLE",
    selection,
    reason:"Backend adapter stub installed. Replace with live SportyBet server-side matching logic."
  };
}
