import express from "express";
import cors from "cors";
import { validateSelection, health } from "./server/sportybet-server.js";

const app = express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

app.get("/api/health", async (_req,res)=>{
  res.json(await health());
});

app.post("/api/validate", async (req,res)=>{
  const selections = req.body?.selections || [];
  const results = [];
  for (const s of selections){
    results.push(await validateSelection(s));
  }
  res.json({results});
});

app.post("/api/build", async (req,res)=>{
  res.json({
    success:false,
    message:"Booking/share code generation must be verified against currently accessible public SportyBet interfaces before enabling."
  });
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log("Bet Slip Assistant backend on", port));
