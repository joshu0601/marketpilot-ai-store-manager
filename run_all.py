"""Start the MarketPilot admin, simulator API, and marketplace together."""

from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path

from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(ROOT / ".env", override=False)
    environment = os.environ.copy()
    processes = [
        subprocess.Popen(["npm", "run", "api"], cwd=ROOT / "simulator", env=environment),
        subprocess.Popen(["npm", "run", "dev", "--", "--host", "127.0.0.1"], cwd=ROOT / "simulator", env=environment),
        subprocess.Popen([sys.executable, "server.py"], cwd=ROOT, env=environment),
    ]

    stopping = False

    def stop_all(*_: object) -> None:
        nonlocal stopping
        stopping = True
        for process in processes:
            if process.poll() is None:
                process.terminate()
        deadline = time.time() + 5
        for process in processes:
            try:
                process.wait(timeout=max(0, deadline - time.time()))
            except subprocess.TimeoutExpired:
                process.kill()

    signal.signal(signal.SIGINT, stop_all)
    signal.signal(signal.SIGTERM, stop_all)
    print("MarketPilot 後台：http://127.0.0.1:8000")
    print("市場模擬商城：http://127.0.0.1:5173")
    print("模擬器 API：http://127.0.0.1:3001")
    try:
        while all(process.poll() is None for process in processes):
            time.sleep(0.5)
    finally:
        stop_all()
    failed = 0 if stopping else next((process.returncode for process in processes if process.returncode not in {0, -signal.SIGTERM}), 0)
    raise SystemExit(failed or 0)


if __name__ == "__main__":
    main()
