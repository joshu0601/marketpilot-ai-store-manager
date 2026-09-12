# MarketPilot Simulator

整合來源：[TedLin2002/MarketSimulator](https://github.com/TedLin2002/MarketSimulator)。本目錄保留原本的消費者商城與賣家 Agent API，並由 MarketPilot 後台負責每日 AI 決策閉環。

```bash
npm ci
npm run api
npm run dev
```

API 預設位於 `http://127.0.0.1:3001`，商城位於 `http://127.0.0.1:5173`。完整整合建議從專案根目錄執行 `python3 run_all.py`，操作說明見 [`docs/SIMULATOR_INTEGRATION.md`](../docs/SIMULATOR_INTEGRATION.md)。

市場狀態保存在 `data/state.json`；OpenAI API Key 只從程序環境讀取，不會寫入狀態檔。
