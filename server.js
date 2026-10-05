import express from "express";
import cors from "cors";
import {
  validateSelection,
  buildBooking,
  health
} from "./server/sportybet-server.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  res.json(await health());
});

app.post("/api/validate", async (req, res) => {
  const selections = req.body?.selections || [];
  const results = [];

  for (const s of selections) {
    results.push(await validateSelection(s));
  }

  res.json({ results });
});

app.post("/api/build", async (req, res) => {
  try {
    const result = await buildBooking(
      req.body?.selections || []
    );

    res.json(result);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
});

app.get("/api/test-sportybet", async (_req, res) => {
  try {
    const r = await fetch(
      "https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents?sportId=sr:sport:1&marketId=1&pageSize=1&pageNum=1&todayGames=false&timeline=24&_t=" +
        Date.now(),
      {
        headers: {
          Accept: "application/json",
          "Current-Country": "NG"
        }
      }
    );

    const body = await r.json();

    res.json({
      ok: true,
      status: r.status,
      sample: body
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log("Bet Slip Assistant backend on", port)
);
