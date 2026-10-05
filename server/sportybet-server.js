import {
  chooseEvent,
  chooseMarket,
  chooseOutcome,
  sportId
} from "./matchingEngine.js";

const BASE = "https://www.sportybet.com";

const MARKETS =
  "1,10,11,14,16,18,21,26,29,36,45,47,60,219,223,225,227,228,60100";

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

  const events = [];

  for (let page = 1; page <= 3; page++) {
    const url =
      `${BASE}/api/ng/factsCenter/pcUpcomingEvents` +
      `?sportId=${encodeURIComponent(sid)}` +
      `&marketId=${MARKETS}` +
      `&pageSize=100` +
      `&pageNum=${page}` +
      `&todayGames=false` +
      `&timeline=720` +
      `&_t=${Date.now()}`;

    const body = await sportyFetch(url);

    for (const t of body?.data?.tournaments || []) {
      for (const e of t.events || []) {
        events.push(e);
      }
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
        reason: "market_not_found",
        availableMarkets:
          (event.markets || []).map(m => m.desc)
      };
    }

    const market = marketMatch.market;

    const outcomeMatch = chooseOutcome(
      selection.pick,
      market.outcomes || [],
      event
    );

    if (outcomeMatch.status !== "FOUND") {
      return {
        status: "UNAVAILABLE",
        selection,
        reason: "outcome_not_found",
        availableOutcomes:
          (market.outcomes || []).map(o => o.desc)
      };
    }

    const outcome = outcomeMatch.outcome;

    return {
      status: "MATCHED",
      selection,

      eventId: event.eventId,

      homeTeam: event.homeTeamName,
      awayTeam: event.awayTeamName,

      marketId: market.id,
      marketName: market.desc,

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

export async function buildBooking(results = []) {
  try {
    const selections = results
      .filter(
        r =>
          r.eventId &&
          r.marketId &&
          r.outcomeId
      )
      .map(r => ({
        eventId: r.eventId,
        marketId: String(r.marketId),
        outcomeId: String(r.outcomeId)
      }));

    if (!selections.length) {
      return {
        success: false,
        message: "No valid selections."
      };
    }

    const response = await fetch(
      `${BASE}/api/ng/orders/share?throwInvalidEvent=1`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Current-Country": "NG"
        },
        body: JSON.stringify({
          loadingShareCode: "",
          selections
        })
      }
    );

    const body = await response.json();

    console.log(
      "SPORTYBET SHARE RESPONSE:",
      JSON.stringify(body, null, 2)
    );

    if (
      body?.bizCode === 10000 &&
      body?.data?.shareCode
    ) {
      return {
        success: true,
        bookingCode: body.data.shareCode,
        shareCode: body.data.shareCode,
        shareUrl: body.data.shareURL,
        deadline: body.data.deadline,
        debug: body
      };
    }

    return {
      success: false,
      message: "SportyBet rejected booking.",
      debug: body
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}
