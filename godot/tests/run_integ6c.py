#!/usr/bin/env python3
"""INTEG-6c single-pass regression. No PC test or combat writer is modified."""
import argparse
import json
from pathlib import Path
import shutil
from mac_harness import run

SUITES = [
    ("bgm_override", "test_demo11_field_bgm_override", "EXODUSER-demo11-field-bgm-Isolated-20261021", False, True),
    ("41", "test_demo11_41_music_lifecycle", "EXODUSER-demo11-41-Isolated-20261021", True, True),
    ("AUDIO-01", "test_audio_01_mix", "EXODUSER-AUDIO-01-Isolated", False, True),
    ("37", "test_demo11_encounter", "EXODUSER-demo11-37-Isolated-20261021", False, False),
    ("42", "test_demo11_42_hud_owner", "EXODUSER-demo11-42-Isolated-20261021", True, False),
    ("44_average", "test_demo11_44_boss_average", "EXODUSER-demo11-44-Isolated-20261021", False, False),
    ("44_pets", "test_demo11_44_pet_events", "EXODUSER-demo11-44-Isolated-20261021", False, False),
    ("43", "test_demo11_43_stage_spawn_adapter", "EXODUSER-demo11-43-Isolated-20261021", True, False),
    ("23b", "test_demo11_23b_intro_gate", "EXODUSER-demo11-23b-Isolated-20261021", False, False),
    ("E2E", "test_demo11_47h_e2e", "EXODUSER-demo11-47h-Isolated-20261021", False, False),
]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--suite", nargs="*", default=None)
    parser.add_argument("--skip-import", action="store_true")
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    engine = Path.home()/".codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot"
    out = args.out.resolve()
    node = shutil.which("node")
    assert node
    success = True
    if not args.skip_import:
        success = run(project, out, engine, "import", "EXODUSER-INTEG-6c-Import-Isolated", ["--headless", "--editor", "--import"], timeout=600)
        if not success:
            return 1
    for name, script, userdir, legacy, window in SUITES:
        if args.suite is not None and name not in args.suite:
            continue
        flags = ["--windowed", "--resolution", "960x540"] if window else ["--headless"]
        flags += ["--script", "res://tests/"+script+".gd"]
        extra = ["--source-root="+str(project.parent), "--source-game="+str(project.parent/"game.html"), "--node-bin="+node]
        if legacy:
            extra += ["--map11=off"]
        if name == "42":
            extra += ["--captures="+str(out/"headless-captures-must-not-exist")]
        if name == "E2E":
            extra += ["--demo11-storage=on", "--results-path="+str(out/"e2e-stages.json")]
        success = run(project, out, engine, name, userdir, flags, extra, timeout=450 if name=="E2E" else 180) and success
    return 0 if success else 1

if __name__ == "__main__":
    raise SystemExit(main())
