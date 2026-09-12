# MarketPilot 外部環境決策 API

外部環境每天結束後，將前一天的 Observation 傳給 MarketPilot。MarketPilot 以 GPT 產生策略，再套用確定性的價格、毛利與促銷防護，回傳下一天要執行的 Action。

```text
外部環境 ── Observation ──> POST /api/agent/decide
外部環境 <──── Action + guardrails + reasons ── MarketPilot
```

## 呼叫

### 每日全商品決策（建議）

每日模擬應一次提交所有商品。批次模式要求每個商品都由 GPT 產生決策，不會使用 fallback 冒充 AI：

```bash
curl http://127.0.0.1:8000/api/agent/decide-all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MARKETPILOT_API_KEY" \
  --data @examples/daily_batch_request.json
```

`observations` 中每個商品都必須帶有相同的前一日 `observation_date`，且 SKU 不可重複。回應的 `decisions` 逐商品包含：

- `price`：今天售價。
- `coupon_discount`：折價券比例。
- `promotion_level`：促銷強度。
- `reorder_quantity`：今天補貨量。

外部環境應將全部 Action 套用於下一個模擬日。若任一商品的 GPT 呼叫失敗，整批回應會報錯，避免測試結果混入固定或規則策略。

### 單一商品決策

```bash
curl http://127.0.0.1:8000/api/agent/decide \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MARKETPILOT_API_KEY" \
  --data @examples/decision_request.json
```

若沒有設定 `MARKETPILOT_API_KEY`，本機呼叫可省略 `Authorization`。部署到區域網路或雲端時應設定此環境變數。完整 JSON Schema 可從 `GET /api/agent/schema` 取得。

### 由 MarketPilot 主動拉取

如果外部環境提供 `GET /observation/latest`，可在 `.env` 設定：

```env
MARKETPILOT_ENVIRONMENT_URL=http://127.0.0.1:9000/observation/latest
MARKETPILOT_ENVIRONMENT_API_KEY=external-environment-token
```

接著呼叫：

```bash
curl -X POST http://127.0.0.1:8000/api/agent/sync \
  -H "Authorization: Bearer $MARKETPILOT_API_KEY"
```

MarketPilot 會向設定的 URL 發出 `GET`、驗證 Observation，然後回傳相同格式的 Action。外部端點可以直接回傳 Observation，也可以包成 `{ "observation": { ... } }`。URL 只能由伺服器環境變數設定，單次 API 請求不能任意指定目標網址。

全商品 pull 模式可設定 `MARKETPILOT_ENVIRONMENT_BATCH_URL`，再呼叫 `POST /api/agent/sync-all`。外部端點需回傳和 `examples/daily_batch_request.json` 相同的批次結構。

## Observation

必要資料包括：

- `sales`：昨日售價、單位成本、銷量、營收與轉換率。
- `market`：競品價格、需求指數及競品促銷強度。
- `inventory`：現貨、在途庫存與補貨前置天數。
- `events`：目前發生的突發事件，可為空陣列。
- `constraints`：目標毛利率與四項 Action 的限制。
- `history_7d`：選填的近七日銷售，提供後決策會更穩定。
- `last_action`：選填的前一次決策，可供平滑調整。

`observation_date` 表示資料所屬日期。回傳 Action 應套用於它的下一個模擬日。

## Action

成功回應的 `action` 固定包含：

```json
{
  "price": 98.5,
  "coupon_discount": 0.03,
  "reorder_quantity": 300,
  "promotion_level": 0.25
}
```

`guardrails.applied` 會列出 GPT 原始建議被哪些規則調整。`guardrails.margin.projected` 是折價後有效售價的預估毛利率，保證不低於 `target_gross_margin`；如果 `price_max` 使目標毛利在數學上不可能成立，API 會回傳 `400`。

`meta.source` 為 `ai` 時代表採用 GPT 建議；OpenAI 暫時失敗或沒有設定金鑰時會回傳 `fallback`，並沿用保守價格、促銷策略與安全庫存補貨，不會中斷外部模擬。

## 多日模擬

每天的建議流程：

1. 外部環境完成第 N 天銷售計算。
2. 組成第 N 天 Observation，包含事件與競品狀態。
3. 呼叫 `/api/agent/decide`。
4. 保存完整回應以利重播與稽核。
5. 將回傳的四項 Action 套用於第 N+1 天。
6. 下一次呼叫把這筆 Action 放入 `last_action`。

請使用唯一的 `request_id`，例如 `seed-42-day-18`，方便外部環境把日誌和決策對齊。

每日決策支援選填 `current_unit_cost`，用於成本已更新但 `sales.unit_cost` 仍代表昨日成交成本的情境。競品價格使用最低可售競品的折後有效價格。`notifications` 會回傳低於毛利底線的競品通知；`observation` 保存原始決策依據。
