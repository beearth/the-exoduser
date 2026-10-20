#!/usr/bin/env python3
"""Run the four integration regressions with their original test assertions.

EXODUSER_GODOT_BIN may select the engine without putting its path in the
runner's argv (which would itself match the required pgrep gate).
"""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import time

SUITES = {
    "41": ("test_demo11_41_music_lifecycle", "EXODUSER-demo11-41-Isolated-20261021"),
    "EL-01": ("test_el01_hell0", "EXODUSER-el-01-Isolated-20261021"),
    "19ui": ("test_demo11_growth_ui", "EXODUSER-demo11-19ui-Isolated-20261021"),
    "37": ("test_demo11_encounter", "EXODUSER-demo11-37-Isolated-20261021"),
}


def run(project, out, engine, name, userdir, flags, extra=()):
    assert userdir.startswith("EXODUSER-") and "Isolated" in userdir
    override = project / "override.cfg"
    assert not override.exists() or not override.read_bytes(), "preserve existing override"
    assert not (out / (name + ".json")).exists(), "preserve previous results"
    argv = [str(engine), *flags, "--path", str(project), "--log-file",
            str(out / (name + ".engine.log"))]
    if extra:
        argv += ["--", *extra]
    meta = {"argv": argv, "userdir": userdir, "gate": []}
    try:
        while True:
            count = int(subprocess.check_output(
                ["/bin/sh", "-c", 'pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l'],
                text=True).strip())
            meta["gate"].append({"utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                                 "count": count})
            if count < 2:
                break
            print(f"{name}: Godot count {count}; wait 30s", flush=True)
            time.sleep(30)
        override.write_text('[application]\nconfig/use_custom_user_dir=true\n'
                            f'config/custom_user_dir_name="{userdir}"\n')
        with (out / (name + ".out")).open("x") as stdout, (out / (name + ".err")).open("x") as stderr:
            child = subprocess.Popen(argv, cwd=project, stdout=stdout, stderr=stderr)
            try:
                meta["exit_code"] = child.wait(timeout=240)
            except subprocess.TimeoutExpired:
                meta["timeout"] = True
                child.terminate()  # Only the process created by this invocation.
                try:
                    meta["exit_code"] = child.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    child.kill()
                    meta["exit_code"] = child.wait()
    finally:
        override.write_bytes(b"")
        meta["override_empty"] = override.stat().st_size == 0
        output = "\n".join((out / (name + ext)).read_text(errors="replace")
                           for ext in (".out", ".err") if (out / (name + ext)).exists())
        meta["errors"] = [line for line in output.splitlines()
                          if "ERROR" in line or "_FAIL" in line]
        meta["results"] = [line for line in output.splitlines() if "_RESULT " in line]
        meta["passed"] = (meta.get("exit_code") == 0 and not meta["errors"]
                          and (name == "import" or bool(meta["results"])))
        meta["skipped"] = []
        for line in meta["results"]:
            result = json.loads(line.split("_RESULT ", 1)[1])
            meta["skipped"].extend(result.get("skipped", []))
            if result.get("failures", 0) != 0:
                meta["passed"] = False
        (out / (name + ".json")).write_text(json.dumps(meta, ensure_ascii=False, indent=2))
        verdict = ("PASS_WITH_SKIPS" if meta["skipped"] else "PASS") if meta["passed"] else "FAIL"
        print(name, verdict, *meta["results"], flush=True)
    return meta["passed"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--source-root", type=Path, required=True, help="read-only original bgm/ and acorn root")
    parser.add_argument("--node-bin", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--audio-mode", choices=["window", "headless"], default="window",
                        help="41: window uses native audio; headless reports explicit Dummy observation skips")
    parser.add_argument("--suite", nargs="+", choices=SUITES, default=list(SUITES))
    args = parser.parse_args()
    project, out = args.project.resolve(), args.out.resolve()
    assert (project.parent / "game.html").is_file(), "sparse-checkout must include game.html"
    assert (args.source_root / "bgm").is_dir() and args.node_bin.is_file()
    for script, userdir in SUITES.values():
        text = (project / "tests" / (script + ".gd")).read_text()
        assert re.search(r'const USERDIR\s*:?=\s*"' + re.escape(userdir) + '"', text)
    out.mkdir(parents=True, exist_ok=True)
    engine = Path(os.environ.get("EXODUSER_GODOT_BIN", str(
        Path.home() / ".codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot")))
    # Import the entire project: both port_modules global classes and SVG assets.
    if not run(project, out, engine, "import", "EXODUSER-integ-fix-Import-Isolated-20261021",
               ["--headless", "--editor", "--import"]):
        return 1
    success = True
    for name in args.suite:
        script, userdir = SUITES[name]
        # 41 observes Window visibility; headless correctly suspends its media.
        flags = (["--windowed", "--resolution", "960x540"] if name == "41" and args.audio_mode == "window" else ["--headless"])
        flags += ["--script", "res://tests/" + script + ".gd"]
        extra = ["--map11=off", "--node-bin=" + str(args.node_bin.resolve()),
                 "--source-game=" + str(project.parent / "game.html"),
                 "--source-root=" + str(args.source_root.resolve()),
                 "--acorn-root=" + str(args.source_root.resolve())]
        success = run(project, out, engine, name, userdir, flags, extra) and success
    return 0 if success else 1


if __name__ == "__main__":
    raise SystemExit(main())
