"""MarketPilot local web server with an OpenAI-powered store manager."""

from __future__ import annotations

import argparse
import hmac
import json
import math
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlparse
from urllib.error import HTTPError, URLError
from urllib.request import Request as URLRequest, urlopen
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError


ROOT = Path(__file__).resolve().parent
ENV_FILE = ROOT / ".env"
PRODUCTS_FILE = ROOT / "data" / "products.json"
DAILY_ANALYSIS_FILE = ROOT / "data" / "daily_analysis.json"
SIMULATOR_RUN_FILE = ROOT / "data" / "simulator_last_run.json"
DEFAULT_MODEL = "gpt-4o-mini"
PRODUCTS_LOCK = threading.Lock()
DAILY_ANALYSIS_LOCK = threading.Lock()
TAIPEI_TIMEZONE = ZoneInfo("Asia/Taipei")


class Recommendation(BaseModel):
    category: Literal["advertising", "inventory", "pricing", "promotion", "customer"]
    title: str = Field(min_length=2, max_length=40)
    description: str = Field(min_length=8, max_length=160)
    current_value: str = Field(min_length=1, max_length=40)
    suggested_value: str = Field(min_length=1, max_length=40)
    expected_impact: str = Field(min_length=1, max_length=50)
    rationale: str = Field(min_length=5, max_length=180)
    confidence: int = Field(ge=0, le=100)


class StoreAnalysis(BaseModel):
    summary: str = Field(min_length=8, max_length=120)
    confidence: int = Field(ge=0, le=100)
    market_status: Literal["normal", "opportunity", "attention", "risk"]
    recommendations: list[Recommendation] = Field(min_length=1, max_length=3)


class DailySales(BaseModel):
    price: float = Field(gt=0)
    unit_cost: float = Field(gt=0)
    units_sold: int = Field(ge=0)
    revenue: float = Field(ge=0)
    gross_profit: float | None = None
    traffic: int = Field(default=0, ge=0)
    conversion_rate: float = Field(default=0, ge=0, le=1)
    lost_sales: int = Field(default=0, ge=0)
    ad_budget: float = Field(default=0, ge=0)
    ad_spend: float = Field(default=0, ge=0)
    coupon_discount: float = Field(default=0, ge=0, le=1)
    promotion_level: float = Field(default=0, ge=0, le=1)


class MarketSnapshot(BaseModel):
    competitor_price: float = Field(gt=0)
    demand_index: float = Field(default=1, gt=0)
    competitor_promotion_level: float = Field(default=0, ge=0, le=1)


class InventorySnapshot(BaseModel):
    on_hand: int = Field(ge=0)
    in_transit: int = Field(default=0, ge=0)
    lead_time_days: int = Field(default=7, ge=0, le=365)


class MarketEvent(BaseModel):
    type: str = Field(min_length=1, max_length=60)
    severity: float = Field(default=0.5, ge=0, le=1)
    description: str = Field(default="", max_length=240)


class Action(BaseModel):
    price: float = Field(gt=0)
    ad_budget: float = Field(ge=0)
    coupon_discount: float = Field(ge=0, le=1)
    reorder_quantity: int = Field(ge=0)
    promotion_level: float = Field(ge=0, le=1)


class DecisionConstraints(BaseModel):
    target_gross_margin: float = Field(default=0.30, ge=0, lt=0.95)
    price_min: float = Field(default=50, gt=0)
    price_max: float = Field(default=5000, gt=0)
    max_price_change_pct: float = Field(default=0.10, ge=0, le=1)
    ad_budget_min: float = Field(default=0, ge=0)
    ad_budget_max: float = Field(default=5000, ge=0)
    max_ad_budget_change_pct: float = Field(default=0.25, ge=0, le=2)
    coupon_discount_max: float = Field(default=0.30, ge=0, le=1)
    reorder_quantity_max: int = Field(default=1000, ge=0)
    promotion_level_max: float = Field(default=1, ge=0, le=1)
    safety_stock_days: int = Field(default=7, ge=0, le=365)
    target_stock_days: int = Field(default=14, ge=0, le=365)


class AgentDecisionRequest(BaseModel):
    request_id: str | None = Field(default=None, max_length=100)
    observation_date: str = Field(min_length=8, max_length=32)
    sku: str = Field(default="SKU-001", min_length=1, max_length=80)
    sales: DailySales
    market: MarketSnapshot
    inventory: InventorySnapshot
    events: list[MarketEvent] = Field(default_factory=list, max_length=20)
    history_7d: list[DailySales] = Field(default_factory=list, max_length=7)
    last_action: Action | None = None
    constraints: DecisionConstraints = Field(default_factory=DecisionConstraints)


class BatchDecisionRequest(BaseModel):
    batch_id: str | None = Field(default=None, max_length=100)
    observation_date: str = Field(min_length=8, max_length=32)
    observations: list[AgentDecisionRequest] = Field(min_length=1, max_length=200)


class DecisionProposal(BaseModel):
    price: float
    ad_budget: float
    coupon_discount: float
    reorder_quantity: int
    promotion_level: float
    confidence: int = Field(ge=0, le=100)
    summary: str = Field(min_length=5, max_length=160)
    price_reason: str = Field(min_length=2, max_length=160)
    ad_reason: str = Field(min_length=2, max_length=160)
    inventory_reason: str = Field(min_length=2, max_length=160)
    promotion_reason: str = Field(min_length=2, max_length=160)


class ProductCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    unit_cost: float = Field(gt=0, le=10_000_000)
    inventory: int = Field(ge=0, le=10_000_000)
    low_stock_threshold: int = Field(ge=0, le=10_000_000)
    min_gross_margin: float = Field(ge=0.01, lt=0.95)


class InitialPricingProposal(BaseModel):
    price: float = Field(gt=0)
    rationale: str = Field(min_length=5, max_length=240)
    confidence: int = Field(ge=0, le=100)


class SimulatorListingPrice(BaseModel):
    product_id: str = Field(min_length=1, max_length=40)
    price: float = Field(gt=0)
    rationale: str = Field(min_length=5, max_length=160)


class SimulatorBootstrapProposal(BaseModel):
    listings: list[SimulatorListingPrice] = Field(min_length=1, max_length=20)


