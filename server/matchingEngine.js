const SPORT_IDS = {
  football: "sr:sport:1",
  soccer: "sr:sport:1",

  basketball: "sr:sport:2",

  baseball: "sr:sport:3",

  "ice hockey": "sr:sport:4",
  icehockey: "sr:sport:4",

  tennis: "sr:sport:5",

  handball: "sr:sport:6",

  boxing: "sr:sport:7",

  rugby: "sr:sport:12",

  darts: "sr:sport:14",

  americanfootball: "sr:sport:16",
  "american football": "sr:sport:16",
  nfl: "sr:sport:16",

  cricket: "sr:sport:21",

  esports: "sr:sport:22",

  volleyball: "sr:sport:23",

  snooker: "sr:sport:20",

  mma: "sr:sport:117"
};

const STOP = new Set([
  "fc",
  "cf",
  "club",
  "the",
  "men",
  "women",
  "team",
  "ac",
  "sc"
]);

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toks(s) {
  return norm(s)
    .split(" ")
    .filter(x => x && !STOP.has(x));
}

function ov(a, b) {
  const A = new Set(toks(a));
  const B = new Set(toks(b));

  if (!A.size || !B.size) return 0;

  let n = 0;

  for (const x of A) {
    if (B.has(x)) n++;
  }

  return n / Math.max(A.size, B.size);
}

function sides(s) {
  const p = String(s || "")
    .split(/\s+(?:vs\.?|v\.?|versus)\s+|\s+[-–—]\s+/i);

  return p.length === 2 ? p : ["", s];
}

export function eventScore(req, e) {
  const [rh, ra] = sides(req);

  const direct =
    (ov(rh, e.homeTeamName) +
      ov(ra, e.awayTeamName)) / 2;

  const reverse =
    (ov(rh, e.awayTeamName) +
      ov(ra, e.homeTeamName)) / 2;

  return Math.max(
    direct,
    reverse * 0.97,
    ov(req, `${e.homeTeamName} vs ${e.awayTeamName}`) * 0.85
  );
}

function marketScore(req, m) {
  const a = norm(req);
  const b = norm(m);

  if (a === b) return 1;

  if (b.includes(a) || a.includes(b))
    return 0.90;

  const aliases = {
    "match winner": [
      "match winner",
      "winner",
      "moneyline",
      "to win"
    ],

    "double chance": [
      "double chance"
    ],

    "total goals": [
      "total goals",
      "over under",
      "totals"
    ],

    "both teams to score": [
      "both teams to score",
      "btts"
    ],

    "draw no bet": [
      "draw no bet",
      "dnb"
    ],

    "point spread": [
      "point spread",
      "spread",
      "handicap",
      "asian handicap"
    ],

    spread: [
      "point spread",
      "spread",
      "handicap"
    ],

    handicap: [
      "point spread",
      "spread",
      "handicap"
    ]
  };

  for (const k in aliases) {
    if (
      aliases[k].some(v => norm(v) === a) &&
      aliases[k].some(v => b.includes(norm(v)))
    ) {
      return 0.88;
    }
  }

  return ov(a, b);
}

function outcomeScore(req, d) {
  const a = norm(req);
  const b = norm(d);

  if (a === b) return 1;

  if (a && b && (b.includes(a) || a.includes(b)))
    return 0.95;

  return ov(a, b);
}

export function chooseEvent(req, candidates) {
  const r = candidates
    .map(e => ({ ...e, _score: eventScore(req, e) }))
    .sort((a, b) => b._score - a._score);

  if (!r.length || r[0]._score < 0.35) {
    return {
      status: "NOT_FOUND",
      candidates: r.slice(0, 3)
    };
  }

  return {
    status: "FOUND",
    event: r[0]
  };
}

function lineFromPick(p) {
  const m = String(p || "")
    .match(/(-?\d+(?:\.\d+)?)/);

  return m ? m[1] : null;
}

export function chooseMarket(req, markets, pick) {
  const line = lineFromPick(pick);

  const r = (markets || [])
    .map(m => {
      let score = marketScore(
        req,
        m.desc || m.name || ""
      );

      const spec = String(m.specifier || "");

      if (line && spec.includes(line)) {
        score += 0.20;
      }

      return { ...m, _score: score };
    })
    .sort((a, b) => b._score - a._score);

  if (!r[0] || r[0]._score < 0.40) {
    return {
      status: "UNAVAILABLE",
      candidates: r.slice(0, 5)
    };
  }

  return {
    status: "FOUND",
    market: r[0]
  };
}

export function chooseOutcome(
  req,
  outcomes = [],
  event = null
) {
  const wanted = norm(req);

  const exact = outcomes.find(o => {
    const d = norm(o.desc || o.name || "");
    return d === wanted;
  });

  if (exact) {
    return {
      status: "FOUND",
      outcome: exact
    };
  }

  if (event) {
    const home = norm(event.homeTeamName);
    const away = norm(event.awayTeamName);

    const wantsHome =
      wanted.includes(home) ||
      home.includes(wanted);

    const wantsAway =
      wanted.includes(away) ||
      away.includes(wanted);

    for (const o of outcomes) {
      const d = norm(o.desc || o.name || "");

      if (
        wantsHome &&
        (d === "home" ||
          d === "1" ||
          d === "team 1")
      ) {
        return {
          status: "FOUND",
          outcome: o
        };
      }

      if (
        wantsAway &&
        (d === "away" ||
          d === "2" ||
          d === "team 2")
      ) {
        return {
          status: "FOUND",
          outcome: o
        };
      }
    }
  }

  const ranked = outcomes
    .map(o => ({
      ...o,
      _score: outcomeScore(
        req,
        o.desc || o.name || ""
      )
    }))
    .sort((a, b) => b._score - a._score);

  if (!ranked[0] || ranked[0]._score < 0.25) {
    return {
      status: "UNAVAILABLE",
      candidates: ranked.slice(0, 5)
    };
  }

  return {
    status: "FOUND",
    outcome: ranked[0]
  };
}

export function sportId(s) {
  return SPORT_IDS[norm(s)] || null;
}
