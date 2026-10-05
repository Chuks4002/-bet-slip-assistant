# Bet Slip Assistant V3

GitHub Pages ready.

Features:
- ChatGPT BETSLIP text import
- tolerant JSON import
- normalized sport/market/pick schema
- duplicate and structural validation
- SportyBet live event/market/outcome matching
- live odds comparison
- statuses: MATCHED, ODDS_CHANGED, NOT_FOUND, STARTED, SUSPENDED, UNAVAILABLE, AMBIGUOUS
- failed selection removal / replacement research prompt
- Build Mode
- SportyBet booking-code request via public web endpoint
- mock mode
- local persistence and booking history
- debug panel

Important: SportyBet has no official public developer API. This implementation uses publicly observable undocumented web endpoints. GitHub Pages can only call them directly from the user's browser; it cannot proxy them. If the endpoint blocks the Pages origin with CORS, the app reports that limitation instead of bypassing it.

No passwords, OTPs, PINs, payment data, authentication tokens or wager-confirmation automation are implemented.