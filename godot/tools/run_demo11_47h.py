#!/usr/bin/env python3
"""Headless DEMO11 diagnostic. Exit0 never implies full E2E PASS."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import time
from demo11_47h_contract import validate_result

w = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(w / "godot/tests"))
from mac_harness import run

p = argparse.ArgumentParser()
for key in ["godot-bin", "node-bin", "source-root", "out"]:
    p.add_argument("--" + key, required=True)
p.add_argument("--require-ready", action="store_true")
p.add_argument("--skip-import", action="store_true")
a = p.parse_args()
godot = Path(a.godot_bin).expanduser().resolve()
if godot.is_dir():
    godot = godot / ("Contents/MacOS/Godot" if godot.suffix == ".app" else "Godot.app/Contents/MacOS/Godot")
if not godot.is_file():
    raise SystemExit("Godot executable not found")
out = Path(a.out).expanduser().resolve()
out.mkdir(parents=True, exist_ok=True)
prefix = "run-" + time.strftime("%Y%m%d-%H%M%S") + "-" + str(time.time_ns() % 1000000)
logs = out / prefix
user = "EXODUSER-demo11-47h-Isolated-20261021"
if not a.skip_import:
    if not run(w / "godot", logs, godot, "import", user, ["--headless", "--editor", "--import", "--quit"], timeout=600):
        raise SystemExit(1)
result_file = out / (prefix + "-stages.json")
extra = ["--node-bin=" + str(Path(a.node_bin).expanduser().resolve()),
         "--source-root=" + str(Path(a.source_root).expanduser().resolve()),
         "--results-path=" + str(result_file), "--demo11-storage=on"]
if a.require_ready:
    extra.append("--require-ready")
run(w / "godot", logs, godot, "e2e", user,
    ["--headless", "--script", "res://tests/test_demo11_47h_e2e.gd"], extra, timeout=450)
meta = json.loads((logs / "e2e.json").read_text())
result = json.loads(result_file.read_text()) if result_file.exists() else {"overall": "FAIL", "counts": {}, "reason": "missing stage result"}
validation = validate_result(result) if result_file.exists() else ["missing_result"]
errors = meta["errors"] + ["HARNESS_CONTRACT: " + error for error in validation]
if errors or meta.get("guard_failure"):
    result["overall"] = "FAIL"
result.update(engine_exit=meta["exit_code"], engine_errors=errors,
              preexisting_processes=meta["gate"], override_restored=meta["override_restored"])
try:
    result["git_sha"] = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=w, text=True, stderr=subprocess.DEVNULL).strip()
except subprocess.CalledProcessError:
    result["git_sha"] = "unknown"
result_file.write_text(json.dumps(result, ensure_ascii=False, indent=2))
(out / "latest-result.json").write_text(json.dumps({"result_file": str(result_file), "overall": result["overall"], "counts": result["counts"]}, ensure_ascii=False, indent=2))
print(json.dumps({"overall": result["overall"], "counts": result["counts"], "engine_exit": meta["exit_code"], "errors": errors[:8], "result_file": str(result_file)}, ensure_ascii=False))
sys.exit(1 if errors or result["overall"] == "FAIL" or meta["exit_code"] not in [0, 2] else (2 if a.require_ready and result["overall"] != "PASS" else 0))
