# AI 商品建立 API

`POST /api/products` 接受商品名稱、單位成本、初始庫存、預警庫存與最低毛利率。售價欄位不在輸入 Schema 中，因此呼叫端不能指定商品價格。

```json
{
  "name": "無線降噪耳機",
  "unit_cost": 1680,
  "inventory": 120,
  "low_stock_threshold": 20,
  "min_gross_margin": 0.35
}
```

建立流程：

1. 驗證五個輸入欄位。
2. 使用 GPT 結構化輸出產生初始售價、理由與可信度。
3. 計算最低允許售價：`unit_cost / (1 - min_gross_margin)`。
4. 若 GPT 售價低於底線，由毛利防護提高至最低允許售價。
5. 保存商品、AI 定價資訊與實際預估毛利率。
6. 將同一個 SKU、AI 售價與庫存同步至 MarketSimulator 消費者商城。

成功回應包含：

```json
{
  "ok": true,
  "product": {
    "sku": "AI-12AB34CD",
    "name": "無線降噪耳機",
    "unit_cost": 1680,
    "inventory": 120,
    "low_stock_threshold": 20,
    "min_gross_margin": 0.35,
    "price": 2990,
    "price_control": "ai",
    "pricing": {
      "rationale": "...",
      "confidence": 78,
      "minimum_allowed_price": 2584.62,
      "projected_gross_margin": 0.438127,
      "margin_guardrail_applied": false,
      "model": "gpt-4o-mini"
    },
    "marketplace_sync": {
      "synced": true,
      "created": true
    }
  }
}
```

沒有設定 OpenAI API key 或 GPT 定價失敗時，商品不會建立。模擬器暫時離線時，商品仍會保存在後台，回應中的 `marketplace_sync.synced` 會是 `false`；下次開啟前台控制台或推進新一天時會自動補同步。後續每日價格由 `/api/agent/decide` 的 `action.price` 控制，外部環境不應提供人工價格覆蓋功能。

## 修改成本並立即重新定價

後台商品列表的「調整成本」使用 `POST /api/products/{id 或 sku}/cost`：

```json
{"unit_cost": 1800}
```

此端點只接受成本，拒絕人工售價欄位。GPT 會取得新舊成本、目前價格、昨日成交及競品資訊，產生新售價。程式強制最低毛利、清除舊折扣並立即更新商城售價，保留商品 ID、成交與現有庫存，不必等待下一天。GPT 或市場同步失敗時，回報錯誤且不保存新的後台成本。

`GET /api/products` 在市場服務可用時回傳商城當前售價與库存，因此前後台會反映每日自動調價及成交後庫存。
