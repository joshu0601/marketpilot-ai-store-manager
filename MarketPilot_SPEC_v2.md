# MarketPilot 系統規格書（SPEC）

## 單一 AI 店長 vs 固定策略 vs 規則策略 — 隨機事件電商模擬評測平台

| 項目 | 內容 |
|---|---|
| 版本 | **2.0（as-built，依實際程式碼撰寫）** |
| 取代 | `MarketPilot_SPEC.md` v1.0（實作前草案） |
| 狀態 | 已實作並通過 64 項自動化測試 |
| 主要語言 / 執行環境 | Python ≥ 3.9（開發環境 3.12）、Windows / Linux / macOS |
| 介面 | CLI（`scripts/`）與 Web UI（FastAPI + 原生 HTML/JS，`scripts/serve.py`） |
| 預設 AI 供應商 | OpenAI ChatGPT（`gpt-4o-mini`），可替換為任何 OpenAI 相容端點（vLLM / Ollama）或離線 mock |

---

## 目錄

1. [專案目標與研究問題](#1-專案目標與研究問題)
2. [系統範圍（MVP）](#2-系統範圍mvp)
3. [整體架構](#3-整體架構)
4. [儲存庫結構](#4-儲存庫結構)
5. [設定系統](#5-設定系統)
6. [時間模型與每日流程](#6-時間模型與每日流程)
7. [世界情境（WorldScenario）與公平性保證](#7-世界情境worldscenario與公平性保證)
8. [隨機事件引擎](#8-隨機事件引擎)
9. [環境模型](#9-環境模型)
10. [觀測（Observation）Schema](#10-觀測observationschema)
11. [行動（Action）Schema 與防護](#11-行動actionschema-與防護)
12. [策略](#12-策略)
13. [LLM 供應商層](#13-llm-供應商層)
14. [評估指標](#14-評估指標)
15. [批次評測與統計](#15-批次評測與統計)
16. [輸出格式](#16-輸出格式)
17. [報告、圖表與儀表板](#17-報告圖表與儀表板)
18. [命令列介面](#18-命令列介面)
19. [Web 應用](#19-web-應用)
20. [ChatGPT 分析助理](#20-chatgpt-分析助理)
21. [測試與驗收標準](#21-測試與驗收標準)
22. [非功能需求](#22-非功能需求)
23. [已知限制與後續路線](#23-已知限制與後續路線)
- [附錄 A：預設參數總表](#附錄-a預設參數總表)
- [附錄 B：術語表](#附錄-b術語表)

---

## 1. 專案目標與研究問題

MarketPilot 是一個**可重現的電商經營模擬評測平台**。它讓三種決策政策在**完全相同**的隨機市場世界中經營同一家店 90 天，並以配對統計比較其表現：

| 代號 | 策略 | 說明 |
|---|---|---|
| A | **AI 店長（`ai`）** | 單一 LLM（預設 ChatGPT）每天讀取結構化觀測，輸出五維整合決策 |
| B | **固定策略（`fixed`）** | 每天輸出相同常數，完全不適應 |
| C | **規則策略（`rule_based`）** | 確定性 IF/THEN 商業規則，會對觀測反應但不使用 LLM |

**研究問題**

> 在相同的隨機電商環境（相同需求雜訊、競品價格軌跡、隨機事件）下，一個通用型 AI 店長是否能比固定與規則策略取得更佳的長期獲利與適應能力？

**研究假說**

| 假說 | 內容 | 對應指標 |
|---|---|---|
| H1 | AI 平均累積淨利 > Fixed | `ai_vs_fixed.mean_diff`, paired t / Wilcoxon |
| H2 | AI 平均累積淨利 > Rule-Based | `ai_vs_rule_based.mean_diff` |
| H3 | AI 在事件期間利潤下降較小且/或恢復較快 | `mean_profit_drop_ratio_adverse`, `mean_recovery_days_adverse` |
| H4 | AI 的優勢不以大幅增加缺貨或行動波動為代價 | `stockout_days`, `price_volatility`, `action_volatility`, `adjusted_score` |

成功的判準**不是**「AI 每個 seed 都贏」，而是：統計上有意義的平均 uplift、合理勝率、在複雜/重疊事件下表現較強、庫存與價格穩定度可接受。任何目標數字（例如 +3%～+15%）僅是實驗預期，**不得**寫進計分邏輯。

---

## 2. 系統範圍（MVP）

| 維度 | 範圍 |
|---|---|
| 店鋪 / SKU / 競品 | 1 家店、1 個 SKU（`SKU-001` Wireless Earbuds）、1 個外生競品 |
| 時間 | 預設 90 天，決策間隔 1 天；Web/CLI 可設 1–365 天 |
| 行動 | 5 維：`price`, `ad_budget`, `coupon_discount`, `reorder_quantity`, `promotion_level` |
| 事件 | 10 種隨機事件類型（§8） |
| 難度 | `normal` / `volatile` / `crisis` 三個預設 |
| 策略 | `ai` / `fixed` / `rule_based` |
| 評測 | 預設 50 seeds（1001–1050）× 3 策略 |
| 介面 | CLI、REST/SSE API、Web UI、ChatGPT 分析助理 |

**明確不在範圍**：多 SKU、多競品、跨 SKU 替代、供應商選擇、客群分層、倉儲限制、平台排名演算法、多市場、多智能體（multi-agent）。

---

## 3. 整體架構

### 3.1 核心資料流（強制）

```
Environment → Observation → Strategy → Action → Environment
```

- 策略**只能**看到 Observation、**只能**回傳 Action。
- 策略不得 import 環境內部、修改 seed、修改事件排程或讀取未來狀態（AC-04）。
- 模擬器本身是一般 Python 程式；LLM 絕不執行任何模擬程式碼。

### 3.2 元件圖

```
┌──────────────────────────── 介面層 ─────────────────────────────┐
│  scripts/run_episode.py · run_benchmark.py · analyze_results.py │
│  scripts/check_llm.py · scripts/serve.py                         │
│  Web UI (static/index.html + app.js)  ⇄  FastAPI (web/app.py)   │
│        REST + SSE            │  JobManager (web/jobs.py, threads) │
│                              │  service.py · chat.py (ChatGPT 分析) │
└──────────────┬───────────────┴──────────────────────────────────┘
               │ config dict + seed
┌──────────────▼───────────────┐   ┌─────────────────────────────┐
│ ScenarioGenerator            │──▶│ WorldScenario (immutable)    │
│ (env/scenario.py)            │   │ seasonality · demand_noise   │
└──────────────────────────────┘   │ competitor_noise · events    │
                                   └──────────────┬──────────────┘
                                                  │ replay ×3
┌──────────────────────────────┐   ┌──────────────▼──────────────┐
│ Strategy                     │◀──│ MarketPilotEnv               │
│  AIStoreManager → LLMClient  │──▶│  demand · competitor · events│
│  FixedStrategy               │   │  reward · state              │
│  RuleBasedStrategy           │   └──────────────┬──────────────┘
└──────────────────────────────┘                  │ daily rows
                                   ┌──────────────▼──────────────┐
                                   │ runner.run_episode()          │
                                   │ evaluation/metrics.py         │
                                   │ evaluation/benchmark.py       │
                                   │ evaluation/stats.py           │
                                   │ evaluation/report.py          │
                                   │ evaluation/dashboard.py       │
                                   └──────────────────────────────┘
```

### 3.3 LLM 供應商抽象

```
AIStoreManager
      │
      ▼
LLMClient (abstract)  ── generate(system, user) → LLMResponse
      ├── OpenAICompatibleClient   任何 /v1/chat/completions（vLLM、Ollama、LM Studio…）
      │     └── OpenAIClient       api.openai.com（ChatGPT；預設）
      └── MockClient               離線啟發式 + 錯誤注入（僅驗證管線）
```

---

## 4. 儲存庫結構

```
marketpilot_E_Commerce/
├── README.md · MarketPilot_SPEC.md (v1 草案) · MarketPilot_SPEC_v2.md (本文件)
├── pyproject.toml                     extras: charts / stats / web / dev
├── .env.example                       OPENAI_API_KEY
├── configs/
│   ├── default.yaml                   模擬、需求、轉換、供應、成本、行動上下限、ai、evaluation、benchmark
│   ├── products.yaml                  product、competitor 隨機漫步
│   ├── events.yaml                    10 種事件 + difficulty_presets
│   └── strategies.yaml                fixed_strategy、rule_strategy
├── marketpilot/
│   ├── __init__.py                    __version__ = "1.0.0"
│   ├── runner.py                      run_episode() · DAILY_LOG_FIELDS · EpisodeResult
│   ├── env/        scenario.py · environment.py · state.py · demand.py · competitor.py · events.py · reward.py
│   ├── schemas/    action.py · observation.py · event.py
│   ├── strategies/ base.py · fixed_strategy.py · rule_strategy.py · ai_strategy.py · registry.py
│   ├── llm/        client.py · openai_client.py · mock_client.py · prompts.py
│   ├── evaluation/ metrics.py · stats.py · benchmark.py · report.py · dashboard.py
│   ├── utils/      config.py · seed.py · logger.py
│   └── web/        app.py · service.py · jobs.py · chat.py · static/{index.html, app.js, style.css}
├── scripts/        run_episode.py · run_benchmark.py · analyze_results.py · check_llm.py · serve.py · _bootstrap.py
├── tests/          test_environment · test_scenario · test_action_schema · test_strategies
│                   test_openai_client · test_benchmark · test_web · conftest
└── results/        評測輸出（git 追蹤 .gitkeep）
```

---

## 5. 設定系統

### 5.1 合併順序（低 → 高優先）

```
default.yaml < products.yaml < events.yaml < strategies.yaml
< difficulty preset（events.yaml: difficulty_presets[<difficulty>]，deep-merge）
< extra dict（Web UI 傳入的 ai 設定）
< CLI --set key.path=value（值以 YAML 解析）
```

`load_config(config_dir, difficulty, overrides, extra)` 於載入時同時呼叫 `load_dotenv()`：讀取專案根目錄 `.env` 的 `KEY=VALUE`，**既有環境變數優先**。

### 5.2 設定區塊一覽

| 區塊 | 用途 | 參考 |
|---|---|---|
| `simulation` | 天數、決策間隔、預設 seed、初始現金 | §6 |
| `scenario.difficulty` | `normal` / `volatile` / `crisis` | §8.4 |
| `product` / `competitor` | SKU 參數、競品基準價與隨機漫步 | §9.4 |
| `demand` / `conversion` | 需求與轉換模型參數 | §9.1–9.2 |
| `supplier` / `costs` | 前置期、單位成本、訂購/持有/缺貨/促銷成本 | §9.5–9.6 |
| `action_limits` | 5 個行動欄位的 min/max | §11 |
| `ai` | provider、model、溫度、token、結構化輸出、價格 | §13 |
| `fixed_strategy` / `rule_strategy` | 基準策略參數 | §12 |
| `events` / `difficulty_presets` | 事件機率、效果區間、難度覆蓋 | §8 |
| `evaluation` | adjusted score 懲罰係數、恢復判定 | §14.3 |
| `benchmark` | seeds、seed_start、天數、策略、結果目錄 | §15 |

完整預設值見附錄 A。

---

## 6. 時間模型與每日流程

一個 step = 一個模擬日。`MarketPilotEnv.reset()` 執行第 1 天的步驟 1–4 並回傳觀測；`step(action)` 執行當日 5–14 步，再執行下一天的 1–4 步。**所有策略的順序完全相同。**

```
 1. 產生基準市場條件        seasonality[day] · demand_noise[day]（來自 scenario）
 2. 套用當日有效事件        combine_effects(active, starting)；delay 事件推遲在途訂單
 3. 更新競品狀態            competitor_price = base × walk[day] × event_multiplier
                           unit_cost = base_unit_cost × cost_multiplier
                           demand_index = 過去 7 天 market_multiplier 平均
 4. 產生觀測                _build_observation()
 5. 策略決策                strategy.decide(deepcopy(observation))
 6. 驗證 / 裁切行動          clamp_action(raw, limits, fallback=last_action)
 7. 計算流量                §9.1
 8. 計算轉換率              §9.2
 9. 計算銷售                units_sold = min(round(orders), inventory)
10. 更新庫存                扣除銷售；若 reorder_quantity>0 下單（現金立即支付）
11. 更新現金/營收/成本      §9.6
12. 推進在途訂單            arrival_day ≤ day 的訂單入庫，更新加權平均庫存成本
13. 記錄                    DayRecord + daily log row
14. 進入下一天              day > days → done
```

**暖機歷史**：`reset()` 會以固定策略參數合成 7 天（day −6…0）穩態歷史，讓第 1 天的 7 日聚合值有意義。此歷史對所有策略相同。

---

## 7. 世界情境（WorldScenario）與公平性保證

### 7.1 資料結構（不可變 dataclass）

```python
WorldScenario(
    seed: int, days: int, difficulty: str,
    initial_state: {price, base_price, unit_cost, inventory, cash, competitor_base_price},
    event_schedule: tuple[Event, ...],      # 已排序 (start_day, event_id)
    competitor_noise: tuple[float, ...],    # index day-1 → 競品價格乘數
    base_demand_noise: tuple[float, ...],   # index day-1 → 需求雜訊乘數
    seasonality: tuple[float, ...],         # index day-1 → 週季節性
    event_schedule_hash: str,               # SHA-256（事件表）
    generator_version: "1.0",
)
```

可 `to_dict()` / `from_dict()` 序列化為 `results/<run>/scenarios/seed_<n>.json`，可完整重播。

### 7.2 種子派生（`utils/seed.py`）

每個隨機串流有獨立子 RNG：

```
sub_seed(seed, stream) = int(SHA256(f"{seed}:{stream}")[:8]) & 0x7FFF_FFFF_FFFF_FFFF
streams: "demand_noise" · "competitor_walk" · "event:<type>" ×10 · "mock_llm"
```

因此調整某一事件的機率**不會**改變其他串流的抽樣（測試 `test_event_streams_are_independent`）。

### 7.3 串流生成

| 串流 | 公式 |
|---|---|
| seasonality | `weekly_seasonality[(day−1) mod 7]`，預設 `[1.00,0.95,0.95,1.00,1.05,1.15,1.10]` |
| demand noise | `max(noise_floor, N(1, noise_std))`；預設 std 0.10、floor 0.30 |
| competitor walk | 均值回歸對數漫步 `x ← x(1−θ) + N(0, walk_std)`，乘數 `clip(exp(x), walk_min, walk_max)`；預設 θ=0.2, std=0.02, [0.8, 1.2] |
| events | 見 §8.2 |

### 7.4 公平性規則（AC-01）

```
seed 1001 → generate WorldScenario S
S → AI      （replay）
S → Fixed   （replay）
S → Rule    （replay）
```

`run_benchmark` 對每個 seed 只產生一次 scenario 並依序交給每個策略。測試 `test_same_seed_identical_world_across_strategies` 逐日斷言三個策略的 `competitor_price`、`demand_noise`、`unit_cost`、`event_names` 完全相同。

---

## 8. 隨機事件引擎

### 8.1 事件記錄

```python
Event(event_id="EV003-competitor_price_cut", type, start_day, duration, severity∈[0,1], parameters={...})
end_day = start_day + max(duration,1) − 1
```

`severity` 記錄主要效果在其設定區間內的位置（對「越低越糟」的事件取反向），使 severity 高 = 衝擊大。

### 8.2 生成演算法

```
for etype in EVENT_TYPES（固定順序 → id 穩定）:
    rng = make_rng(seed, f"event:{etype}")
    busy_until = 0
    for day in 1..days:
        draw = rng.random()                    # 每天固定消耗 1 次抽樣
        if day <= busy_until or draw >= daily_probability: continue
        event = sample(rng, ...)               # severity、各效果區間、duration
        busy_until = event.end_day             # 同類型事件不重疊；不同類型可重疊
```

### 8.3 事件表（預設 `normal`）

| # | type | 日機率 | 持續天數 | 效果（區間內抽樣） | 效果對象 |
|---|---|---|---|---|---|
| 01 | `competitor_price_cut` | 0.015 | 3–10 | `multiplier` 0.75–0.90 | 競品價格 × |
| 02 | `competitor_ad_blitz` | 0.010 | 3–7 | `traffic_multiplier` 0.70–0.90 | 流量 × |
| 03 | `viral_demand_spike` | 0.010 | 1–5 | `demand_multiplier` 1.5–3.0 | 需求 × |
| 04 | `negative_review` | 0.008 | 3–14 | `conversion_multiplier` 0.60–0.85 | 轉換率 × |
| 05 | `supplier_delay` | 0.010 | 即時 | `extra_delay_days` 3–10 | 在途訂單到貨日 + |
| 06 | `supplier_cost_increase` | 0.005 | 7–30 | `cost_multiplier` 1.05–1.25 | 單位成本 × |
| 07 | `platform_traffic_surge` | 0.006 | 1–7 | `traffic_multiplier` 1.5–3.5 | 流量 × |
| 08 | `platform_traffic_drop` | 0.006 | 1–5 | `traffic_multiplier` 0.40–0.80 | 流量 × |
| 09 | `seasonal_demand_change` | 0.004 | 7–30 | `demand_multiplier` 0.7–1.8 | 需求 × |
| 10 | `logistics_disruption` | 0.006 | 3–10（`cost_effect_duration_days`） | `extra_delay_days` 2–7；`order_cost_multiplier` 1.05–1.20 | 到貨日 +；訂購成本 × |

**逆境事件（adaptability 統計用）**：01, 02, 04, 05, 06, 08, 10。

### 8.4 難度預設（overlay 於 `events` 與 `demand`/`competitor`）

| 參數 | normal | volatile | crisis |
|---|---|---|---|
| `demand.noise_std` | 0.10 | 0.18 | 0.22 |
| `competitor.walk_std` | 0.02 | 0.035 | 0.04 |
| 事件日機率 | 表 8.3 | 約 ×2（0.008–0.030） | 約 ×3–5（0.010–0.050） |
| 額外加劇 | — | seasonal 0.6–2.0 | price_cut 0.70–0.85；delay 5–14 天；cost 1.10–1.35；traffic_drop 0.30–0.70；logistics delay 3–10 |

### 8.5 效果組合策略（`env/events.py`，確定性）

```
乘法效果          → 相乘（demand / traffic / conversion / competitor / unit_cost / order_cost）
延遲              → 事件「開始日」當天，對每筆 arrival_day ≥ day 的在途訂單加上 extra_delay_days（只加一次）
價格覆蓋事件      → V1 無
market_multiplier = demand_multiplier × traffic_multiplier   （事後可觀測，餵入 demand_index）
```

### 8.6 可觀測性

- 策略看到的 `active_events` 只含 `event_id`、`type`、`remaining_days`、`observed_effect`（固定文字，不洩漏幅度）。
- **延遲事件僅在實際命中在途訂單時才可觀測**（`_delay_hits`）；沒有訂單時對策略完全不可見（測試 `test_supplier_delay_without_orders_is_invisible`）。
- 未來事件永不出現在觀測中（AC-03，§10.3）。

---

## 9. 環境模型

### 9.1 流量（市場面）

```
base_traffic  = base_daily_demand / base_conversion                       = 100 / 0.035
market_mult   = seasonality × demand_noise × event_demand × event_traffic
competitor_effect = exp(−β · price_gap),   price_gap = (price − competitor_price) / competitor_price,  β = 1.0
ad_effect     = (1 + α·ln(1 + ad/k)) / (1 + α·ln(1 + ref_ad/k)),   α = 0.4, k = 200, ref_ad = 1000
                → 參考預算時 = 1.0；零支出 ≈ 0.58；5000 ≈ 1.38；穩態最適約 $600–950/日
promo_traffic = 1 + 0.15 · promotion_level
traffic       = base_traffic × market_mult × competitor_effect × ad_effect × promo_traffic
```

### 9.2 轉換率（報價面）

```
price_effect     = (price / reference_price) ^ (−elasticity),   reference_price = 100, elasticity = 1.5
coupon_factor    = 1 + 2.0 · coupon_discount
promotion_factor = 1 + 0.15 · promotion_level
conversion       = clip(base_rate × price_effect × coupon_factor × promotion_factor × event_conversion, 0, max_rate)
                   base_rate = 0.035, max_rate = 0.20
```

**校準**：參考價、參考廣告預算、無折價/促銷/事件、競品與我方同價時 `traffic × conversion = base_daily_demand = 100`（測試 `test_base_demand_calibration`）。

### 9.3 銷售與缺貨

```
customer_orders = traffic × conversion
units_sold      = min(round(customer_orders), inventory)
lost_sales      = max(0, customer_orders − inventory)
stockout        = round(customer_orders) > inventory
```

### 9.4 競品（外生）

```
competitor_price = round(base_price(98) × walk_multiplier[day] × competitor_price_multiplier, 2)
```

競品不是智能體；同一 seed 的軌跡對所有策略完全相同。

### 9.5 庫存與供應鏈

- 下單當日建立 `Order(quantity, placed_day, arrival_day = day + lead_time(7), unit_cost = 當日單位成本)`。
- **現金**於下單時支付 `quantity × unit_cost`；**利潤**於售出時以加權平均庫存成本計 COGS。
- 訂購成本 = `(order_fixed_cost(200) + order_variable_cost(1.0) × qty) × order_cost_multiplier`。
- 到貨（`arrival_day ≤ day`）時更新 `avg_inventory_cost = (inv×avg + qty×order_cost) / (inv+qty)`。
- 延遲事件可推遲 `arrival_day`；`delayed_days` 記錄累計延遲。

### 9.6 財務（`env/reward.py`）

```
gross_revenue    = units_sold × price
coupon_cost      = gross_revenue × coupon_discount
revenue          = gross_revenue − coupon_cost                      （已淨額，不重複扣）
COGS             = units_sold × avg_inventory_cost
gross_profit     = revenue − COGS
promotion_cost   = promotion_daily_cost(100) × level + promotion_fee_rate(0.10) × level × revenue
holding_cost     = ending_inventory × 0.05
stockout_penalty = lost_sales × 10                                   （商譽損失：扣利潤，不扣現金）
ordering_cost    = 見 §9.5
net_profit       = gross_profit − ad_spend − promotion_cost − holding_cost − stockout_penalty − ordering_cost
cash_flow        = revenue − ad_spend − promotion_cost − holding_cost − ordering_cost − purchase_cash_out
```

`ad_budget` 每日全額支出（`ad_spend = ad_budget`）。會計恆等式由 `test_daily_accounting_identity` 驗證。

---

## 10. 觀測（Observation）Schema

### 10.1 欄位

| 群組 | 欄位 |
|---|---|
| 時間 | `day`, `days_total` |
| 目前狀態 | `price`, `base_price`, `unit_cost`, `inventory`, `inventory_in_transit`, `pending_orders[{quantity, placed_day, expected_arrival_day}]`, `inventory_days_of_supply`（= inventory / sales_7d_avg，上限 999）, `competitor_price`, `competitor_price_gap`, `demand_index`, `cash`, `cumulative_profit` |
| 昨日 | `traffic`, `conversion_rate`, `sales_units`, `lost_sales`, `stockout` |
| 7 日 | `traffic_7d_avg`, `conversion_7d_avg`, `sales_7d_avg`, `revenue_7d`, `profit_7d`, `price_change_7d`, `sales_change_7d`, `traffic_change_7d`, `conversion_change_7d`（相對前一個 7 日視窗） |
| 30 日 | `profit_30d`, `sales_30d_avg`, `stockout_days_30d` |
| 行動相關 | `ad_budget`, `ad_spend`, `coupon_discount`, `promotion_level`, `last_action{5 欄}` |
| 事件 | `active_events[{event_id, type, remaining_days, observed_effect}]` |
| 靜態 | `cost_structure{unit_cost, lead_time_days, order_fixed_cost, order_variable_cost, holding_cost_per_unit_day, stockout_penalty_per_unit, promotion_daily_cost, promotion_fee_rate}`, `action_limits{欄位:{min,max}}` |

### 10.2 `demand_index`

過去 7 天已實現的外生市場乘數（`market_multiplier`）平均——**只用歷史**，無未來洩漏。

### 10.3 無未來洩漏（AC-03）

`assert_no_future_leakage(observation, day)` 於 runner 每日執行：
- 禁止鍵：`future_event(s)`, `event_schedule`, `scenario`, `demand_noise`, `competitor_noise`, `seed`（遞迴檢查）。
- `active_events` 內不得有 `start_day > day`。

策略收到的是 `deepcopy`，修改它無法影響模擬器（AC-04，`test_strategy_cannot_mutate_environment`）。

---

## 11. 行動（Action）Schema 與防護

### 11.1 Schema（三種策略共用）

```json
{ "price": 99.0, "ad_budget": 500.0, "coupon_discount": 0.05, "reorder_quantity": 100, "promotion_level": 0.2 }
```

| 欄位 | 型別 | 預設上下限 |
|---|---|---|
| `price` | float | 50 – 150 |
| `ad_budget` | float | 0 – 5000 |
| `coupon_discount` | float (ratio) | 0.0 – 0.30 |
| `reorder_quantity` | int | 0 – 1000 |
| `promotion_level` | float | 0.0 – 1.0 |

### 11.2 `clamp_action(raw, limits, fallback) → (Action, had_error)`

1. `raw` 非 mapping → 整個使用 `fallback`，`had_error=True`（無 fallback 則拋 `ActionValidationError`）。
2. 每欄位以別名查找（`selling_price`, `advertising_budget`, `coupon`, `reorder`, `promo_level`…），接受字串/`$`/`%`/千分位。
3. 比率欄位若給 `1 < x ≤ 100` 視為百分比 → `/100`。
4. 缺漏/無法解析欄位 → 取 `fallback` 該欄位，`had_error=True`。
5. 超出範圍 → **靜默裁切**（不算錯誤，另以 `action_clipped` 記錄）。
6. `reorder_quantity` 四捨五入為整數。

### 11.3 `parse_action_text(text)`（parser repair）

依序嘗試：```` ```json ```` 圍欄 → 整段 → 第一個平衡 `{…}` → 到最後一個 `}`；每個候選先 `json.loads`，失敗則修補（尾逗號、單引號、裸 key）；可解開 `{"action": {...}}` 包裝；最後以正則從散文抽 `key: number`。全部失敗回傳 `None`。

### 11.4 AI 失敗保護（AC-05）

```
LLM 例外 / 無法解析 / 欄位缺漏
  → fallback = 前一日有效行動（第 1 天 = 觀測中的 last_action，reorder=0）
  → 記錄 ai_action_error = true（及 llm_error 文字）
  → episode 絕不中斷
```

---

## 12. 策略

### 12.1 介面（`strategies/base.py`）

```python
class Strategy(ABC):
    name: str
    def reset(self, seed: int) -> None
    def decide(self, observation: dict) -> dict      # 回傳 5 欄位 action dict
    def metadata(self) -> dict                        # 寫入結果 metadata
    last_info: dict                                   # 每日診斷，由 runner 併入 daily log
```

註冊表：`registry.build_strategy(name, config)`，接受 `ai` / `fixed` / `rule_based`（別名 `rule`）。

### 12.2 Fixed（策略 B）

每日回傳 `fixed_strategy` 常數：`price 100, ad_budget 1000, coupon 0.05, reorder 100, promotion 0.20`。

### 12.3 Rule-Based（策略 C）

純函數 `(observation, 自身前一行動, config)`，無 RNG、無 LLM。參數見 `strategies.yaml: rule_strategy`。

**定價（依序取第一個命中）**

```
gap = (cur_price − competitor) / competitor
IF gap > 0.10                                   → price ×= 0.95        [competitor_undercut]
ELIF days_of_supply > 30                        → price ×= 0.97        [overstock]
ELIF demand_index > 1.30 AND dos < 10           → price ×= 1.05        [hot_demand_low_supply]
ELIF price < base_price AND 回升 3% 後 gap ≤ 0.10 → price = min(base, price×1.03)  [recover_to_base]（實作新增；設 0 關閉）
ELSE                                            → keep
最後：price ≥ unit_cost × 1.25 / (1 − coupon)    [margin_floor]（含折價券的毛利底線）
```

**廣告**

```
IF conversion_7d_avg > 0.05 AND dos > 14 → ad ×= 1.20
IF conversion_7d_avg < 0.02              → ad ×= 0.80
```

**折價券**

```
IF sales_change_7d < −20% → 0.10 ; ELIF dos > 35 → 0.08 ; ELSE → 0.05
```

**庫存**

```
safety_stock  = sales_7d_avg × 7
reorder_point = sales_7d_avg × lead_time + safety_stock
target_stock  = sales_7d_avg × 30
IF inventory + in_transit < reorder_point → reorder = max(20, round(target − position))
```

**促銷**：固定 0.20。`last_info` 記錄觸發規則名（`rule_price`, `rule_ad`, `rule_coupon`, `rule_reorder_point`）。

### 12.4 AI 店長（策略 A）

**每日流程**

```
observation → build_user_prompt()（精簡 JSON）→ LLMClient.generate_action()
→ 結構化輸出 / tool 參數 / parse_action_text → clamp_action(fallback=前一日行動)
→ 累計 llm_calls / tokens / latency / cost / errors → last_info
```

**System prompt（`llm/prompts.py`，`prompt_version = "v1"`）**：宣告角色（線上商店經理）、目標（最大化長期累積利潤，避免不必要缺貨、過量庫存與價格不穩）、五個控制項、只依觀測決策、不預測隱藏事件、只回傳 JSON 行動、並說明環境規則（前置期與下單付款、持有/缺貨成本、折價券、促銷費用、廣告遞減、超限裁切）。

**User prompt**：`Store and market observation (JSON): {day, days_total, current{...}, yesterday{...}, trailing_7d{...}, trailing_30d{...}, last_action, active_events, cost_structure, action_limits}` + `Respond with the action JSON only.`

**記憶策略（V1）**：只給目前狀態、7 日/30 日聚合、上一行動、有效事件；不給完整歷史（降低 token、延遲、成本、context drift）。

**每日診斷（併入 daily log）**：`ai_action_error`, `llm_error`, `llm_latency_ms`, `input_tokens`, `output_tokens`, `estimated_llm_cost`, `llm_raw_output`（截 2000 字；CSV 不含）。

---

## 13. LLM 供應商層

### 13.1 契約

```python
class LLMClient:
    def generate(self, system_prompt, user_prompt) -> LLMResponse(text, input_tokens, output_tokens, latency_ms, raw, tool_arguments)
    def generate_action(self, system_prompt, observation) -> dict | None   # tool_arguments 優先，否則 parse_action_text
    def estimate_cost(in_tok, out_tok) = in/1e6 × input_price_per_m + out/1e6 × output_price_per_m
    def metadata() -> {provider, model, temperature, max_tokens, ...}
```

工廠：`build_llm_client(ai_cfg)` 依 `ai.provider`：`openai`/`chatgpt` → `OpenAIClient`；`openai_compatible`/`vllm`/`ollama` → `OpenAICompatibleClient`；`mock` → `MockClient`。

### 13.2 `OpenAICompatibleClient`

- 純標準函式庫（`urllib`），無 SDK 相依；POST `{base_url}/chat/completions`，`Authorization: Bearer <key>`。
- 金鑰查找順序：`ai.api_key` → `os.environ[ai.api_key_env]` → provider 預設環境變數 → `"EMPTY"`。
- 參數：`temperature`, `top_p`, `seed`, `max_tokens`, `timeout_seconds`(60), `max_retries`(2, 指數退避 ≤ 8s), `json_mode`(json_object), `use_tools`(function calling `submit_store_action`), `extra_body`。

### 13.3 `OpenAIClient`（ChatGPT，預設）

| 行為 | 說明 |
|---|---|
| 金鑰缺失 | 建構時即拋 `LLMError`（明確訊息） |
| Token 參數 | 預設送 `max_completion_tokens`；收到 400 指出不支援時自動改回 `max_tokens`（反之亦然） |
| 推理模型 | o1/o3/o4、gpt-5 系列拒絕 `temperature`/`top_p` → 收到 400 自動移除並重試（不消耗重試次數）；支援 `reasoning_effort: low/medium/high` |
| 結構化輸出 | `structured_output: true`（預設）→ `response_format = json_schema(strict=True)`，schema 為 5 欄位、`additionalProperties: false`（範圍由 clamp 負責，因 strict 模式不支援 min/max）；不支援時自動降級 `json_object` |
| 錯誤分類 | 401/403 → 認證失敗；404 → 模型不存在/無權限；其餘重試後拋 `LLMError` |
| 成本 | 預設 gpt-4o-mini 價格 `$0.15 / $0.60 per 1M`；換模型需更新 |

### 13.4 `MockClient`

離線啟發式店長（依 days_of_supply、競品價、轉換率調整），輸出 ```` ```json ```` 圍欄文字；`mock.error_rate` 注入 5 種畸形輸出以測試 fallback；以 `make_rng(seed, "mock_llm")` 決定性。**僅驗證管線，其數字不可當作 AI 基準。**

### 13.5 成本估算參考

一個 90 天 episode ≈ 90 次呼叫 × (~750 in + ~40 out tokens) ≈ 70k tokens ≈ $0.01（gpt-4o-mini）；50 seeds ≈ 4,500 次呼叫 ≈ $0.60，15–40 分鐘。

---

## 14. 評估指標

### 14.1 每 episode 指標（`compute_episode_metrics`，AC-07 必備集合）

| 類別 | 指標 | 定義 |
|---|---|---|
| **主要** | `cumulative_net_profit` | Σ net_profit |
| 營收 | `revenue`, `gross_revenue`, `gross_profit`, `cogs`, `units_sold` | 累計 |
| 效率 | `conversion_rate` = Σorders/Σtraffic；`average_selling_price` = gross_revenue/units；`average_effective_price` = revenue/units；`advertising_spend`；`roas` = revenue/ad |
| 庫存 | `inventory_holding_cost`, `average_inventory`, `ending_inventory`, `inventory_turnover` = units/avg_inv, `stockout_days`, `stockout_rate`, `lost_sales`, `service_level` = units/(units+lost), `replenishment_orders`, `units_ordered` |
| 成本明細 | `coupon_cost`, `promotion_cost`, `stockout_penalty`, `ordering_cost`, `ending_cash` |
| 穩定性 | `price_volatility` = std(price)；`price_change_frequency`, `mean_absolute_price_change`；`ad_budget_change_frequency`, `mean_absolute_ad_change`；`coupon_change_frequency`；`inventory_order_variance`；`action_volatility` = 5 欄位 mean|Δ|/range 的平均 |
| 調整分數 | `adjusted_score` = profit − λ_price(50)·price_volatility − λ_stockout(200)·stockout_days；`price_penalty`, `stockout_penalty_score` 分開報告 |
| AI 成本 | `llm_calls`, `input_tokens`, `output_tokens`, `inference_latency_ms`, `estimated_llm_cost`, `ai_action_errors`, `action_clipped_days` |
| 適應性 | 見 14.2 |

### 14.2 適應性（shock）指標

以 `recovery_window_days = 7`、`recovery_threshold = 0.95`，對每個**可觀測**事件（曾出現在 `event_ids`）：

```
pre_event_profit    = 事件前 7 天 net_profit 平均
during_event_profit = 事件期間平均
post_event_profit   = 事件後 7 天平均
profit_drop_ratio   = (pre − during) / |pre|
event_period_regret = pre × 事件天數 − Σ during
recovery_days       = 事件結束後第幾天 7 日滾動平均 ≥ 0.95 × pre（找不到 → censored）
```

彙總：`n_events`, `n_events_evaluated`, `n_adverse_events`, `mean_profit_drop_ratio(_adverse)`, `mean_recovery_days(_adverse)`, `recovery_rate`, `total_event_regret`, `event_details[]`（寫入 `event_recovery.csv`）。

---

## 15. 批次評測與統計

### 15.1 流程（`run_benchmark`）

```
for seed in seeds:
    scenario = generator.generate(seed, days)   → 寫 scenarios/seed_<n>.json
    for strategy in strategies:                  （策略只建構一次，每 seed reset）
        result = run_episode(config, scenario, strategy)
        → episode_metrics · event_rows · append daily_logs.csv
summary = aggregate_results(...)  → summary.json · metadata.json · config.yaml
```

### 15.2 彙總（`aggregate_results`）

- **每策略描述統計**（`describe`）：`n, mean, median, std, min, max, ci95_low, ci95_high`（t 分布 CI），套用在 §14.1 的 45 個指標上。
- **配對比較**（僅共同 seed）：`ai_vs_fixed`, `ai_vs_rule_based`, `rule_based_vs_fixed`：
  `n, mean_diff, median_diff, std_diff, ci95, win_rate, tie_rate, uplift_pct = mean_diff/|mean(b)|×100, paired_t{t,p_value,df}, wilcoxon{statistic,p_value,n}`；另對 `adjusted_score, stockout_days, mean_recovery_days, mean_profit_drop_ratio, price_volatility` 各做一組。
- **勝率**：每 seed 最高累積淨利者得 1 勝；平手另計 `ties`。
- **統計實作**：有 SciPy 用 SciPy；否則純 Python（t 分布經正規化不完全 beta 函數；Wilcoxon 常態近似含 tie 修正）。

### 15.3 儀表板卡片（`summary.dashboard`）

`ai/rule/fixed_average_profit`, `ai_vs_rule_uplift_pct`, `ai_vs_fixed_uplift_pct`, `ai_win_rate`, `rule_win_rate`, `fixed_win_rate`, `ai_vs_rule_win_rate`, `ai_vs_fixed_win_rate`, `stockout_rate{策略}`, `average_recovery_days{策略}`, `ai_inference_cost_total`, `ai_inference_cost_per_episode`, `ai_roi = Σ(AI−Rule profit)/AI cost`。

---

## 16. 輸出格式

### 16.1 評測目錄

```
results/<run_name>/
  daily_logs.csv          每策略 × seed × 天一列（§16.2）
  episode_metrics.csv     每策略 × seed 一列（§14.1 + run_id, model, provider, prompt_version, event_schedule_hash）
  event_recovery.csv      每事件一列（§14.2 event_details）
  scenarios/seed_*.json   WorldScenario（可重播）
  summary.json            §15.2–15.3 + run{run_name, results_dir, seeds, strategies, days, difficulty, elapsed_seconds}
  metadata.json           §16.3
  config.yaml             實際生效的完整設定
  report.md · charts/*.png · dashboard.html   （§17）
```

單次模擬：`results/episodes/<strategy>_seed<seed>/{daily_log.csv, metrics.json, metadata.json, scenario.json}`。

### 16.2 Daily log 欄位（`DAILY_LOG_FIELDS`，順序固定）

```
run_id seed strategy day
price competitor_price traffic conversion customer_orders units_sold lost_sales stockout
inventory inventory_in_transit reorder_quantity order_arrival_day units_arrived
ad_budget ad_spend coupon_discount promotion_level unit_cost avg_inventory_cost
gross_revenue coupon_cost revenue cogs gross_profit promotion_cost holding_cost stockout_penalty ordering_cost
net_profit cash_flow cumulative_profit cash
demand_index market_multiplier seasonality demand_noise event_names event_ids
action_clipped action_error ai_action_error
llm_latency_ms input_tokens output_tokens estimated_llm_cost llm_error
rule_price rule_ad rule_coupon rule_reorder_point
```

布林寫成 0/1；list/dict 寫成 JSON 字串；浮點四捨五入到 6 位。

### 16.3 metadata.json（重現性，AC 相關）

`marketpilot_version, timestamp(UTC), git_commit, config_hash(SHA-256 canonical JSON), simulation_config, difficulty, sim_days, seeds, strategies{name: metadata()}, model{provider, model, temperature, top_p, max_tokens, seed, prompt_version}, event_schedule_hashes{seed: hash}, run_name`。

---

## 17. 報告、圖表與儀表板

### 17.1 必備圖表（`report.make_charts`，matplotlib，可選）

1. 累積淨利 vs 天 2. 營收 vs 天 3. 售價 vs 競品價 4. 庫存 vs 天 5. 銷量 vs 天 6. 廣告支出 vs 天 7. 事件時間軸 8. 各策略利潤箱型圖 9. 勝率長條 10. 衝擊恢復比較（恢復天數 / 利潤下降比 / 恢復率）

顏色固定：AI `#2a78d6`、Fixed `#eb6834`、Rule `#1baf7a`、競品 `#898781`（虛線）；事件以類型色陰影標示。所有圖以 `--seed` 指定單一世界，否則為跨 seed 平均。

### 17.2 `report.md`

Dashboard 卡片表、主要指標描述統計、配對比較（含 p 值）、次要指標、穩定性、適應性、AI 成本、圖表連結。

### 17.3 `dashboard.html`

單一自含 HTML（資料內嵌、inline SVG、無外部 JS），支援亮/暗主題、seed 切換（事件陰影）、策略開關、hover 提示、KPI 卡、四張統計表。由 `build_dashboard(results_dir)` 產生；Web API 可即時重建。

---

## 18. 命令列介面

| 指令 | 說明 |
|---|---|
| `python scripts/run_episode.py --strategy ai\|fixed\|rule_based [--seed 42] [--days 90] [--difficulty …] [--set k=v …] [--out DIR] [--quiet]` | 單次模擬，印每日列與摘要 |
| `python scripts/run_benchmark.py [--seeds 50] [--seed-start 1001] [--seed-list …] [--days 90] [--strategies …] [--difficulty …] [--run-name …] [--no-daily-logs] [--no-report] [--set k=v …]` | 批次評測（AC-08） |
| `python scripts/analyze_results.py results/<run> [--seed N]` | 重新彙總 / 重繪圖表 |
| `python scripts/check_llm.py [--set ai.model=…] [--day 10] [--show-prompt]` | 送一筆真實觀測驗證金鑰/模型/格式 |
| `python scripts/serve.py [--host 127.0.0.1] [--port 8000] [--open] [--reload]` | 啟動 Web UI |
| `pytest -q` | 全部測試 |

---

## 19. Web 應用

### 19.1 架構

- **後端**：FastAPI（`marketpilot/web/app.py`），Pydantic 請求模型，`JobManager` 以 daemon thread 執行 episode / benchmark，事件以 append-only list 保存，支援 polling（`?since=cursor`）與 SSE。
- **前端**：`static/index.html + app.js + style.css`，無建置流程；SVG 圖表自繪；設定存 `localStorage`；SSE 由 `EventSource` 接收。
- **Web 層只做編排**：不重寫任何模擬 / 策略 / 評測邏輯，輸出格式與 CLI 完全相同。

### 19.2 頁面

| # | 頁面 | 功能 |
|---|---|---|
| 1 | 設定 · ChatGPT 連線 | provider / model / temperature / max_tokens / reasoning_effort / base_url / token 價格 / 結構化輸出；API 金鑰寫入 `.env`（只回傳遮罩）；「送出一次觀測」顯示原始回覆、驗證後行動、可選 prompt |
| 2 | 單次模擬 | seed / 天數 / 難度 / 策略多選；SSE 逐日串流；世界卡（事件列表）；即時 KPI；累積淨利、售價 vs 競品、庫存、銷量、廣告（事件陰影）；AI 每日決策表（含模型回覆、錯誤狀態）；逐日紀錄；最終指標比較表；可取消 |
| 3 | 批次評測 | seed 數 / 起始 / 天數 / 難度 / run 名稱 / 策略；事前估算 LLM 呼叫數、費用、時間；每 episode 利潤即時列表與折線；即時平均與 AI vs Rule 勝率；完成後卡片 + 直達儀表板 / 分析助理；可取消 |
| 4 | 結果儀表板 | 列出 `results/` 所有 run（時間、seeds、模型、三策略均利、uplift、勝率）；內嵌 `dashboard.html`；Markdown 報告（內建輕量渲染器，圖片經 `/files/`）；重新產生圖表；另開視窗 |
| 5 | ChatGPT 分析助理 | 選擇分析對象（評測 run 或最近一次單次模擬）、模型；建議問題；多輪對話；顯示 model / tokens / 延遲 / 成本 |

### 19.3 REST API（前綴 `/api`，OpenAPI 於 `/api/docs`）

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/health` | `{ok, version, time}` |
| GET | `/config?difficulty=` | 公開設定（不含金鑰）+ providers / difficulties / strategies |
| POST | `/config/preview` | 套用 `AISettings` 後的設定預覽 |
| GET | `/settings/keys` | `OPENAI_API_KEY` 的 `{configured, masked}` |
| POST | `/settings/keys` | `{env, value}` 寫入 `.env` 並匯出至程序環境 |
| DELETE | `/settings/keys/{env}` | 移除 |
| POST | `/llm/check` | `{ai?, day, show_prompt}` → `{ok, provider, model, latency_ms, tokens, estimated_cost, raw_reply, action, had_missing_fields, error?}` |
| POST | `/episodes` | `EpisodeRequest{seed, days(1–365), difficulty?, strategies[], ai?, overrides[], save}` → Job |
| POST | `/benchmarks` | `BenchmarkRequest{seeds(1–500), seed_start, seed_list?, days, difficulty?, strategies[], run_name?, report, ai?, overrides[]}` → Job（含 `params.resolved_seeds`） |
| GET | `/jobs` | 所有 job（新→舊） |
| GET | `/jobs/{id}?since=&events=&result=` | Job 狀態 + 自 cursor 起的事件 + 結果 |
| POST | `/jobs/{id}/cancel` | 請求取消（409 若已結束） |
| GET | `/jobs/{id}/stream?since=` | SSE：每事件 `id/event/data`，結束送 `event: end`，閒置送 keep-alive 註解 |
| GET | `/runs` | 評測列表（摘要卡） |
| GET | `/runs/{name}` | `summary.json` + `metadata.json` |
| GET | `/runs/{name}/dashboard?rebuild=` | `dashboard.html`（缺則即時建立） |
| GET | `/runs/{name}/report` | `report.md`（缺則產生，無圖） |
| POST | `/runs/{name}/rebuild` | 重建報告與圖表 |
| GET | `/runs/{name}/files/{path}` | 靜態檔（限制於 run 目錄內，防路徑穿越） |
| POST | `/chat` | `{messages[], run_name?, job_id?, ai?, model?, temperature}` → `{reply, model, input_tokens, output_tokens, latency_ms, estimated_cost, context}` |
| GET | `/`、`/static/*` | 前端 |

`AISettings` 欄位：`provider, model, base_url, api_key_env, temperature, top_p, max_tokens, seed, timeout_seconds, max_retries, structured_output, use_tools, reasoning_effort, input_price_per_m, output_price_per_m, mock{error_rate}`。

### 19.4 Job 生命週期與事件

```
status: queued → running → done | error | cancelled
progress: 0..1 ; message ; error ; result ; events[]
```

| Job | 事件 `kind` | payload |
|---|---|---|
| 共通 | `status` | `{status, error?}` |
| 共通 | `progress` | `{progress, message}` |
| 共通 | `cancel_requested` | — |
| episode | `scenario` | `{seed, days, difficulty, events[{type,start,duration,severity}], initial_state, strategies}` |
| episode | `strategy_start` | `{strategy, model}` |
| episode | `day` | `{row: STREAM_FIELDS 子集（含 llm_raw_output ≤ 600 字）}` |
| episode | `strategy_done` | `{strategy, metrics}` |
| benchmark | `episode` | `{seed, strategy, profit}` |
| benchmark | `log` | `{message}` |

episode 結果：`{seed, days, difficulty, strategies{name: {metrics, metadata, event_details, output_dir?}}}`；benchmark 結果：`{run_name, results_dir, summary}`。取消於下一個 `on_day` / progress 回呼生效（`JobCancelled`）。

### 19.5 安全與資料保護

- 金鑰只寫入 git-ignored `.env` 與程序環境；所有回應只含遮罩值；`public_config` 移除 `api_key`。
- `run_name` 僅允許 `[A-Za-z0-9._-]{1,80}`；檔案存取解析後必須位於 run 目錄內。
- 無認證機制：預設綁定 `127.0.0.1`；`--host 0.0.0.0` 僅限可信網路。
- 未捕捉例外統一回 500 `{detail}` 並寫入 log。

---

## 20. ChatGPT 分析助理

### 20.1 目的

讓使用者以自然語言詢問評測或單次模擬的結果（例：「AI 在哪些 seed 輸給規則策略？」、「AI ROI 值不值得？」）。

### 20.2 實作（`web/chat.py`）

- 重用 `build_llm_client(ai_cfg)`（同樣的金鑰/base_url/400 自適應邏輯），但關閉 `structured_output` / `use_tools` / `json_mode`，改送完整訊息列表：`[system] + 最近 30 則 user/assistant（每則 ≤ 6000 字）`。
- System prompt：說明 MarketPilot、三策略、配對統計，要求**只依附帶資料回答**、量化、簡潔、以使用者語言回覆（中文提問 → 繁體中文）。
- `provider = mock` 或非 OpenAI 相容 client → 回傳離線提示訊息（不呼叫網路）。
- 回傳 `reply, model, tokens, latency_ms, estimated_cost`。

### 20.3 上下文壓縮

| 對象 | 內容 | 上限 |
|---|---|---|
| 評測 run（`compact_run_context`） | `run, model, dashboard_cards, win_rates, per_strategy_metrics(25 指標 × n/mean/median/std/ci95), paired_comparisons(精簡), cumulative_profit_by_seed, events_by_seed(≤30 seeds)` | 12,000 字；超過依序移除 `events_by_seed` → `cumulative_profit_by_seed` |
| 單次模擬 job（`compact_episode_context`） | `seed, days, difficulty, metrics{策略}, daily_trace_sampled{策略: ≤30 個取樣日 + 事件}` | 12,000 字；超過移除 trace |

---

## 21. 測試與驗收標準

### 21.1 驗收標準與對應測試

| AC | 標準 | 測試 |
|---|---|---|
| AC-01 | 同 seed → 三策略收到相同需求雜訊、競品軌跡、事件排程 | `test_same_seed_identical_world_across_strategies`, `test_same_seed_same_scenario` |
| AC-02 | 不同 seed → 不同情境 | `test_different_seeds_differ` |
| AC-03 | 觀測無未來資訊 | `test_observation_has_no_future_information`, runner 每日 `assert_no_future_leakage` |
| AC-04 | 策略隔離（不可改模擬器、seed、事件） | `test_strategy_cannot_mutate_environment`, `test_scenario_is_immutable` |
| AC-05 | 無效 AI 輸出不中斷 episode | `test_ai_invalid_output_never_crashes`, `test_mock_client_error_rate_triggers_fallback`, `test_auth_failure_becomes_llm_error_and_strategy_survives` |
| AC-06 | 基準策略重播一致 | `test_baselines_replay_identically`, `test_fixed_strategy_is_constant`, `test_benchmark_reproducible` |
| AC-07 | 每 episode 產生全部指標與日誌 | `test_episode_metrics_complete`（`REQUIRED_METRICS`）, `test_metrics_are_finite` |
| AC-08 | 可批次評測 | `test_batch_benchmark_end_to_end`, `test_benchmark_job_and_results_browsing` |
| AC-09 | 會計恆等式與需求校準 | `test_daily_accounting_identity`, `test_base_demand_calibration`, `test_replenishment_lead_time_and_cash` |
| AC-10 | 十種事件皆可發生、同型不重疊、串流獨立 | `test_all_ten_event_types_can_occur`, `test_event_fields_and_no_same_type_overlap`, `test_event_streams_are_independent` |
| AC-11 | OpenAI client 參數自適應與結構化輸出 | `test_payload_uses_strict_schema_and_new_token_param`, `test_reasoning_model_drops_temperature_and_retries`, `test_legacy_model_falls_back_to_max_tokens`, `test_generate_action_parses_structured_and_tool_replies` |
| AC-12 | Web API：金鑰遮罩、job 串流、SSE、取消、結果瀏覽、路徑防護、chat 上下文 | `tests/test_web.py`（9 項） |

### 21.2 測試政策

- 測試**永不**呼叫真實 LLM（`conftest` 強制 `ai.provider = mock`）。
- Web 測試以 `TestClient` 執行，`.env` 與 `results/` 皆導向 `tmp_path`。
- 目前：64 項通過（`pytest -q`）。

---

## 22. 非功能需求

| 面向 | 要求 |
|---|---|
| 決定性 | 相同 config + seed → 完全相同 scenario、Fixed/Rule 行動與指標；AI 以 `ai.seed` 與 `temperature` 盡力而為 |
| 重現性紀錄 | git commit、config hash、模型參數、prompt 版本、事件排程 hash、時間戳（§16.3） |
| 效能 | mock provider 下 90 天 × 3 策略 < 1 s；50 seeds × 3 策略（無 LLM）數秒；LLM 受供應商延遲主導 |
| 相依 | 核心僅 `pyyaml`；`matplotlib`、`scipy` 可選（無則跳過圖表 / 使用純 Python 統計）；Web 需 `fastapi`、`uvicorn`；測試需 `pytest`、`httpx` |
| 相容 | Python ≥ 3.9；Windows PowerShell 與 POSIX shell 皆可 |
| 安全 | 見 §19.5；LLM 輸出僅作為資料解析，不執行 |
| 可觀測性 | `setup_logging(level)`；Web job 錯誤含 traceback 於伺服器 log |

---

## 23. 已知限制與後續路線

**已知限制**
- 單 SKU / 單競品；競品非策略性反應（只有隨機漫步 + 事件）。
- 促銷成本、規則策略 `recover_to_base`、折價券感知毛利底線為實作新增（皆可由設定關閉），與 v1 草案不同。
- AI 記憶僅 7/30 日聚合，無情節記憶。
- Web 無使用者認證；job 狀態存於記憶體（重啟即失）。
- 分析助理非串流回覆。

**V2 候選**
1. 多 SKU 與跨 SKU 替代、多競品、供應商選擇。
2. AI 情節記憶（episodic memory）與 prompt v2 消融實驗。
3. 預測資訊實驗（forecast-information experiment）作為獨立模式。
4. Web：job 持久化、串流聊天、多使用者/認證、結果比較視圖。
5. 平台排名演算法、客群分層、倉儲限制。

---

## 附錄 A：預設參數總表

```yaml
simulation:   { days: 90, decision_interval_days: 1, random_seed: 42, initial_cash: 200000 }
scenario:     { difficulty: normal }
product:      { sku: SKU-001, base_price: 100, unit_cost: 55, initial_inventory: 1000 }
competitor:   { base_price: 98, promotion_level: 0.2, market_strength: 1.0,
                walk_std: 0.02, walk_mean_reversion: 0.20, walk_min: 0.80, walk_max: 1.20 }
demand:       { base_daily_demand: 100, elasticity: 1.5, reference_price: 100, noise_std: 0.10, noise_floor: 0.30,
                competitor_beta: 1.0, ad_alpha: 0.4, ad_scale: 200, reference_ad_budget: 1000,
                promotion_traffic_alpha: 0.15, weekly_seasonality: [1.00,0.95,0.95,1.00,1.05,1.15,1.10] }
conversion:   { base_rate: 0.035, max_rate: 0.20, coupon_sensitivity: 2.0, promotion_sensitivity: 0.15 }
supplier:     { lead_time_days: 7, unit_cost: 55, order_fixed_cost: 200, order_variable_cost: 1.0 }
costs:        { holding_cost_per_unit_day: 0.05, stockout_penalty_per_unit: 10,
                promotion_daily_cost: 100, promotion_fee_rate: 0.10 }
action_limits:{ price: [50,150], ad_budget: [0,5000], coupon_discount: [0,0.30],
                reorder_quantity: [0,1000], promotion_level: [0,1] }
ai:           { provider: openai, model: gpt-4o-mini, base_url: null, api_key_env: OPENAI_API_KEY,
                temperature: 0.2, top_p: 0.9, max_tokens: 800, seed: 42, timeout_seconds: 60, max_retries: 2,
                structured_output: true, use_tools: false, reasoning_effort: null,
                prompt_version: v1, input_price_per_m: 0.15, output_price_per_m: 0.60, mock: { error_rate: 0.0 } }
fixed_strategy: { price: 100, ad_budget: 1000, coupon_discount: 0.05, reorder_quantity: 100, promotion_level: 0.20 }
rule_strategy:  { initial: {price: 100, ad_budget: 1000, coupon_discount: 0.05, reorder_quantity: 0, promotion_level: 0.20},
                  competitor_gap_threshold: 0.10, price_cut_competitor: 0.05, overstock_days: 30, price_cut_overstock: 0.03,
                  hot_demand_index: 1.30, low_supply_days: 10, price_raise_hot: 0.05, price_recover_pct: 0.03, min_margin_ratio: 1.25,
                  ad_up_conversion: 0.05, ad_up_supply_days: 14, ad_up_pct: 0.20, ad_down_conversion: 0.02, ad_down_pct: 0.20,
                  sales_drop_threshold: -0.20, coupon_sales_drop: 0.10, coupon_overstock_days: 35, coupon_overstock: 0.08, coupon_default: 0.05,
                  safety_stock_days: 7, target_stock_days: 30, min_order_quantity: 20, promotion_level: 0.20 }
evaluation:   { lambda_price: 50.0, lambda_stockout: 200.0, recovery_threshold: 0.95, recovery_window_days: 7 }
benchmark:    { seeds: 50, seed_start: 1001, days_per_episode: 90, strategies: [ai, fixed, rule_based], results_dir: results }
events:       見 §8.3；difficulty_presets 見 §8.4
```

## 附錄 B：術語表

| 術語 | 定義 |
|---|---|
| Episode | 一個策略在一個 WorldScenario 上經營 `days` 天的完整模擬 |
| Seed / WorldScenario | 決定一個世界（雜訊、競品、事件）的整數與其預生成的不可變資料 |
| Observation | 環境每日提供給策略的唯一資訊通道（§10） |
| Action | 策略每日回傳的 5 維決策（§11） |
| Fallback | AI 輸出無效時採用的前一日有效行動 |
| Paired comparison | 同一 seed 下兩策略指標之差的統計（配對 t、Wilcoxon、勝率、CI） |
| Uplift % | `mean_diff / |mean(baseline)| × 100` |
| Win rate | 每 seed 最高累積淨利的策略佔比（或配對中 a > b 的比例） |
| Recovery days | 事件結束後 7 日滾動利潤回到 ≥ 95% 事前水準所需天數 |
| Profit drop ratio | `(pre − during) / |pre|` |
| Adjusted score | 淨利扣除價格波動與缺貨天數懲罰後的分數 |
| AI ROI | `Σ(AI 利潤 − Rule 利潤) / AI 推論總成本` |
| Job | Web 層背景執行的 episode 或 benchmark，具事件流與可取消 |
| SSE | Server-Sent Events，Web 前端即時接收 job 事件的機制 |