DEFAULT_STORE_CONTEXT = {
    "store": "森日選物",
    "date": "2026-09-12",
    "currency": "TWD",
    "period": {
        "revenue_30d": 384260,
        "orders_30d": 286,
        "conversion_rate": 0.0382,
        "repeat_purchase_rate": 0.274,
        "revenue_change": 0.128,
    },
    "products": [
        {"sku": "SKU-001", "name": "無線降噪耳機", "price": 3280, "stock": 218, "search_change_7d": 0.23},
        {"sku": "SKU-014", "name": "日光隨行保溫杯", "price": 880, "stock": 14, "days_to_stockout": 5},
        {"sku": "SKU-031", "name": "植萃洗沐組", "price": 790, "stock": 8, "days_to_stockout": 4},
    ],
    "market": {
        "competitor_avg_price": 3120,
        "competitor_price_change": -0.012,
        "demand_index": 1.18,
        "ad_roas": 4.7,
        "current_daily_ad_budget": 1000,
        "safe_inventory_days": 11.4,
    },
    "constraints": {
        "price_range": [50, 5000],
        "daily_ad_budget_range": [0, 5000],
        "promotion_discount_max": 0.30,
        "human_confirmation_required": False,
        "inventory_reorder_mode": "notify_seller",
    },
}


SYSTEM_PROMPT = """你是 MarketPilot 的資深電商營運店長。請分析使用者提供的單店營運資料，提出最多三項今天能執行、可量化且互不重複的建議。

原則：
1. 只根據提供的資料判斷，不要杜撰訂單、成本或市場消息。
2. 優先處理預期效益高、風險可控的事項，並遵守 constraints。
3. 建議要具體寫出目前值、建議值與預期影響；無法可靠估算時請明確寫「需進一步驗證」。
4. 商品售價、廣告與促銷策略會在安全限制內自動執行，不要要求人工確認。
5. 庫存不足時只通知賣家確認補貨，不要宣稱系統已自動採購。
6. 使用自然、精簡的繁體中文，像有經驗的營運主管，不使用浮誇或機器人語氣。
"""


DECISION_PROMPT = """你是 MarketPilot 的電商決策引擎。輸入是某 SKU 昨日的銷售、成本、庫存、競品、市場事件、近七日歷史與今天的營運限制。請產生今天的一組完整 Action。

決策目標依序為：
1. 遵守 constraints，尤其是 target_gross_margin。毛利以折價後有效售價計算：(price × (1-coupon_discount) - unit_cost) / (price × (1-coupon_discount))。
2. 避免缺貨並考慮在途庫存與 lead_time_days。
3. 根據競品價格、需求指數、轉換率、lost_sales 與 events 調整價格、廣告、折扣及促銷。
4. 不因單日雜訊做劇烈調整；history_7d 為空時應更保守。
5. 回傳每個欄位都必須是具體數值。reorder_quantity 是整數，coupon_discount 與 promotion_level 使用 0 到 1。

輸出仍會經過程式化安全防護，因此請專注於商業判斷。理由使用精簡繁體中文，不得杜撰輸入中不存在的資訊。
"""


INITIAL_PRICING_PROMPT = """你是 MarketPilot 的商品定價引擎。使用者只提供商品名稱、單位成本、初始庫存、預警庫存與不可突破的最低毛利率，由你決定商品的初始售價。

請依商品名稱反映的品類定位、成本與庫存水位，提出一個合理、可直接使用的售價。售價必須高於滿足最低毛利率的價格；資料有限時採保守定價並降低 confidence。不得假裝知道未提供的競品、市場價格或品牌資料。使用繁體中文簡短說明理由。
"""


SIMULATOR_BOOTSTRAP_PROMPT = """你是 MarketPilot 的市場模擬上架經理。請替輸入目錄中的每一項商品建立一筆初始售價，product_id 必須原樣回傳且不可遺漏或重複。

初始售價應反映品類、成本、品質與競品價格。售價至少需保留 30% 毛利，且不得超過成本五倍。資料不足時採保守定價。理由使用精簡繁體中文，不得杜撰未提供資訊。
"""


def load_settings() -> tuple[str | None, str]:
    load_dotenv(ENV_FILE, override=False)
    return os.getenv("OPENAI_API_KEY"), os.getenv("OPENAI_MODEL", DEFAULT_MODEL)


def save_settings(api_key: str, model: str) -> None:
    lines: list[str] = []
    if ENV_FILE.exists():
        lines = ENV_FILE.read_text(encoding="utf-8").splitlines()
    values = {"OPENAI_API_KEY": api_key, "OPENAI_MODEL": model}
    output: list[str] = []
    seen: set[str] = set()
    for line in lines:
        key = line.split("=", 1)[0].strip() if "=" in line else ""
        if key in values:
            output.append(f"{key}={values[key]}")
            seen.add(key)
        else:
            output.append(line)
    for key, value in values.items():
        if key not in seen:
            output.append(f"{key}={value}")
    ENV_FILE.write_text("\n".join(output).rstrip() + "\n", encoding="utf-8")
    try:
        ENV_FILE.chmod(0o600)
    except OSError:
        pass
    os.environ.update(values)


def response_parse_options(model: str, max_output_tokens: int) -> dict[str, Any]:
    """Build Responses API options that leave enough room for reasoning models."""
    options: dict[str, Any] = {
        "model": model,
        "store": False,
        "max_output_tokens": max_output_tokens,
    }
    normalized = model.lower()
    if normalized.startswith(("gpt-5", "o1", "o3", "o4")):
        options["reasoning"] = {"effort": "low"}
    return options


def require_parsed_output(response: Any, message: str) -> Any:
    parsed = getattr(response, "output_parsed", None)
    if parsed is not None:
        return parsed

    status = getattr(response, "status", None)
    details = getattr(response, "incomplete_details", None)
    reason = getattr(details, "reason", None) if details else None
    diagnostic = ", ".join(
        part for part in (f"status={status}" if status else "", f"reason={reason}" if reason else "") if part
    )
    raise RuntimeError(f"{message}{f'（{diagnostic}）' if diagnostic else ''}")


