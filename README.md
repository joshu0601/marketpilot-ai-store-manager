# MarketPilot 展示後台

依 `MarketPilot_SPEC_v2.md` 製作的電商平台營運後台展示版。介面以真實商店的日常工作為主，將 AI 店長的建議、決策紀錄與策略評測自然整合進營運流程。

## 開啟方式

安裝後端依賴：

```bash
python3 -m pip install -r requirements.txt
```

啟動 MarketPilot：

```bash
python3 server.py
```

然後前往 `http://127.0.0.1:8000`。請由 `server.py` 啟動，GPT 功能才可使用。

第一次進入「AI 店長」時，點選「連接 GPT」並輸入 OpenAI Platform API key。金鑰只會寫入本機 `.env`，該檔案已列入 `.gitignore`；也可以自行複製 `.env.example` 並填入：

```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o-mini
```

## 展示內容

- 營運總覽與互動營收圖表
- AI 店長每日摘要、可確認的決策建議與決策紀錄
- OpenAI Responses API 結構化營運分析
- 只輸入名稱、成本、庫存與最低毛利率的 AI 商品建立流程
- 訂單、商品與庫存、顧客、行銷活動管理
- 營運分析與商品／流量洞察
- AI、規則及固定策略的公平評測結果
- 快速搜尋、新增流程、響應式側邊欄與操作回饋

目前商店訂單與營運指標為展示資料；GPT 會根據這些資料即時產生分析，API key 不會暴露在前端程式碼或 API 回應中。

AI 店長頁不包含預先填寫的 GPT 結論。每天第一次進入時會呼叫真實模型，結果保存於 `data/daily_analysis.json`；同一個台北日再次進入只會讀取今日快照，不會重複呼叫 GPT。定價、廣告與促銷建議會自動產生已套用紀錄，庫存類建議則產生賣家補貨通知。若設定了 `MARKETPILOT_ENVIRONMENT_URL`，會先取得外部環境最新 Observation，再交給 GPT 分析並在畫面標示資料來源。

新增商品時不提供售價欄位。`POST /api/products` 會由 GPT 決定初始售價，並由最低毛利防護再次驗證；詳細格式見 [AI 商品建立 API](docs/PRODUCTS_API.md)。

## 串接外部模擬環境

外部環境可在每天結束後，把前一天的銷售、單位成本、庫存、競品價格、事件和營運限制送到：

```text
POST http://127.0.0.1:8000/api/agent/decide
```

MarketPilot 會回傳下一天使用的 `price`、`ad_budget`、`coupon_discount`、`reorder_quantity` 與 `promotion_level`。GPT 建議會再經過確定性的目標毛利、價格變動、廣告預算、折扣、補貨與促銷範圍檢查。

多商品環境請使用 `POST /api/agent/decide-all`，每天一次提交所有 SKU 的前一日 Observation。批次模式要求所有商品決策都來自 GPT，並分別決定售價、折價券、促銷強度、廣告預算與補貨量。

完整說明見 [外部環境決策 API](docs/EXTERNAL_API.md)，可直接執行：

```bash
python3 examples/external_environment.py
```
