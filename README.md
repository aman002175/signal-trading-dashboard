# Signal Trading Dashboard

Create a polished mobile-first browser app named Signal Robot Pro. This is a frontend-only trial prototype; do NOT enable Supabase, database, auth, server functions, backend, cloud storage or any persistent service. Use local browser state only. No broker execution.

Build an attractive dark trading terminal with:
- Instruments NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS, INFY and timeframe selector 5m/15m/1h/1d.
- DEMO DATA badge always visible. All generated bars/prices/signals must be prominently marked synthetic demo data; never imply live exchange data.
- Functional synthetic OHLCV chart and deterministic demo bars; refresh button creates a new demo sample.
- In-browser technical indicators calculated from sample bars: EMA 9/21, RSI 14 Wilder, MACD, ATR, ADX, session VWAP, relative volume, engulfing pattern, ORB.
- Transparent score-based BUY/SELL/WAIT with confidence labelled alignment score, explicitly NOT win probability. Conservative WAIT guards.
- Illustrative entry reference, ATR stop, T1/T2/T3, risk/reward.
- Sections Dashboard, Watchlist, Paper Trade, Backtest, Settings. All controls work.
- Watchlist with symbol switching. Paper-trade sandbox with hypothetical long/short, qty, close position and simulated P&L.
- Backtest over generated synthetic bars with sample trade metrics and prominent synthetic-data disclaimer.
- Settings state “Live market data not connected”; no fake live API requests and no client-side API secrets.
- Optional AI review shown as not connected; explain never place secret API keys in browser code.
- Methodology/disclaimer about no profit guarantee and need for genuine market data plus out-of-sample validation before real use.
- Responsive on Android phones and desktop. High-quality typography, readable card hierarchy, polished charts.
Build all functionality in-browser and do not add backend/database. Make preview available.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/be63ee8a-fe53-4f3f-b8d0-30a1e7195eb5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
