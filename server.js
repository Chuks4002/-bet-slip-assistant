import express from "express";
import cors from "cors";
import {
  validateSelection,
  buildBooking,
  health
} from "./server/sportybet-server.js";

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "1mb"
  })
);

app.get("/api/health", async (_req, res) => {
  res.json(await health());
});

app.post("/api/validate", async (req, res) => {
  const selections = req.body?.selections || [];

  const results = [];

  for (const selection of selections) {
    results.push(await validateSelection(selection));
  }

  res.json({
    success: true,
    results
  });
});

app.post("/api/build", async (req, res) => {
  const result = await buildBooking(
    req.body?.selections || []
  );

  res.json(result);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Bet Slip Assistant backend on ${PORT}`);
});
