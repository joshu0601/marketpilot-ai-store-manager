import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import server


class FakeUsage:
    input_tokens = 120
    output_tokens = 80


class FakeResponse:
    model = "gpt-4o-mini"
    usage = FakeUsage()
    output_parsed = server.StoreAnalysis(
        summary="目前應優先處理低庫存，並小幅增加高需求商品的曝光。",
        confidence=88,
        market_status="opportunity",
        recommendations=[
            server.Recommendation(
                category="inventory",
                title="補充保溫杯庫存",
                description="目前庫存預計五天內售罄，應在到貨前完成補貨。",
                current_value="14 件",
                suggested_value="補貨 100 件",
                expected_impact="降低缺貨風險",
                rationale="現有庫存低於安全水位。",
                confidence=91,
            )
        ],
    )


class FakeResponses:
    def parse(self, **kwargs):
        assert kwargs["model"] == "gpt-4o-mini"
        assert kwargs["text_format"] is server.StoreAnalysis
        assert kwargs["store"] is False
        assert kwargs["max_output_tokens"] == 5000
        assert len(kwargs["input"]) == 2
        return FakeResponse()


class FakeOpenAI:
    def __init__(self, api_key):
        assert api_key == "sk-test-key-with-enough-characters"
        self.responses = FakeResponses()


class FakeHTTPResponse:
    headers = {"Content-Length": "0"}

    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, _limit):
        return self.body


class FakePricingResponses:
    def parse(self, **kwargs):
        assert kwargs["text_format"] is server.InitialPricingProposal
        return type("PricingResponse", (), {
            "model": "gpt-4o-mini",
            "usage": FakeUsage(),
            "output_parsed": server.InitialPricingProposal(
                price=90,
                rationale="以初始成本與庫存採取保守定價。",
                confidence=72,
            ),
        })()


class FakePricingOpenAI:
    def __init__(self, api_key):
        self.responses = FakePricingResponses()


class FakeDailyDecisionResponses:
    def parse(self, **kwargs):
        assert kwargs["text_format"] is server.DecisionProposal
        observation = __import__("json").loads(kwargs["input"][1]["content"])
        assert "sales" in observation
        assert observation["observation_date"] == "2026-09-11"
        proposal = server.DecisionProposal(
            price=observation["sales"]["price"] + 1,
            ad_budget=observation["sales"]["ad_budget"] * 1.1,
            coupon_discount=0.02,
            reorder_quantity=120,
            promotion_level=0.25,
            confidence=84,
            summary="依昨日銷售資料調整今日價格與促銷。",
            price_reason="需求穩定，小幅調高售價。",
            ad_reason="依昨日轉換表現增加投放。",
            inventory_reason="按昨日銷量補足安全庫存。",
            promotion_reason="採用低強度促銷測試需求。",
        )
        return type("DailyDecisionResponse", (), {
            "model": "gpt-4o-mini",
            "usage": FakeUsage(),
            "output_parsed": proposal,
        })()


class FakeDailyDecisionOpenAI:
    def __init__(self, api_key):
        self.responses = FakeDailyDecisionResponses()


