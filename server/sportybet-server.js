import {
  chooseEvent,
  chooseMarket,
  chooseOutcome,
  sportId
} from "./matchingEngine.js";

const BASE = "https://www.sportybet.com";

async function sportyFetch(url) {
  const r = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Current-Country": "NG"
    }
  });

  if (!r.ok) {
    throw new Error(`HTTP_${r.status}`);
  }

  return r.json();
}

async function upcomingEvents(sport) {
  const sid = sportId(sport);

  if (!sid) {
    throw new Error("UNSUPPORTED_SPORT");
  }

  const url =
    `${BASE}/api/ng/factsCenter/pcUpcomingEvents` +
    `?sportId=${encodeURIComponent(sid)}` +
    `&marketId=1` +
    `&pageSize=100` +
    `&pageNum=1` +
    `&todayGames=false` +
    `&timeline=720` +
    `&_t=${Date.now()}`;

  const body = await sportyFetch(url);

  const events = [];

  for (const t of body?.data?.tournaments || []) {
    for (const e of t.events || []) {
      events.push(e);
    }
  }

  return events;
}

export async function health() {
  return {
    ok: true,
    service: "bet-slip-assistant-backend"
  };
}

export async function validateSelection(selection) {
  try {
    const events = await upcomingEvents(selection.sport);

    const eventMatch = chooseEvent(
      selection.event,
      events
    );

    if (eventMatch.status !== "FOUND") {
      return {
        status: eventMatch.status,
        selection
      };
    }

    const event = eventMatch.event;

    const marketMatch = chooseMarket(
      selection.market,
      event.markets || [],
      selection.pick
    );

    if (marketMatch.status !== "FOUND") {
      return {
        status: "UNAVAILABLE",
        selection,
        reason: "market_not_found"
      };
    }

    const outcomeMatch = chooseOutcome(
      selection.pick,
      marketMatch.market.outcomes || []
    );

    if (outcomeMatch.status !== "FOUND") {
      return {
        status: "UNAVAILABLE",
        selection,
        reason: "outcome_not_found"
      };
    }

    const outcome = outcomeMatch.outcome;

    return {
      status: "MATCHED",
      selection,

      eventId: event.eventId,

      homeTeam: event.homeTeamName,
      awayTeam: event.awayTeamName,

      marketId: marketMatch.market.id,
      marketName: marketMatch.market.desc,

      outcomeId: outcome.id,
      outcomeName: outcome.desc,

      currentOdds: Number(outcome.odds)
    };
  } catch (e) {
    return {
      status: "FAILED",
      selection,
      reason: e.message
    };
  }
}

export async function buildBooking() {
  return {
    success: false,
    message:
      "Booking generation not implemented yet."
  };
}
