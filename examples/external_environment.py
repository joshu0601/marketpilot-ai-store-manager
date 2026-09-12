"""Minimal example of an external simulator calling MarketPilot once per day."""

import json
import os
from pathlib import Path
from urllib.request import Request, urlopen


endpoint = os.getenv("MARKETPILOT_URL", "http://127.0.0.1:8000/api/agent/decide")
token = os.getenv("MARKETPILOT_API_KEY", "")
payload = json.loads((Path(__file__).parent / "decision_request.json").read_text(encoding="utf-8"))

headers = {"Content-Type": "application/json"}
if token:
    headers["Authorization"] = f"Bearer {token}"

request = Request(
    endpoint,
    data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    headers=headers,
    method="POST",
)
with urlopen(request, timeout=90) as response:
    result = json.load(response)

# Apply these five values to the next simulated day.
print(json.dumps(result["action"], ensure_ascii=False, indent=2))
print(json.dumps(result["guardrails"], ensure_ascii=False, indent=2))