def analyze_store(context: dict | None = None) -> dict:
    api_key, model = load_settings()
    if not api_key:
        raise ValueError("尚未設定 OPENAI_API_KEY")

    if context is not None:
        store_context = context
        context_source = "api_request"
    elif os.getenv("MARKETPILOT_ENVIRONMENT_URL", "").strip():
        store_context = fetch_external_observation().model_dump(mode="json", exclude_none=True)
        context_source = "external_environment"
    else:
        store_context = json.loads(json.dumps(DEFAULT_STORE_CONTEXT))
        saved_products = load_products()
        if saved_products:
            store_context["products"] = [
                {
                    "sku": product.get("sku"),
                    "name": product.get("name"),
                    "price": product.get("price"),
                    "unit_cost": product.get("unit_cost"),
                    "stock": product.get("inventory", 0),
                    "low_stock_threshold": product.get("low_stock_threshold", 0),
                    "min_gross_margin": product.get("min_gross_margin"),
                    "low_stock_alert": product.get("inventory", 0) <= product.get("low_stock_threshold", 0),
                }
                for product in saved_products
            ]
        context_source = "demo_store_data"
    started = time.perf_counter()
    client = OpenAI(api_key=api_key)
    response = client.responses.parse(
        **response_parse_options(model, 5000),
        input=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(store_context, ensure_ascii=False)},
        ],
        text_format=StoreAnalysis,
    )
    result = require_parsed_output(response, "模型沒有回傳可解析的營運建議")

    usage = getattr(response, "usage", None)
    return {
        "analysis": result.model_dump(),
        "market_snapshot": market_snapshot(store_context),
        "meta": {
            "model": getattr(response, "model", model),
            "context_source": context_source,
            "latency_ms": round((time.perf_counter() - started) * 1000),
            "input_tokens": getattr(usage, "input_tokens", 0) if usage else 0,
            "output_tokens": getattr(usage, "output_tokens", 0) if usage else 0,
        },
    }


def analysis_date() -> str:
    return datetime.now(TAIPEI_TIMEZONE).date().isoformat()


