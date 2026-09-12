# MarketSimulator 完整整合

整合來源：[TedLin2002/MarketSimulator](https://github.com/TedLin2002/MarketSimulator)，上游版本 `e02105c`。

## 啟動

首次安裝：

```bash
python3 -m pip install -r requirements.txt
npm ci --prefix simulator
```

同時啟動 MarketPilot 後台、模擬器 API 與消費者商城：

```bash
python3 run_all.py
```

- 後台：`http://127.0.0.1:8000`
- 市場商城：`http://127.0.0.1:5173`
- 模擬器 API：`http://127.0.0.1:3001`

## 每日閉環

在前台 `http://127.0.0.1:5173/#sim` 點選「下一天」，或使用連續模擬。

1. 準備下一天的市場事件，競品 agent 呼叫 GPT 為每個競品設定價格與理由。
2. 店長逐 SKU 呼叫 GPT，輸入前一日真實模擬成交、近七日歷史、今日競品價格與事件。
3. 競品有效價格低於本店且仍能滿足最低毛利時，自動降至具競爭力的價格。可跟價時的調整優先於一般每日漲跌幅限制。
4. 競品低於 `cost / (1 - minGrossMargin)` 時，維持本店售價並產生商家通知；折扣仍須遵守毛利底線。剛調整成本而原價已不安全時，毛利保護優先。
5. 套用今日價格與促銷後，買家 agent 呼叫 GPT，五位買家各自決定買一件或不買。成交才扣庫存，保存訂單、實際折後金額與評論。
6. 全部成功後才提交新的一天。GPT 失敗時不提交價格、訂單或日期；同一日的競品準備结果可供重試。重複的舊日期請求會被拒絕。
7. 前台可以選擇歷史日期查看訂單、競品理由、店長依據及商家通知。後台通知鈴鐺與店長操作紀錄也會顯示最新日結結果。

第一天或新商品尚無前日成交時，以明確的零銷售冷啟動資料決策；第二天起使用上一個完成日的成交。最低毛利以分為單位的實際折後成交價計算。庫存達預警門檻時通知商家，不自動採購。

三個 agent 都要求真實 GPT 連線，正式日結不降級為規則買家。事件使用 seed 產生，但 GPT 決策非確定性，seed 不保證相同交易結果。瀏覽器關閉後不會自動推進，模擬的一天由按鈕控制，並非日曆排程。

## 後台 API

- `GET /api/simulator/dashboard`：供前台模擬控制台讀取統一商品與市場狀態。
- `POST /api/simulator/run-day`：供前台完成一次 GPT 決策與市場日結，body 為 `{"expected_day": 目前已完成天數}`。
- `POST /api/simulator/reset`：使用指定 seed 重置市場。
- `POST /api/simulator/restock`：確認 AI 補貨通知並排入下一日。

可透過 `MARKETPILOT_SIMULATOR_URL` 改用另一個模擬器 API 位址。

模擬狀態會保存在 `simulator/data/state.json`，重啟完整環境後會接續目前模擬日；此檔案與 API Key 均不會提交至 Git。

## 模擬器內部 API

- `POST /api/prepare-day`：傳入 `expected_day`，取得競品準備快照與 `token`，不提交市場狀態。
- `POST /api/step`：傳入 `expected_day`、`token`、`actions`、`agent_run`，套用策略後呼叫買家，提交完整一天。前台應透過後台 `run-day` 來協調這兩個步驟。
- `GET /api/state`：包含 `orders`、`lastAgentRun`、`agentHistory` 與逐 SKU 的 `dailyResults`。

GPT 使用 Responses API 的結構化輸出：[official OpenAI documentation](https://developers.openai.com/api/docs/guides/structured-outputs)。

## 後台營運報表

`GET /api/analytics` 只讀取模擬器已提交狀態，不呼叫 GPT。營運總覽與營運分析共用此 API，每 5 秒更新。核心數字為整次模擬的 MarketPilot 累計營收、毛利、銷量；競品只納入市場總銷量及市占率。

每日趨勢由歷史累計數字相減產生。商品毛利使用成交時累積的利潤，不用目前成本重算。訂單與顧客統計只使用實際保存的本店成交明細，若舊版明細不足，保留完整的營收與銷量、標記明細不完整並停用平均訂單金額。重置後報表會回到第 0 天。趨勢期間選擇只影響圖表，累計指標仍是整次模擬。

## 即時 agent 執行進度

`GET /api/simulator/progress` 回傳 `status`（idle/running/completed/failed）、`stage`（competitor/manager/buyer/completed/idle）、目標模擬日 `day`，以及店長目前的 `product_name`、`product_index`、`product_count`。前台每秒讀取一次。這個讀取端點使用獨立的鎖，GPT 呼叫期间仍可回應。

階段直接由後端在執行邊界更新：競品 GPT 完成後，店長才會收到新競品報價；全部商品決策完成後，使用者 agent 才依今日價格購買。失敗時保留當下階段，不會顯示後续 agent 已完成。狀態在服務重啟後回到 idle；重新整理網頁則能接續讀取執行中的進度。
