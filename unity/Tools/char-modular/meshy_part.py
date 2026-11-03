"""Independent static parts, one POST per part. Keys remain in process memory.

Uses the existing boss lead's DPAPI loader, not a new credential store.
Production output and private balance receipts live outside Git on I:.
"""
import argparse
import base64
from datetime import datetime, timezone
import importlib.util
import json
import os
from pathlib import Path
import sys
import time
import uuid

ROOT = Path("I:/EXODUSER-Storage/char-modular/meshy")
LOCK = Path("I:/EXODUSER-Storage/Meshy/CALL.lock")
SPEND = Path("I:/EXODUSER-Storage/codex-takeover/SPEND_LOG.md")
HELPER = Path("G:/exoduser/tmp/design-review/20261103_boss_1-1_replan/gpt/meshy_m1/meshy_boss11_m1.py")
BASE = "https://api.meshy.ai/openapi/v1"
ESTIMATE = 30
CAP = 500


def stamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp, path)


class CallLock:
    def __init__(self, path):
        self.path = Path(path)
        self.token = "char-modular | pid=%s | %s | %s" % (os.getpid(), uuid.uuid4(), stamp())
        self.keep = False

    def __enter__(self):
        with self.path.open("x", encoding="utf-8") as f:
            f.write(self.token)
        return self

    def __exit__(self, *_):
        if not self.keep and self.path.exists() and self.path.read_text(encoding="utf-8") == self.token:
            self.path.unlink()


def preflight(root, part, estimate):
    if (root / part / "state.json").exists():
        raise RuntimeError("part already attempted: inspect state; never resubmit automatically")
    reserved = sum(json.loads(p.read_text(encoding="utf-8")).get("estimatedCredits", ESTIMATE)
                   for p in root.glob("*/state.json"))
    reserved += sum(item.get("estimatedCredits", ESTIMATE) for p in root.glob("*.attempt-history.json")
                    for item in json.loads(p.read_text(encoding="utf-8")))
    if reserved + estimate > CAP:
        raise RuntimeError("Warrior 500cr cap exceeded")
    return reserved


def retire_failed_review(root, part, expected_task):
    """Explicit one-time revision after visual rejection; retain the charge forever."""
    history = root / (part + ".attempt-history.json")
    if history.exists():
        raise RuntimeError("two-attempt stop: report; no third submission")
    path = root / part / "state.json"
    state = json.loads(path.read_text(encoding="utf-8"))
    if (state.get("taskId") != expected_task or state.get("status") != "SUCCEEDED"
            or not state.get("downloaded") or not str(state.get("reviewStatus", "")).startswith("FAIL")):
        raise RuntimeError("explicit known completed visual FAIL required")
    save(history, [{k: state.get(k) for k in ("taskId", "status", "reviewStatus", "estimatedCredits", "actualCredits")}])
    path.unlink()


def build_body(images, triangles, texture):
    return {"image_urls": ["data:image/png;base64," + base64.b64encode(p.read_bytes()).decode("ascii") for p in images],
            "ai_model": "latest", "should_texture": True, "enable_pbr": True,
            "texture_resolution": "2k", "topology": "triangle", "should_remesh": True,
            "target_polycount": triangles, "texture_prompt": texture,
            "target_formats": ["glb", "fbx"], "origin_at": "bottom"}


def spend(part, status, task="-", actual="미확인"):
    # Append under the shared Meshy call lock; never rewrite other owners' entries.
    with SPEND.open("a", encoding="utf-8", newline="\n") as f:
        f.write("\n| %s | Meshy char-modular | 전사 %s, %s, task %s | 예약30cr / 실차감%s | 사용자 11-04 char-modular 브리프, 전사500cr 상한 |\n"
                % (stamp(), part, status, task, actual))


def private_balance(session, headers, part, phase):
    response = session.get(BASE + "/balance", headers=headers, timeout=60)
    if response.status_code != 200:
        raise RuntimeError("balance HTTP %s; no credential output" % response.status_code)
    value = response.json().get("balance")
    save(ROOT / part / ("balance-" + phase + ".json"), {"at": stamp(), "balance": value})
    return value


def read_task(session, headers, task):
    response = session.get(BASE + "/multi-image-to-3d/" + task, headers=headers, timeout=60)
    if response.status_code != 200:
        raise RuntimeError("poll HTTP %s; resume the known task only" % response.status_code)
    return response.json()


