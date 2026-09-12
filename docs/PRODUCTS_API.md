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
    }
  }
}
```

沒有設定 OpenAI API key 或 GPT 定價失敗時，商品不會建立。後續每日價格由 `/api/agent/decide` 的 `action.price` 控制，外部環境不應提供人工價格覆蓋功能。
