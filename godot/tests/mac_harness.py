"""Shared Mac process guard: isolated override, Godot capacity, errors and deadline.

Only the child created here is terminated. Original override existence/bytes restored.
"""
from pathlib import Path
import datetime
import json
import re
import subprocess
import os
import shutil
import time


def native_node_binary(value):
    """Resolve OS.execute's native binary; shell quotes/PC paths are transport data."""
    supplied = value.strip('"\'')
    candidate = Path(supplied).expanduser()
    if not candidate.is_file() or not os.access(candidate, os.X_OK):
        native = os.environ.get("EXODUSER_NODE_BIN") or shutil.which("node")
        if not native:
            raise RuntimeError("native Node executable unavailable")
        candidate = Path(native.strip('"\'')).expanduser()
    candidate = candidate.resolve(strict=True)
    subprocess.run([str(candidate), "--version"], check=True, capture_output=True)
    return str(candidate)


def run(project, out, engine, name, userdir, flags, extra=(), timeout=240):
    project, out = Path(project), Path(out)
    assert ("Isolated" in userdir or userdir == "EXODUSER-C15-Test-20261022") and userdir.startswith("EXODUSER-")
    assert userdir != "EXODUSER-Godot-Native-First"
    out.mkdir(parents=True, exist_ok=True)
    override = project / "override.cfg"
    original = override.read_bytes() if override.exists() else None
    argv = [str(engine), *flags, "--path", str(project), "--log-file", str(out / (name + ".engine.log"))]
    # These fixtures test fresh Main, not lobby persistence; each owns its namespace.
    # Keep persistence explicit: product/default and --demo11-storage=on are untouched.
    fresh_main_fixtures = {
        "res://tests/test_pc_move_skills.gd",
        "res://tests/test_native_main_source_starter_state.gd",
        "res://tests/test_demo11_etype15_runtime.gd",
        "res://tests/test_map11_product.gd",
        "res://tests/test_demo11_08_story_intro.gd",
    }
    if (any(script in flags for script in fresh_main_fixtures)
            and not any(arg.startswith("--demo11-storage=") for arg in extra)):
        extra = [*extra, "--demo11-storage=off"]
    if extra:
        # OS.execute needs a native executable path, never a quoted shell command
        # or a PC path transported to this Mac. Keep this in the Mac harness.
        normalized = []
        for arg in extra:
            if arg.startswith("--node-bin="):
                arg = "--node-bin=" + native_node_binary(arg.split("=", 1)[1])
            normalized.append(arg)
        argv += ["--", *normalized]
    meta = {"argv": argv, "userdir": userdir, "gate": []}
    stdout_path, stderr_path = out / (name + ".out"), out / (name + ".err")
    assert not (out / (name + ".json")).exists(), "preserve prior results"
    child = None
    try:
        while True:
            ps = subprocess.check_output(["ps", "-axo", "pid,comm"], text=True)
            pids = [int(line.split()[0]) for line in ps.splitlines() if line.rstrip().endswith("/Godot")]
            meta["gate"].append({"utc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "pids": pids})
            if len(pids) < 3:
                break
            print(f"{name}: capacity full {pids}; wait", flush=True)
            time.sleep(10)
        override.write_text('[application]\nconfig/use_custom_user_dir=true\n'
                            f'config/custom_user_dir_name="{userdir}"\n')
        with stdout_path.open("x") as stdout, stderr_path.open("x") as stderr:
            child = subprocess.Popen(argv, cwd=project, stdout=stdout, stderr=stderr)
            deadline = time.monotonic() + timeout
            while child.poll() is None:
                output = stdout_path.read_text(errors="replace") + stderr_path.read_text(errors="replace")
                if "SCRIPT ERROR" in output or "ERROR:" in output or "_FAIL " in output or "MAC_HARNESS_TIMEOUT" in output:
                    meta["guard_failure"] = "engine error/assertion"
                    break
                if time.monotonic() >= deadline:
                    meta["guard_failure"] = "watchdog timeout"
                    break
                time.sleep(.1)
            # Give an already requested SceneTree.quit(nonzero) time to finish.
            if child.poll() is None and meta.get("guard_failure"):
                try:
                    child.wait(timeout=.5)
                except subprocess.TimeoutExpired:
                    pass
            if child.poll() is None:
                child.terminate()
                try:
                    child.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    child.kill()
            meta["exit_code"] = child.wait()
            if meta.get("guard_failure") and meta["exit_code"] == 0:
                meta["exit_code"] = 124
            meta["child_pid"] = child.pid
            meta["child_exited"] = child.poll() is not None
    finally:
        if child is not None and child.poll() is None:
            child.terminate()
            try:
                child.wait(timeout=5)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        if original is None:
            override.unlink(missing_ok=True)
        else:
            override.write_bytes(original)
        meta["override_restored"] = (override.read_bytes() if override.exists() else None) == original
        output = "\n".join(p.read_text(errors="replace") for p in [stdout_path, stderr_path] if p.exists())
        meta["errors"] = [line for line in output.splitlines() if "ERROR:" in line or "SCRIPT ERROR" in line or re.search(r"_FAIL(?: |$)|_FAILS (?!\[\]$)", line) or "MAC_HARNESS_TIMEOUT" in line]
        meta["results"] = [line for line in output.splitlines() if re.search(r"(?:_RESULT| RESULT) ", line)]
        meta["skipped"] = []
        meta["passed"] = meta.get("exit_code") == 0 and not meta["errors"] and not meta.get("guard_failure") and meta["override_restored"] and ("--import" in flags or bool(meta["results"]))
        for line in meta["results"]:
            payload = re.split(r"(?:_RESULT| RESULT) ", line, maxsplit=1)[1]
            if payload.startswith("{"):
                result = json.loads(payload)
            else:
                # Some MAP11 suites print key=value aggregates, not JSON.
                fields = dict(re.findall(r"(checks|assertions|failures)=(\d+)", payload))
                if "failures" not in fields:
                    meta["passed"] = False
                    continue
                result = {key: int(value) for key, value in fields.items()}
            meta["skipped"].extend(result.get("skipped", []))
            if result.get("failures", 0) != 0:
                meta["passed"] = False
        (out / (name + ".json")).write_text(json.dumps(meta, ensure_ascii=False, indent=2))
        print(name, "PASS" if meta["passed"] else "FAIL", "exit", meta.get("exit_code"), "errors", len(meta["errors"]), flush=True)
    return meta["passed"]