def load_daily_analysis() -> dict | None:
    try:
        record = json.loads(DAILY_ANALYSIS_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return None
    if not isinstance(record, dict) or record.get("analysis_date") != analysis_date():
        return None
    payload = record.get("payload")
    return payload if isinstance(payload, dict) else None


def save_daily_analysis(payload: dict) -> None:
    DAILY_ANALYSIS_FILE.parent.mkdir(parents=True, exist_ok=True)
    temporary = DAILY_ANALYSIS_FILE.with_suffix(".tmp")
    record = {"analysis_date": analysis_date(), "payload": payload}
    temporary.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(DAILY_ANALYSIS_FILE)


def attach_execution_records(payload: dict) -> dict:
    if isinstance(payload.get("execution_records"), list):
        return payload
    executed_at = payload.get("meta", {}).get("generated_at") or datetime.now(TAIPEI_TIMEZONE).isoformat()
    recommendations = payload.get("analysis", {}).get("recommendations", [])
    payload["execution_records"] = [
        {
            "id": f"daily-{analysis_date()}-{index + 1}",
            "category": item.get("category", "promotion"),
            "title": item.get("title", "AI 營運調整"),
            "result": "已通知賣家補貨" if item.get("category") == "inventory" else "已自動套用",
            "status": "seller_notified" if item.get("category") == "inventory" else "applied",
            "executed_at": executed_at,
            "notification": item.get("suggested_value") if item.get("category") == "inventory" else None,
        }
        for index, item in enumerate(recommendations)
        if isinstance(item, dict)
    ]
    return payload


def get_daily_analysis(context: dict | None = None) -> dict:
    """Return one persisted GPT market analysis for each Taipei calendar day."""
    with DAILY_ANALYSIS_LOCK:
        cached = load_daily_analysis()
        if cached is not None:
            result = json.loads(json.dumps(cached))
            result.setdefault("meta", {})["cache_hit"] = True
            attach_execution_records(result)
            return result

        result = analyze_store(context)
        generated_at = datetime.now(TAIPEI_TIMEZONE).isoformat()
        result.setdefault("meta", {}).update({
            "analysis_date": analysis_date(),
            "generated_at": generated_at,
            "cache_hit": False,
        })
        attach_execution_records(result)
        save_daily_analysis(result)
        return result


def get_cached_daily_analysis() -> dict | None:
    with DAILY_ANALYSIS_LOCK:
        cached = load_daily_analysis()
        if cached is None:
            return None
        result = json.loads(json.dumps(cached))
        result.setdefault("meta", {})["cache_hit"] = True
        attach_execution_records(result)
        return result


def market_snapshot(context: dict) -> dict:
    """Normalize dashboard and external-environment context for the UI."""
    market = context.get("market", {}) if isinstance(context, dict) else {}
    sales = context.get("sales", {}) if isinstance(context, dict) else {}
    inventory = context.get("inventory", {}) if isinstance(context, dict) else {}
    period = context.get("period", {}) if isinstance(context, dict) else {}
    events = context.get("events", []) if isinstance(context, dict) else []
    return {
        "competitor_price": market.get("competitor_price", market.get("competitor_avg_price")),
        "demand_index": market.get("demand_index"),
        "conversion_rate": sales.get("conversion_rate", period.get("conversion_rate")),
        "inventory_on_hand": inventory.get("on_hand"),
        "ad_roas": market.get("ad_roas"),
        "event_count": len(events) if isinstance(events, list) else 0,
        "events": [
            {"type": event.get("type"), "severity": event.get("severity")}
            for event in events[:5] if isinstance(event, dict)
        ],
    }


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def fallback_proposal(request: AgentDecisionRequest, error: str | None = None) -> DecisionProposal:
    """Return a deterministic, conservative action when the LLM is unavailable."""
    sales = request.sales
    stock = request.inventory
    constraints = request.constraints
    baseline_units = max(1, round(
        sum(day.units_sold for day in request.history_7d) / len(request.history_7d)
    )) if request.history_7d else max(1, sales.units_sold)
    stock_target = baseline_units * constraints.target_stock_days
    available = stock.on_hand + stock.in_transit
    reorder = max(0, min(constraints.reorder_quantity_max, stock_target - available))
    return DecisionProposal(
        price=request.last_action.price if request.last_action else sales.price,
        ad_budget=request.last_action.ad_budget if request.last_action else sales.ad_budget,
        coupon_discount=0,
        reorder_quantity=reorder,
        promotion_level=0,
        confidence=35 if error else 50,
        summary="沿用穩健設定並依安全庫存補貨。" if not error else "模型暫時無法使用，已套用安全回退策略。",
        price_reason="維持目前售價並交由毛利防護檢查。",
        ad_reason="沿用前次廣告預算，避免因資料不足劇烈調整。",
        inventory_reason=f"依日均銷量與 {constraints.target_stock_days} 天目標庫存計算。",
        promotion_reason="暫不增加折扣或促銷。",
    )


def apply_guardrails(proposal: DecisionProposal, request: AgentDecisionRequest) -> tuple[Action, list[str], dict]:
    """Clamp an LLM proposal and enforce the configured gross-margin floor."""
    c = request.constraints
    sales = request.sales
    if c.price_min > c.price_max:
        raise ValueError("constraints.price_min 不得大於 price_max")
    if c.ad_budget_min > c.ad_budget_max:
        raise ValueError("constraints.ad_budget_min 不得大於 ad_budget_max")

    minimum_effective_price = sales.unit_cost / (1 - c.target_gross_margin)
    if minimum_effective_price > c.price_max + 1e-9:
        raise ValueError("price_max 無法滿足 target_gross_margin，請調高價格上限或降低目標毛利率")

    applied: list[str] = []
    current_price = sales.price
    daily_low = max(c.price_min, current_price * (1 - c.max_price_change_pct))
    daily_high = min(c.price_max, current_price * (1 + c.max_price_change_pct))
    price = _clamp(float(proposal.price), daily_low, daily_high)
    if abs(price - float(proposal.price)) > 1e-9:
        applied.append("price_change_limit")

    current_ad = sales.ad_budget
    if current_ad > 0:
        ad_low = max(c.ad_budget_min, current_ad * (1 - c.max_ad_budget_change_pct))
        ad_high = min(c.ad_budget_max, current_ad * (1 + c.max_ad_budget_change_pct))
    else:
        ad_low, ad_high = c.ad_budget_min, c.ad_budget_max
    ad_budget = _clamp(float(proposal.ad_budget), ad_low, ad_high)
    if abs(ad_budget - float(proposal.ad_budget)) > 1e-9:
        applied.append("ad_budget_change_limit")

    coupon = _clamp(float(proposal.coupon_discount), 0, c.coupon_discount_max)
    if abs(coupon - float(proposal.coupon_discount)) > 1e-9:
        applied.append("coupon_limit")
    reorder = max(0, min(c.reorder_quantity_max, int(round(proposal.reorder_quantity))))
    if reorder != int(round(proposal.reorder_quantity)):
        applied.append("reorder_limit")
    promotion = _clamp(float(proposal.promotion_level), 0, c.promotion_level_max)
    if abs(promotion - float(proposal.promotion_level)) > 1e-9:
        applied.append("promotion_limit")

    effective_price = price * (1 - coupon)
    if effective_price + 1e-9 < minimum_effective_price:
        max_safe_coupon = 1 - (minimum_effective_price / price)
        if max_safe_coupon >= 0:
            coupon = max(0, math.floor(max_safe_coupon * 10_000) / 10_000)
            applied.append("gross_margin_coupon_floor")
        else:
            price = min(c.price_max, math.ceil(minimum_effective_price * 100) / 100)
            coupon = 0
            applied.append("gross_margin_price_floor")

    price = round(price, 2)
    ad_budget = round(ad_budget, 2)
    coupon = round(coupon, 4)
    promotion = round(promotion, 4)
    effective_price = price * (1 - coupon)
    projected_margin = (effective_price - sales.unit_cost) / effective_price
    if projected_margin + 1e-8 < c.target_gross_margin:
        price = min(c.price_max, math.ceil((minimum_effective_price / (1 - coupon)) * 100) / 100)
        effective_price = price * (1 - coupon)
        projected_margin = (effective_price - sales.unit_cost) / effective_price
        if "gross_margin_price_floor" not in applied:
            applied.append("gross_margin_price_floor")
    if projected_margin + 1e-8 < c.target_gross_margin:
        raise ValueError("目前限制無法產生符合目標毛利率的 Action")

    action = Action(
        price=price,
        ad_budget=ad_budget,
        coupon_discount=coupon,
        reorder_quantity=reorder,
        promotion_level=promotion,
    )
    margin = {
        "target": c.target_gross_margin,
        "projected": round(projected_margin, 6),
        "effective_price_after_coupon": round(effective_price, 4),
        "minimum_effective_price": round(minimum_effective_price, 4),
        "unit_cost": sales.unit_cost,
    }
    return action, applied, margin


def decide_action(request: AgentDecisionRequest, require_ai: bool = False) -> dict:
    api_key, model = load_settings()
    proposal: DecisionProposal
    source = "ai"
    ai_error: str | None = None
    started = time.perf_counter()
    usage = None

    if api_key:
        try:
            client = OpenAI(api_key=api_key)
            response = client.responses.parse(
                **response_parse_options(model, 3000),
                input=[
                    {"role": "system", "content": DECISION_PROMPT},
                    {"role": "user", "content": request.model_dump_json(exclude_none=True)},
                ],
                text_format=DecisionProposal,
            )
            proposal = require_parsed_output(response, "模型沒有回傳可解析的 Action")
            usage = getattr(response, "usage", None)
            model = getattr(response, "model", model)
        except Exception as exc:
            if require_ai:
                raise RuntimeError(f"{request.sku} 的 GPT 決策失敗：{exc}") from exc
            ai_error = str(exc)
            proposal = fallback_proposal(request, ai_error)
            source = "fallback"
    else:
        if require_ai:
            raise ValueError("每日全商品決策必須先設定 OPENAI_API_KEY")
        ai_error = "尚未設定 OPENAI_API_KEY"
        proposal = fallback_proposal(request, ai_error)
        source = "fallback"

    action, applied, margin = apply_guardrails(proposal, request)
    return {
        "request_id": request.request_id or str(uuid.uuid4()),
        "observation_date": request.observation_date,
        "sku": request.sku,
        "action": action.model_dump(),
        "decision": {
            "summary": proposal.summary,
            "confidence": proposal.confidence,
            "reasons": {
                "price": proposal.price_reason,
                "advertising": proposal.ad_reason,
                "inventory": proposal.inventory_reason,
                "promotion": proposal.promotion_reason,
            },
        },
        "guardrails": {"applied": applied, "margin": margin},
        "meta": {
            "source": source,
            "model": model if source == "ai" else None,
            "latency_ms": round((time.perf_counter() - started) * 1000),
            "input_tokens": getattr(usage, "input_tokens", 0) if usage else 0,
            "output_tokens": getattr(usage, "output_tokens", 0) if usage else 0,
            "ai_error": ai_error,
        },
    }


def decide_all_products(request: BatchDecisionRequest) -> dict:
    skus = [observation.sku for observation in request.observations]
    if len(skus) != len(set(skus)):
        raise ValueError("批次 Observation 中的 sku 不可重複")
    mismatched = [item.sku for item in request.observations if item.observation_date != request.observation_date]
    if mismatched:
        raise ValueError(f"所有商品 observation_date 必須等於批次日期：{', '.join(mismatched)}")
    decisions = [decide_action(observation, require_ai=True) for observation in request.observations]
    return {
        "batch_id": request.batch_id or str(uuid.uuid4()),
        "observation_date": request.observation_date,
        "apply_on_date": "next_simulation_day",
        "product_count": len(decisions),
        "decisions": decisions,
        "all_sources_ai": all(item["meta"]["source"] == "ai" for item in decisions),
    }


def fetch_external_observation() -> AgentDecisionRequest:
    """Fetch the latest completed-day observation from an operator-configured URL."""
    load_dotenv(ENV_FILE, override=False)
    source_url = os.getenv("MARKETPILOT_ENVIRONMENT_URL", "").strip()
    if not source_url:
        raise ValueError("尚未設定 MARKETPILOT_ENVIRONMENT_URL")
    parsed = urlparse(source_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("MARKETPILOT_ENVIRONMENT_URL 必須是有效的 http 或 https URL")
    headers = {"Accept": "application/json"}
    source_key = os.getenv("MARKETPILOT_ENVIRONMENT_API_KEY", "").strip()
    if source_key:
        headers["Authorization"] = f"Bearer {source_key}"
    request = URLRequest(source_url, headers=headers, method="GET")
    with urlopen(request, timeout=15) as response:
        content_length = int(response.headers.get("Content-Length", "0") or 0)
        if content_length > 1_000_000:
            raise ValueError("外部 Observation 回應超過 1 MB")
        raw = response.read(1_000_001)
    if len(raw) > 1_000_000:
        raise ValueError("外部 Observation 回應超過 1 MB")
    payload = json.loads(raw)
    if isinstance(payload, dict) and "observation" in payload:
        payload = payload["observation"]
    return AgentDecisionRequest.model_validate(payload)


def fetch_external_batch() -> BatchDecisionRequest:
    """Fetch every product's previous-day observation for a daily AI run."""
    load_dotenv(ENV_FILE, override=False)
    source_url = os.getenv("MARKETPILOT_ENVIRONMENT_BATCH_URL", "").strip()
    if not source_url:
        raise ValueError("尚未設定 MARKETPILOT_ENVIRONMENT_BATCH_URL")
    parsed = urlparse(source_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("MARKETPILOT_ENVIRONMENT_BATCH_URL 必須是有效的 http 或 https URL")
    headers = {"Accept": "application/json"}
    source_key = os.getenv("MARKETPILOT_ENVIRONMENT_API_KEY", "").strip()
    if source_key:
        headers["Authorization"] = f"Bearer {source_key}"
    request = URLRequest(source_url, headers=headers, method="GET")
    with urlopen(request, timeout=30) as response:
        content_length = int(response.headers.get("Content-Length", "0") or 0)
        if content_length > 5_000_000:
            raise ValueError("外部批次 Observation 回應超過 5 MB")
        raw = response.read(5_000_001)
    if len(raw) > 5_000_000:
        raise ValueError("外部批次 Observation 回應超過 5 MB")
    payload = json.loads(raw)
    if isinstance(payload, dict) and "batch" in payload:
        payload = payload["batch"]
    return BatchDecisionRequest.model_validate(payload)


def load_products() -> list[dict]:
    if not PRODUCTS_FILE.exists():
        return []
    try:
        data = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return data if isinstance(data, list) else []


def persist_product(product: dict) -> None:
    with PRODUCTS_LOCK:
        products = load_products()
        products.append(product)
        PRODUCTS_FILE.parent.mkdir(parents=True, exist_ok=True)
        temporary = PRODUCTS_FILE.with_suffix(".tmp")
        temporary.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary.replace(PRODUCTS_FILE)


def create_product_with_ai(request: ProductCreateRequest) -> dict:
    api_key, model = load_settings()
    if not api_key:
        raise ValueError("必須先連接 GPT，才能由 AI 建立商品售價")

    minimum_price = request.unit_cost / (1 - request.min_gross_margin)
    started = time.perf_counter()
    client = OpenAI(api_key=api_key)
    response = client.responses.parse(
        **response_parse_options(model, 2000),
        input=[
            {"role": "system", "content": INITIAL_PRICING_PROMPT},
            {"role": "user", "content": request.model_dump_json()},
        ],
        text_format=InitialPricingProposal,
    )
    proposal = require_parsed_output(response, "GPT 沒有回傳可解析的商品售價")

    ai_price = round(proposal.price, 2)
    final_price = max(ai_price, math.ceil(minimum_price * 100) / 100)
    guardrail_applied = final_price > ai_price
    projected_margin = (final_price - request.unit_cost) / final_price
    usage = getattr(response, "usage", None)
    product = {
        "id": str(uuid.uuid4()),
        "sku": f"AI-{uuid.uuid4().hex[:8].upper()}",
        "name": request.name,
        "unit_cost": request.unit_cost,
        "inventory": request.inventory,
        "low_stock_threshold": request.low_stock_threshold,
        "min_gross_margin": request.min_gross_margin,
        "price": round(final_price, 2),
        "price_control": "ai",
        "status": "active",
        "pricing": {
            "rationale": proposal.rationale,
            "confidence": proposal.confidence,
            "minimum_allowed_price": round(minimum_price, 2),
            "projected_gross_margin": round(projected_margin, 6),
            "margin_guardrail_applied": guardrail_applied,
            "model": getattr(response, "model", model),
            "latency_ms": round((time.perf_counter() - started) * 1000),
            "input_tokens": getattr(usage, "input_tokens", 0) if usage else 0,
            "output_tokens": getattr(usage, "output_tokens", 0) if usage else 0,
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    persist_product(product)
    return product


def simulator_request(path: str, method: str = "GET", payload: dict | None = None) -> dict:
    base_url = os.getenv("MARKETPILOT_SIMULATOR_URL", "http://127.0.0.1:3001").rstrip("/")
    parsed = urlparse(base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("MARKETPILOT_SIMULATOR_URL 必須是有效的 http 或 https URL")
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Accept": "application/json"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    request = URLRequest(f"{base_url}{path}", data=body, headers=headers, method=method)
    try:
        with urlopen(request, timeout=180) as response:
            raw = response.read(10_000_001)
    except HTTPError as exc:
        raw = exc.read(1_000_000)
        try:
            detail = json.loads(raw).get("error")
        except (json.JSONDecodeError, AttributeError):
            detail = None
        raise RuntimeError(f"市場模擬器拒絕請求：{detail or exc.reason}") from exc
    except URLError as exc:
        raise RuntimeError("無法連線市場模擬器，請使用 python3 run_all.py 啟動完整環境") from exc
    if len(raw) > 10_000_000:
        raise RuntimeError("市場模擬器回應超過 10 MB")
    result = json.loads(raw)
    if not isinstance(result, dict):
        raise RuntimeError("市場模擬器回應格式不正確")
    return result


def simulator_catalog_map(state: dict) -> dict[str, dict]:
    return {str(item["id"]): item for item in state.get("catalog", []) if isinstance(item, dict) and item.get("id")}


def simulator_product_payload(product: dict) -> dict:
    return {
        "id": product["sku"],
        "name": product["name"],
        "category": "MarketPilot 商品",
        "cost": product["unit_cost"],
        "quality": 0.85,
        "description": f"{product['name']}，由 MarketPilot AI 店長管理價格與銷售策略。",
        "emoji": "📦",
        "lowStockThreshold": product.get("low_stock_threshold", 0),
        "minGrossMargin": product.get("min_gross_margin", 0.30),
        "price": product["price"],
        "inventory": product["inventory"],
    }


def sync_product_to_simulator(product: dict) -> dict:
    return simulator_request("/api/products", "POST", simulator_product_payload(product))


def sync_products_to_simulator(state: dict | None = None) -> dict:
    state = state or simulator_request("/api/state")
    simulator_catalog = simulator_catalog_map(state)
    synced = False
    for product in load_products():
        simulator_product = simulator_catalog.get(product.get("sku"))
        if product.get("sku") and (simulator_product is None or "minGrossMargin" not in simulator_product):
            sync_product_to_simulator(product)
            synced = True
    return simulator_request("/api/state") if synced else state


def save_simulator_run(payload: dict) -> None:
    SIMULATOR_RUN_FILE.parent.mkdir(parents=True, exist_ok=True)
    temporary = SIMULATOR_RUN_FILE.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(SIMULATOR_RUN_FILE)


def load_simulator_run() -> dict | None:
    try:
        payload = json.loads(SIMULATOR_RUN_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, json.JSONDecodeError):
        return None
    return payload if isinstance(payload, dict) and payload else None


def simulator_dashboard() -> dict:
    state = sync_products_to_simulator()
    return {"state": state, "last_agent_run": load_simulator_run()}


def bootstrap_simulator(state: dict) -> dict:
    api_key, model = load_settings()
    if not api_key:
        raise ValueError("啟動 AI 市場模擬前必須先設定 OPENAI_API_KEY")
    listed_ids = {item.get("productId") for item in state.get("listings", []) if item.get("seller") == "pilot"}
    catalog = [item for item in state.get("catalog", []) if item.get("id") not in listed_ids]
    listings = state.get("listings", [])
    if not catalog:
        next_state = simulator_request("/api/step", "POST", {"days": 1})
        run = {"phase": "bootstrap", "simulation_day": next_state.get("day"), "decisions": [], "seller_notifications": [], "created_at": datetime.now(TAIPEI_TIMEZONE).isoformat()}
        save_simulator_run(run)
        return {"state": next_state, "agent_run": run}
    competitor_prices = {
        item["id"]: [listing.get("price") for listing in listings if listing.get("productId") == item["id"] and listing.get("seller") != "pilot"]
        for item in catalog
    }
    context = [
        {
            "product_id": item["id"], "name": item["name"], "category": item["category"],
            "unit_cost": item["cost"], "quality": item.get("quality"),
            "competitor_prices": competitor_prices.get(item["id"], []),
        }
        for item in catalog
    ]
    client = OpenAI(api_key=api_key)
    response = client.responses.parse(
        **response_parse_options(model, 4000),
        input=[
            {"role": "system", "content": SIMULATOR_BOOTSTRAP_PROMPT},
            {"role": "user", "content": json.dumps(context, ensure_ascii=False)},
        ],
        text_format=SimulatorBootstrapProposal,
    )
    proposal = require_parsed_output(response, "GPT 沒有回傳可解析的模擬商品售價")
    catalog_by_id = {str(item["id"]): item for item in catalog}
    proposed = {item.product_id: item for item in proposal.listings}
    if set(proposed) != set(catalog_by_id):
        raise RuntimeError("GPT 初始上架結果必須包含模擬器目錄中的所有商品")
    actions = []
    decisions = []
    for product_id, product in catalog_by_id.items():
        item = proposed[product_id]
        minimum = math.ceil((float(product["cost"]) / 0.7) * 100) / 100
        price = round(min(max(float(item.price), minimum), float(product["cost"]) * 5), 2)
        actions.append({"type": "list_product", "productId": product_id, "price": price, "initial_inventory": 100})
        decisions.append({"sku": product_id, "name": product["name"], "action": {"price": price}, "decision": {"summary": item.rationale, "confidence": 75}, "meta": {"source": "ai", "model": getattr(response, "model", model)}})
    simulator_request("/api/actions", "POST", {"actions": actions})
    next_state = simulator_request("/api/step", "POST", {"days": 1})
    run = {"phase": "bootstrap", "simulation_day": next_state.get("day"), "decisions": decisions, "seller_notifications": [], "created_at": datetime.now(TAIPEI_TIMEZONE).isoformat()}
    save_simulator_run(run)
    return {"state": next_state, "agent_run": run}


def simulator_daily_sales(result: dict) -> DailySales:
    units = max(0, int(result.get("unitsSold", 0)))
    traffic = max(5, units * 3)
    return DailySales(
        price=max(0.01, float(result.get("price", 0))),
        unit_cost=max(0.01, float(result.get("unitCost", 0))),
        units_sold=units,
        revenue=max(0, float(result.get("revenue", 0))),
        gross_profit=float(result.get("grossProfit", 0)),
        traffic=traffic,
        conversion_rate=min(1, units / traffic),
        lost_sales=1 if int(result.get("inventory", 0)) == 0 else 0,
        ad_budget=max(0, float(result.get("adBudget", 0))),
        coupon_discount=max(0, min(1, float(result.get("couponDiscount", 0)))),
        promotion_level=max(0, min(1, float(result.get("promotionLevel", 0)))),
    )


def simulator_batch(state: dict) -> BatchDecisionRequest:
    catalog = simulator_catalog_map(state)
    listings = state.get("listings", [])
    daily_results = {item.get("productId"): item for item in state.get("dailyResults", []) if item.get("seller") == "pilot"}
    pilot_listings = [item for item in listings if item.get("seller") == "pilot"]
    if not pilot_listings or not daily_results:
        raise RuntimeError("模擬器尚無可供 AI 判斷的前一日商品銷售資料")
    observation_date = f"simulation-day-{int(state.get('day', 0)):04d}"
    observations = []
    for listing in pilot_listings:
        product_id = listing["productId"]
        product = catalog[product_id]
        latest = daily_results.get(product_id)
        if latest is None:
            continue
        competitors = [float(item["price"]) for item in listings if item.get("seller") != "pilot" and item.get("productId") == product_id]
        competitor_price = sum(competitors) / len(competitors) if competitors else float(listing["price"])
        active_events = [event for event in state.get("events", []) if not event.get("category") or event.get("category") == product.get("category")]
        demand_index = math.prod(float(event.get("effect", 1)) for event in active_events) if active_events else 1
        history = []
        for daily in state.get("dailyHistory", []):
            if daily.get("day") == state.get("day"):
                continue
            match = next((item for item in daily.get("results", []) if item.get("seller") == "pilot" and item.get("productId") == product_id), None)
            if match:
                history.append(simulator_daily_sales(match))
        cost = float(product["cost"])
        target_margin = max(0.01, min(0.94, float(product.get("minGrossMargin", 0.30))))
        current_price = float(listing["price"])
        observations.append(AgentDecisionRequest(
            request_id=f"sim-{state.get('day')}-{product_id}",
            observation_date=observation_date,
            sku=product_id,
            sales=simulator_daily_sales(latest),
            market=MarketSnapshot(competitor_price=max(0.01, competitor_price), demand_index=max(0.01, demand_index), competitor_promotion_level=0),
            inventory=InventorySnapshot(on_hand=max(0, int(listing.get("inventory", 0))), in_transit=0, lead_time_days=3),
            events=[MarketEvent(type=str(event.get("name", "市場事件")), severity=min(1, abs(float(event.get("effect", 1)) - 1) / 0.5), description=f"影響係數 {event.get('effect', 1)}") for event in active_events],
            history_7d=history[-7:],
            last_action=Action(price=current_price, ad_budget=float(listing.get("adBudget", 0)), coupon_discount=float(listing.get("couponDiscount", 0)), reorder_quantity=0, promotion_level=float(listing.get("promotionLevel", 0))),
            constraints=DecisionConstraints(target_gross_margin=target_margin, price_min=math.ceil((cost / (1 - target_margin)) * 100) / 100, price_max=cost * 5, max_price_change_pct=.15, ad_budget_min=0, ad_budget_max=5000, max_ad_budget_change_pct=.30, coupon_discount_max=.30, reorder_quantity_max=500, promotion_level_max=1, safety_stock_days=5, target_stock_days=12),
        ))
    return BatchDecisionRequest(batch_id=f"market-simulator-day-{state.get('day')}", observation_date=observation_date, observations=observations)


def run_simulator_day() -> dict:
    state = sync_products_to_simulator()
    if not any(item.get("seller") == "pilot" for item in state.get("listings", [])) or not state.get("dailyResults"):
        return bootstrap_simulator(state)
    decisions = decide_all_products(simulator_batch(state))
    actions = []
    notifications = []
    catalog = simulator_catalog_map(state)
    for decision in decisions["decisions"]:
        product_id = decision["sku"]
        action = decision["action"]
        actions.extend([
            {"type": "update_price", "productId": product_id, "price": action["price"]},
            {"type": "update_strategy", "productId": product_id, "ad_budget": action["ad_budget"], "coupon_discount": action["coupon_discount"], "promotion_level": action["promotion_level"]},
        ])
        if action["reorder_quantity"] > 0:
            notifications.append({"product_id": product_id, "name": catalog.get(product_id, {}).get("name", product_id), "quantity": action["reorder_quantity"], "reason": decision["decision"]["reasons"]["inventory"], "status": "waiting_for_seller"})
    simulator_request("/api/actions", "POST", {"actions": actions})
    next_state = simulator_request("/api/step", "POST", {"days": 1})
    run = {"phase": "daily_ai", "observation_day": state.get("day"), "simulation_day": next_state.get("day"), "decisions": decisions["decisions"], "seller_notifications": notifications, "created_at": datetime.now(TAIPEI_TIMEZONE).isoformat()}
    save_simulator_run(run)
    return {"state": next_state, "agent_run": run}


def reset_simulator(seed: int = 12345) -> dict:
    state = simulator_request("/api/reset", "POST", {"seed": seed})
    save_simulator_run({})
    return sync_products_to_simulator(state)


def queue_simulator_restock(product_id: str, quantity: int) -> dict:
    if not product_id or quantity <= 0 or quantity > 10_000:
        raise ValueError("補貨商品與數量格式不正確")
    result = simulator_request("/api/actions", "POST", {"actions": [{"type": "restock", "productId": product_id, "quantity": quantity}]})
    return {"queued": True, "product_id": product_id, "quantity": quantity, "simulator": result}


class MarketPilotHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def _json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        allowed_origin = os.getenv("MARKETPILOT_CORS_ORIGIN")
        if allowed_origin:
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
        self.end_headers()
        self.wfile.write(body)

    def _agent_authorized(self) -> bool:
        expected = os.getenv("MARKETPILOT_API_KEY")
        if not expected:
            return True
        supplied = self.headers.get("Authorization", "")
        return supplied.startswith("Bearer ") and hmac.compare_digest(supplied[7:], expected)

    def _body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length > 1_000_000:
            raise ValueError("請求內容過大")
        raw = self.rfile.read(length)
        return json.loads(raw or b"{}")

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/health":
            self._json({"ok": True, "service": "marketpilot", "time": int(time.time())})
            return
        if path == "/api/ai/status":
            api_key, model = load_settings()
            self._json({"configured": bool(api_key), "model": model})
            return
        if path == "/api/ai/analysis/today":
            cached = get_cached_daily_analysis()
            if cached is None:
                self._json({"ok": True, "available": False, "analysis_date": analysis_date()})
            else:
                self._json({"ok": True, "available": True, **cached})
            return
        if path == "/api/agent/schema":
            self._json({
                "request_schema": AgentDecisionRequest.model_json_schema(),
                "batch_request_schema": BatchDecisionRequest.model_json_schema(),
                "action_schema": Action.model_json_schema(),
                "endpoint": "POST /api/agent/decide",
                "pull_endpoint": "POST /api/agent/sync",
                "daily_all_products_endpoint": "POST /api/agent/decide-all",
                "daily_all_products_pull_endpoint": "POST /api/agent/sync-all",
                "authentication": "Optional Bearer token when MARKETPILOT_API_KEY is configured",
            })
            return
        if path == "/api/products":
            self._json({"products": load_products()})
            return
        if path == "/api/simulator/dashboard":
            self._json({"ok": True, **simulator_dashboard()})
            return
        super().do_GET()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        allowed_origin = os.getenv("MARKETPILOT_CORS_ORIGIN")
        if allowed_origin:
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
        self.end_headers()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        try:
            if path in {"/api/agent/decide", "/api/agent/sync", "/api/agent/decide-all", "/api/agent/sync-all"} and not self._agent_authorized():
                self._json({"ok": False, "error": "未授權"}, HTTPStatus.UNAUTHORIZED)
                return
            payload = self._body()
            if path == "/api/ai/settings":
                api_key = str(payload.get("api_key", "")).strip()
                model = str(payload.get("model", DEFAULT_MODEL)).strip()
                if not api_key.startswith("sk-") or len(api_key) < 20:
                    raise ValueError("API key 格式不正確")
                if "\n" in api_key or "\r" in api_key:
                    raise ValueError("API key 格式不正確")
                if not model or len(model) > 80:
                    raise ValueError("模型名稱格式不正確")
                if "\n" in model or "\r" in model:
                    raise ValueError("模型名稱格式不正確")
                save_settings(api_key, model)
                self._json({"ok": True, "configured": True, "model": model})
                return
            if path == "/api/ai/analyze":
                context = payload.get("context")
                if context is not None and not isinstance(context, dict):
                    raise ValueError("context 必須是物件")
                self._json({"ok": True, **get_daily_analysis(context)})
                return
            if path == "/api/agent/decide":
                request = AgentDecisionRequest.model_validate(payload)
                self._json({"ok": True, **decide_action(request)})
                return
            if path == "/api/agent/sync":
                request = fetch_external_observation()
                self._json({"ok": True, "observation_source": os.getenv("MARKETPILOT_ENVIRONMENT_URL"), **decide_action(request)})
                return
            if path == "/api/agent/decide-all":
                batch_request = BatchDecisionRequest.model_validate(payload)
                self._json({"ok": True, **decide_all_products(batch_request)})
                return
            if path == "/api/agent/sync-all":
                batch_request = fetch_external_batch()
                self._json({"ok": True, "observation_source": os.getenv("MARKETPILOT_ENVIRONMENT_BATCH_URL"), **decide_all_products(batch_request)})
                return
            if path == "/api/products":
                product_request = ProductCreateRequest.model_validate(payload)
                product = create_product_with_ai(product_request)
                try:
                    sync_result = sync_product_to_simulator(product)
                    product["marketplace_sync"] = {"synced": True, "created": sync_result.get("created", False)}
                except Exception as exc:
                    product["marketplace_sync"] = {"synced": False, "error": str(exc)}
                self._json({"ok": True, "product": product}, HTTPStatus.CREATED)
                return
            if path == "/api/simulator/run-day":
                self._json({"ok": True, **run_simulator_day()})
                return
            if path == "/api/simulator/reset":
                seed = int(payload.get("seed", 12345))
                self._json({"ok": True, "state": reset_simulator(seed)})
                return
            if path == "/api/simulator/restock":
                product_id = str(payload.get("product_id", "")).strip()
                quantity = int(payload.get("quantity", 0))
                self._json({"ok": True, **queue_simulator_restock(product_id, quantity)})
                return
            self._json({"ok": False, "error": "找不到 API"}, HTTPStatus.NOT_FOUND)
        except ValidationError as exc:
            self._json({"ok": False, "error": "輸入資料驗證失敗", "details": exc.errors(include_context=False)}, HTTPStatus.UNPROCESSABLE_ENTITY)
        except (ValueError, json.JSONDecodeError) as exc:
            self._json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            message = str(exc)
            if "401" in message or "Incorrect API key" in message:
                message = "OpenAI API key 無效，請重新設定"
            elif "429" in message:
                message = "OpenAI API 使用額度或速率已達上限，請稍後再試"
            self._json({"ok": False, "error": message}, HTTPStatus.BAD_GATEWAY)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the MarketPilot local server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), MarketPilotHandler)
    print(f"MarketPilot is running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping MarketPilot...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
