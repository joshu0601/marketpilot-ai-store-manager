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

1. 後台商品完成 GPT 初始定價後會立即同步至模擬器商品目錄與消費者商城；前後台使用完全相同的商品清單。
2. 模擬器只保留後台商品，並為每種商品建立競品價格供 GPT 判斷。
3. 模擬器產生當日需求事件、競品狀態、AI 買家交易、營收、毛利與評論。
4. 下一次推進時，MarketPilot 讀取每個 SKU 前一日成交與最近七日歷史。
5. GPT 分別決定售價、折扣、促銷強度與建議補貨量。
6. 毛利率、每日價格變動、折扣及促銷上限由程式再次限制。
7. 售價與促銷策略自動送回模擬器；補貨量先通知賣家，確認後排入下一日。
8. 模擬器使用新策略推進一天，結果回到後台形成下一輪資料。

## 後台 API

- `GET /api/simulator/dashboard`：供前台模擬控制台讀取統一商品與市場狀態。
- `POST /api/simulator/run-day`：供前台完成一次 GPT 決策與市場日結。
- `POST /api/simulator/reset`：使用指定 seed 重置市場。
- `POST /api/simulator/restock`：確認 AI 補貨通知並排入下一日。

可透過 `MARKETPILOT_SIMULATOR_URL` 改用另一個模擬器 API 位址。

模擬狀態會保存在 `simulator/data/state.json`，重啟完整環境後會接續目前模擬日；此檔案與 API Key 均不會提交至 Git。