class ServerTests(unittest.TestCase):
    def make_request(self, **constraint_overrides):
        constraints = {
            "target_gross_margin": 0.30,
            "price_min": 50,
            "price_max": 150,
            "max_price_change_pct": 0.10,
            "ad_budget_min": 0,
            "ad_budget_max": 5000,
            "max_ad_budget_change_pct": 0.25,
            "coupon_discount_max": 0.30,
            "reorder_quantity_max": 1000,
            "promotion_level_max": 1,
        }
        constraints.update(constraint_overrides)
        return server.AgentDecisionRequest.model_validate({
            "request_id": "day-18",
            "observation_date": "2026-09-11",
            "sku": "SKU-001",
            "sales": {
                "price": 100,
                "unit_cost": 70,
                "units_sold": 80,
                "revenue": 8000,
                "ad_budget": 1000,
                "ad_spend": 920,
                "conversion_rate": 0.04,
            },
            "market": {"competitor_price": 98, "demand_index": 1.12},
            "inventory": {"on_hand": 40, "in_transit": 0, "lead_time_days": 7},
            "events": [{"type": "competitor_discount", "severity": 0.7}],
            "constraints": constraints,
        })

    def test_save_settings_masks_key_from_public_status_source(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / ".env"
            with patch.object(server, "ENV_FILE", target):
                server.save_settings("sk-test-key-with-enough-characters", "gpt-4o-mini")
                saved = target.read_text(encoding="utf-8")
                self.assertIn("OPENAI_API_KEY=sk-test-key-with-enough-characters", saved)
                self.assertIn("OPENAI_MODEL=gpt-4o-mini", saved)

    def test_analyze_store_returns_validated_structured_output(self):
        env = {
            "OPENAI_API_KEY": "sk-test-key-with-enough-characters",
            "OPENAI_MODEL": "gpt-4o-mini",
        }
        with patch.dict(os.environ, env, clear=False), patch.object(server, "OpenAI", FakeOpenAI):
            result = server.analyze_store()
        self.assertEqual(result["analysis"]["confidence"], 88)
        self.assertEqual(result["analysis"]["recommendations"][0]["category"], "inventory")
        self.assertEqual(result["meta"]["input_tokens"], 120)
        self.assertEqual(result["meta"]["output_tokens"], 80)
        self.assertEqual(result["meta"]["context_source"], "demo_store_data")

    def test_daily_analysis_calls_gpt_only_once_and_survives_reload(self):
        generated = {
            "analysis": FakeResponse.output_parsed.model_dump(),
            "market_snapshot": {},
            "meta": {"model": "gpt-4o-mini", "latency_ms": 10, "input_tokens": 1, "output_tokens": 2},
        }
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "daily_analysis.json"
            with patch.object(server, "DAILY_ANALYSIS_FILE", target), patch.object(server, "analyze_store", return_value=generated) as analyze:
                first = server.get_daily_analysis()
                second = server.get_daily_analysis()
                reloaded = server.get_cached_daily_analysis()
        analyze.assert_called_once_with(None)
        self.assertFalse(first["meta"]["cache_hit"])
        self.assertTrue(second["meta"]["cache_hit"])
        self.assertTrue(reloaded["meta"]["cache_hit"])
        self.assertEqual(first["meta"]["generated_at"], second["meta"]["generated_at"])
        self.assertEqual(first["execution_records"][0]["status"], "seller_notified")
        self.assertEqual(first["execution_records"][0]["result"], "已通知賣家補貨")
    def test_market_analysis_uses_external_environment_when_configured(self):
        request = self.make_request()
        with (
            patch.dict(os.environ, {"MARKETPILOT_ENVIRONMENT_URL": "http://simulator.test/latest"}, clear=False),
            patch.object(server, "load_settings", return_value=("sk-test-key-with-enough-characters", "gpt-4o-mini")),
            patch.object(server, "fetch_external_observation", return_value=request) as fetched,
            patch.object(server, "OpenAI", FakeOpenAI),
        ):
            result = server.analyze_store()
        fetched.assert_called_once_with()
        self.assertEqual(result["meta"]["context_source"], "external_environment")
        self.assertEqual(result["market_snapshot"]["competitor_price"], 98)
        self.assertEqual(result["market_snapshot"]["event_count"], 1)

    def test_guardrails_enforce_margin_and_all_action_limits(self):
        request = self.make_request()
        unsafe = server.DecisionProposal(
            price=50,
            ad_budget=9999,
            coupon_discount=0.8,
            reorder_quantity=5000,
            promotion_level=2,
            confidence=90,
            summary="以高折扣換取銷量。",
            price_reason="追上競品。",
            ad_reason="擴大曝光。",
            inventory_reason="預先補貨。",
            promotion_reason="增加促銷。",
        )
        action, applied, margin = server.apply_guardrails(unsafe, request)
        self.assertGreaterEqual(margin["projected"], 0.30)
        self.assertEqual(action.price, 100)
        self.assertEqual(action.coupon_discount, 0)
        self.assertEqual(action.ad_budget, 1250)
        self.assertEqual(action.reorder_quantity, 1000)
        self.assertEqual(action.promotion_level, 1)
        self.assertIn("gross_margin_price_floor", applied)

    def test_decision_falls_back_without_openai_key(self):
        request = self.make_request()
        with patch.object(server, "load_settings", return_value=(None, "gpt-4o-mini")):
            result = server.decide_action(request)
        self.assertEqual(result["meta"]["source"], "fallback")
        self.assertGreaterEqual(result["guardrails"]["margin"]["projected"], 0.30)
        self.assertEqual(result["action"]["reorder_quantity"], 1000)

    def test_impossible_margin_constraint_is_rejected(self):
        request = self.make_request(price_max=90)
        proposal = server.fallback_proposal(request)
        with self.assertRaisesRegex(ValueError, "price_max"):
            server.apply_guardrails(proposal, request)

    def test_pull_mode_fetches_and_validates_external_observation(self):
        payload = self.make_request().model_dump(mode="json")
        body = __import__("json").dumps({"observation": payload}).encode()
        env = {"MARKETPILOT_ENVIRONMENT_URL": "http://simulator.test/observation/latest"}
        with patch.dict(os.environ, env, clear=False), patch.object(server, "urlopen", return_value=FakeHTTPResponse(body)) as mocked:
            result = server.fetch_external_observation()
        self.assertEqual(result.request_id, "day-18")
        self.assertEqual(result.market.competitor_price, 98)
        outgoing = mocked.call_args.args[0]
        self.assertEqual(outgoing.full_url, env["MARKETPILOT_ENVIRONMENT_URL"])

    def test_product_requires_gpt_connection(self):
        request = server.ProductCreateRequest(name="測試商品", unit_cost=70, inventory=50, low_stock_threshold=10, min_gross_margin=0.30)
        with patch.object(server, "load_settings", return_value=(None, "gpt-4o-mini")):
            with self.assertRaisesRegex(ValueError, "必須先連接 GPT"):
                server.create_product_with_ai(request)

    def test_product_creation_schema_has_no_manual_price_field(self):
        fields = set(server.ProductCreateRequest.model_fields)
        self.assertEqual(fields, {"name", "unit_cost", "inventory", "low_stock_threshold", "min_gross_margin"})

    def test_ai_prices_product_and_margin_floor_is_enforced(self):
        request = server.ProductCreateRequest(name="測試商品", unit_cost=70, inventory=50, low_stock_threshold=10, min_gross_margin=0.30)
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "products.json"
            with (
                patch.object(server, "PRODUCTS_FILE", target),
                patch.object(server, "load_settings", return_value=("sk-test-key", "gpt-4o-mini")),
                patch.object(server, "OpenAI", FakePricingOpenAI),
            ):
                product = server.create_product_with_ai(request)
                saved = server.load_products()
        self.assertEqual(product["price"], 100)
        self.assertEqual(product["price_control"], "ai")
        self.assertEqual(product["low_stock_threshold"], 10)
        self.assertTrue(product["pricing"]["margin_guardrail_applied"])
        self.assertGreaterEqual(product["pricing"]["projected_gross_margin"], 0.30)
        self.assertEqual(saved[0]["name"], "測試商品")

    def test_daily_batch_uses_ai_for_every_product(self):
        first = self.make_request()
        second = self.make_request().model_copy(update={"sku": "SKU-002", "request_id": "day-18-sku-2"})
        batch = server.BatchDecisionRequest(
            batch_id="seed-42-day-18",
            observation_date="2026-09-11",
            observations=[first, second],
        )
        with (
            patch.object(server, "load_settings", return_value=("sk-test-key", "gpt-4o-mini")),
            patch.object(server, "OpenAI", FakeDailyDecisionOpenAI),
        ):
            result = server.decide_all_products(batch)
        self.assertEqual(result["product_count"], 2)
        self.assertTrue(result["all_sources_ai"])
        self.assertEqual({item["sku"] for item in result["decisions"]}, {"SKU-001", "SKU-002"})
        self.assertTrue(all(item["action"]["promotion_level"] == 0.25 for item in result["decisions"]))

    def simulator_state(self):
        return {
            "day": 1,
            "catalog": [{"id": "P001", "name": "測試衣服", "category": "服飾", "cost": 300, "minGrossMargin": 0.40}],
            "listings": [
                {"id": "pilot-P001", "seller": "pilot", "productId": "P001", "price": 500, "inventory": 8, "adBudget": 100, "couponDiscount": 0, "promotionLevel": 0},
                {"id": "npc-P001", "seller": "npc1", "productId": "P001", "price": 480, "inventory": 30},
            ],
            "dailyResults": [{"day": 1, "listingId": "pilot-P001", "seller": "pilot", "productId": "P001", "price": 500, "unitCost": 300, "unitsSold": 3, "revenue": 1500, "grossProfit": 600, "inventory": 8, "adBudget": 100, "couponDiscount": 0, "promotionLevel": 0}],
            "dailyHistory": [], "events": [{"name": "服飾熱門", "effect": 1.3, "duration": 2, "category": "服飾"}],
        }

    def test_simulator_state_becomes_previous_day_agent_batch(self):
        batch = server.simulator_batch(self.simulator_state())
        item = batch.observations[0]
        self.assertEqual(item.sku, "P001")
        self.assertEqual(item.sales.units_sold, 3)
        self.assertEqual(item.market.competitor_price, 480)
        self.assertEqual(item.market.demand_index, 1.3)
        self.assertEqual(item.inventory.on_hand, 8)
        self.assertEqual(item.constraints.target_gross_margin, 0.40)
        self.assertEqual(item.constraints.price_min, 500)

    def test_existing_admin_products_are_synced_to_simulator_catalog(self):
        state = self.simulator_state()
        product = {
            "sku": "AI-12AB34CD", "name": "測試新品", "unit_cost": 100,
            "inventory": 8, "low_stock_threshold": 2, "min_gross_margin": 0.40, "price": 170,
        }
        synced_state = {**state, "catalog": [*state["catalog"], {"id": product["sku"], "name": product["name"]}]}
        with (
            patch.object(server, "load_products", return_value=[product]),
            patch.object(server, "simulator_request", side_effect=[{"created": True}, synced_state]) as request,
        ):
            result = server.sync_products_to_simulator(state)
        self.assertEqual(result, synced_state)
        self.assertEqual(request.call_args_list[0].args[0:2], ("/api/products", "POST"))
        payload = request.call_args_list[0].args[2]
        self.assertEqual(payload["id"], "AI-12AB34CD")
        self.assertEqual(payload["price"], 170)
        self.assertEqual(payload["inventory"], 8)
        self.assertEqual(payload["minGrossMargin"], 0.40)

    def test_simulator_applies_strategy_but_keeps_restock_as_seller_notification(self):
        state = self.simulator_state()
        decision = {
            "sku": "P001", "action": {"price": 490, "ad_budget": 200, "coupon_discount": 0.05, "reorder_quantity": 40, "promotion_level": 0.2},
            "decision": {"summary": "降低價格並增加曝光", "confidence": 80, "reasons": {"price": "接近競品", "advertising": "增加流量", "inventory": "低於安全庫存", "promotion": "提升轉換"}},
            "meta": {"source": "ai", "model": "gpt-4o-mini"}, "guardrails": {"applied": [], "margin": {}},
        }
        next_state = {**state, "day": 2}
        with (
            patch.object(server, "sync_products_to_simulator", return_value=state),
            patch.object(server, "simulator_request", side_effect=[{"accepted": []}, next_state]) as request,
            patch.object(server, "decide_all_products", return_value={"decisions": [decision], "all_sources_ai": True}),
            patch.object(server, "save_simulator_run"),
        ):
            result = server.run_simulator_day()
        queued = request.call_args_list[0].args[2]["actions"]
        self.assertEqual([item["type"] for item in queued], ["update_price", "update_strategy"])
        self.assertEqual(result["agent_run"]["seller_notifications"][0]["quantity"], 40)
    def test_daily_batch_refuses_non_ai_fallback(self):
        batch = server.BatchDecisionRequest(
            observation_date="2026-09-11",
            observations=[self.make_request()],
        )
        with patch.object(server, "load_settings", return_value=(None, "gpt-4o-mini")):
            with self.assertRaisesRegex(ValueError, "必須先設定"):
                server.decide_all_products(batch)


if __name__ == "__main__":
    unittest.main()
