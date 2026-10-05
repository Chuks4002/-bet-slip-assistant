export async function health() {
  return {
    ok: true,
    service: "bet-slip-assistant-backend"
  };
}

export async function validateSelection(selection) {
  return {
    status: "MATCHED",
    selection,
    eventId: `mock-${Date.now()}`,
    marketId: "mock-market",
    outcomeId: "mock-outcome",
    currentOdds: selection.odds || 1.0,
    source: "render-backend"
  };
}

export async function buildBooking(selections = []) {
  return {
    success: true,
    bookingCode: "DEMO123",
    selections
  };
}