def finish(session, headers, part, state, data):
    out = ROOT / part
    status = data.get("status")
    state.update(status=status, progress=data.get("progress"), actualCredits=data.get("consumed_credits"), checkedAt=stamp())
    save(out / "state.json", state)
    if status not in ("SUCCEEDED", "FAILED", "CANCELED", "CANCELLED"):
        return False
    private_balance(session, headers, part, "after")
    spend(part, status, state["taskId"], state.get("actualCredits", "미확인"))
    if status != "SUCCEEDED":
        raise RuntimeError("generation %s; no automatic retry" % status)
    for extension in ("glb", "fbx"):
        url = (data.get("model_urls") or {}).get(extension)
        if not url:
            raise RuntimeError("missing output " + extension)
        response = session.get(url, timeout=300)
        if response.status_code != 200:
            raise RuntimeError("download HTTP %s; task already charged, resume only" % response.status_code)
        (out / ("model." + extension)).write_bytes(response.content)
    state["downloaded"] = True
    save(out / "state.json", state)
    print("SUCCEEDED", part, "task", state["taskId"], "actualCredits", state.get("actualCredits"), flush=True)
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--part", required=True, choices=("head", "hair", "body", "cuirass", "pauldron", "arm", "gauntlet", "tassets", "greave", "boot", "cape", "sword"))
    parser.add_argument("--images", nargs=3, type=Path)
    parser.add_argument("--triangles", type=int, default=2500)
    parser.add_argument("--texture", default="Dull black forged iron with smooth broad silver edges. No speckles, dots, grain, noise, gold, brass, glow, symbols or painted shadows.")
    parser.add_argument("--mode", choices=("dry-run", "run", "resume", "balance", "retire-review-fail"), default="dry-run")
    parser.add_argument("--expected-task")
    args = parser.parse_args()
    out = ROOT / args.part
    if args.mode == "retire-review-fail":
        with CallLock(LOCK):
            retire_failed_review(ROOT, args.part, args.expected_task)
            print("REVIEW_FAIL_RECORDED: charge retained; one revised input allowed")
        return
    if args.mode in ("run", "dry-run"):
        if not args.images or any(not p.is_file() for p in args.images):
            raise RuntimeError("three existing view images required")
        prior = preflight(ROOT, args.part, ESTIMATE)
        if not 100 <= args.triangles <= 40000:
            raise RuntimeError("triangle budget out of range")
        if args.mode == "dry-run":
            save(out / "request-contract.json", {"part": args.part, "endpoint": BASE + "/multi-image-to-3d",
                 "images": list(map(str, args.images)), "triangles": args.triangles, "texture": args.texture,
                 "estimatedCredits": ESTIMATE, "priorReserved": prior, "cap": CAP, "called": False})
            print("DRY_RUN", args.part, "30cr; no key, no network")
            return
    spec = importlib.util.spec_from_file_location("existing_meshy_helper", HELPER)
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    import requests
    session = requests.Session()
    headers = {"Authorization": "Bearer " + helper.get_key()}
    if args.mode == "balance":
        private_balance(session, headers, args.part, "preflight")
        print("BALANCE_CHECK_OK (private receipt only)")
        return
    with CallLock(LOCK) as lock:
        if args.mode == "run":
            prior = preflight(ROOT, args.part, ESTIMATE)
            available = private_balance(session, headers, args.part, "before")
            if not isinstance(available, (int, float)) or available < ESTIMATE:
                raise RuntimeError("insufficient balance or unknown balance type; no submission")
            body = build_body(args.images, args.triangles, args.texture)
            state = {"intent": True, "part": args.part, "at": stamp(), "estimatedCredits": ESTIMATE,
                     "priorReserved": prior, "status": "SUBMITTING", "triangles": args.triangles}
            save(out / "state.json", state)
            spend(args.part, "reserved; POST intent persisted")
            lock.keep = True  # Ambiguous POST must not silently unlock/retry.
            response = session.post(BASE + "/multi-image-to-3d", headers=headers, json=body, timeout=120)
            if response.status_code not in (200, 202):
                state["status"] = "POST_HTTP_" + str(response.status_code)
                save(out / "state.json", state)
                raise RuntimeError("POST HTTP %s; no response body/credentials logged; intent retained" % response.status_code)
            task = response.json().get("result")
            if not isinstance(task, str) or not task:
                raise RuntimeError("missing task id; intent and lock retained")
            state.update(taskId=task, status="PENDING")
            save(out / "state.json", state)
            # Keep the global lease on interrupted polling of a still-running task.
            print("TASK", args.part, task, flush=True)
        else:
            state = json.loads((out / "state.json").read_text(encoding="utf-8"))
            if not state.get("taskId"):
                raise RuntimeError("no task id; manual resolution required; never resubmit")
        deadline = time.monotonic() + 1200
        last = None
        while time.monotonic() < deadline:
            data = read_task(session, headers, state["taskId"])
            if data.get("status") in ("SUCCEEDED", "FAILED", "CANCELED", "CANCELLED"):
                lock.keep = False
            status = (data.get("status"), data.get("progress"))
            if status != last:
                print("STATUS", args.part, *status, flush=True)
                last = status
            if finish(session, headers, args.part, state, data):
                return
            time.sleep(10)
        raise RuntimeError("poll timeout: saved task id; resume only, no resubmit")


if __name__ == "__main__":
    try:
        main()
    except BaseException as error:
        if isinstance(error, SystemExit):
            raise
        # requests exceptions may embed URLs; only print our sanitized runtime messages.
        print("STOP", str(error) if type(error) in (RuntimeError, FileExistsError) else type(error).__name__, file=sys.stderr)
        sys.exit(2)
