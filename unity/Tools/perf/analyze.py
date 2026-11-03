#!/usr/bin/env python3
"""PERF-U0 analyzer: perf-frames.csv (+ perf-log-events.tsv, perf-meta.json) -> perf-summary.json + perf-summary.md.

Usage: python3 -I analyze.py <run dir> [--skip-seconds 3] [--compare <baseline run dir>]
Phases: 0 frontend/lobby, 1 field, 2 arena, 3 stage loading. 'play' = field+arena.
Only the standard library is used.
"""
import csv, json, math, os, sys

PHASES = {0: "frontend", 1: "field", 2: "arena", 3: "loading"}
SECTIONS = ["Update", "FixedSim", "Views", "Chunks", "Gui", "Hud", "R3Late", "Qa"]


def pct(values, q):
    if not values:
        return None
    s = sorted(values)
    return s[min(len(s) - 1, int(round((len(s) - 1) * q)))]


def mean(values):
    return sum(values) / len(values) if values else None


def load(run):
    rows = []
    with open(os.path.join(run, "perf-frames.csv"), newline="") as f:
        for r in csv.DictReader(f):
            rows.append({k: float(v) for k, v in r.items()})
    events = {}
    path = os.path.join(run, "perf-log-events.tsv")
    if os.path.exists(path):
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                parts = line.rstrip("\n").split("\t", 2)
                if len(parts) == 3 and parts[0].isdigit():
                    events.setdefault(int(parts[0]), []).append(parts[2])
    meta = {}
    path = os.path.join(run, "perf-meta.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            meta = json.load(f)
    return rows, events, meta


def alloc_series(rows):
    """Bytes allocated per frame: the GC Allocated In Frame recorder when valid, else positive GC Used Memory deltas."""
    if rows and rows[0]["gcAlloc"] >= 0:
        return [r["gcAlloc"] for r in rows], "recorder"
    out, prev = [], None
    for r in rows:
        used = r["gcUsed"]
        out.append(max(0.0, used - prev) if prev is not None and used >= 0 and r["gcCount"] == 0 else 0.0)
        prev = used
    return out, "gcUsedDelta"


def summarize(rows):
    if not rows:
        return None
    ms = [r["realMs"] for r in rows]
    seconds = sum(ms) / 1000
    alloc, source = alloc_series(rows)
    s = {
        "frames": len(rows), "seconds": round(seconds, 2), "avgFps": round(1000 * len(ms) / sum(ms), 1),
        "msP50": pct(ms, .5), "msP95": pct(ms, .95), "msP99": pct(ms, .99), "msMax": max(ms),
        "over16_7": sum(1 for m in ms if m > 16.7), "over33": sum(1 for m in ms if m > 33.4),
        "over100": sum(1 for m in ms if m > 100), "over500": sum(1 for m in ms if m > 500),
        "gcCollections": int(sum(r["gcCount"] for r in rows)),
        "gcPerMinute": round(sum(r["gcCount"] for r in rows) / max(seconds / 60, 1e-9), 2),
        "allocBytesPerFrameAvg": round(mean(alloc) or 0), "allocBytesPerFrameP95": pct(alloc, .95), "allocSource": source,
        "enemiesAvg": round(mean([r["enemies"] for r in rows]) or 0, 1), "enemiesMax": max(r["enemies"] for r in rows),
    }
    for key in ("cpuMainMs", "cpuRenderMs", "gpuMs"):
        v = [r[key] for r in rows if r[key] >= 0]
        s[key + "P50"] = pct(v, .5)
        s[key + "P95"] = pct(v, .95)
    for key in ("drawCalls", "batches", "setPass", "triangles"):
        v = [r[key] for r in rows if r[key] >= 0]
        s[key + "Avg"] = round(mean(v)) if v else None
        s[key + "Max"] = max(v) if v else None
    s["fixedStepsMax"] = max(r["fixedSteps"] for r in rows)
    s["guiCallsAvg"] = round(mean([r["guiCalls"] for r in rows]) or 0, 2)
    for name in SECTIONS:
        v = [r["ms" + name] for r in rows]
        s["sec" + name + "Avg"] = round(mean(v), 3)
        s["sec" + name + "P95"] = round(pct(v, .95), 3)
    return s


def long_frames(rows, events, limit=30, threshold=50):
    out = []
    for i, r in enumerate(rows):
        if r["realMs"] <= threshold:
            continue
        f = int(r["frame"])
        ev = events.get(f, []) + events.get(f - 1, [])
        sec = {n: round(r["ms" + n], 2) for n in SECTIONS if r["ms" + n] >= 1}
        out.append({"frame": f, "time": r["time"], "ms": r["realMs"], "phase": PHASES.get(int(r["phase"]), "?"),
                    "loadPhase": int(r["loadPhase"]), "enemies": int(r["enemies"]), "fixedSteps": int(r["fixedSteps"]),
                    "gc": int(r["gcCount"]), "cpuMain": r["cpuMainMs"], "gpu": r["gpuMs"], "sections": sec,
                    "shaderEvents": len([e for e in ev if "shader" in e.lower()]), "sampleEvent": ev[0][:160] if ev else ""})
    out.sort(key=lambda x: -x["ms"])
    return out[:limit], len(out)


def fmt(v):
    if v is None:
        return "-"
    if isinstance(v, float):
        return ("%.2f" % v) if abs(v) < 1000 else ("%.0f" % v)
    return str(v)


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    run = argv[1]
    skip = 3.0
    base = None
    if "--skip-seconds" in argv:
        skip = float(argv[argv.index("--skip-seconds") + 1])
    if "--compare" in argv:
        base = argv[argv.index("--compare") + 1]
    rows, events, meta = load(run)
    rows = [r for r in rows if r["time"] >= skip]
    report = {"run": os.path.abspath(run), "meta": meta, "skipSeconds": skip, "phases": {}}
    groups = {"all": rows, "play": [r for r in rows if int(r["phase"]) in (1, 2)]}
    for code, name in PHASES.items():
        groups[name] = [r for r in rows if int(r["phase"]) == code]
    for name, g in groups.items():
        sm = summarize(g)
        if sm:
            report["phases"][name] = sm
    report["longFrames"], report["longFrameCount"] = long_frames(rows, events)
    report["shaderEventCount"] = sum(len([e for e in v if "shader" in e.lower()]) for v in events.values())
    if base:
        b_rows, _, _ = load(base)
        b_rows = [r for r in b_rows if r["time"] >= skip]
        report["baseline"] = {"run": os.path.abspath(base), "play": summarize([r for r in b_rows if int(r["phase"]) in (1, 2)])}
    with open(os.path.join(run, "perf-summary.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
    keys = ["frames", "seconds", "avgFps", "msP50", "msP95", "msP99", "msMax", "over33", "over100", "over500",
            "cpuMainMsP95", "cpuRenderMsP95", "gpuMsP95", "allocBytesPerFrameAvg", "gcPerMinute", "drawCallsAvg", "batchesAvg", "setPassAvg",
            "enemiesAvg"] + ["sec%sAvg" % n for n in SECTIONS] + ["sec%sP95" % n for n in SECTIONS]
    names = [n for n in ("play", "field", "arena", "loading", "frontend") if n in report["phases"]]
    lines = ["# PERF-U0 " + os.path.basename(os.path.abspath(run)), "",
             "device %s / %s / %s / %dx%d / cap %s / remodel3d %s / dev %s" % (meta.get("device"), meta.get("api"), meta.get("quality"),
             meta.get("width", 0), meta.get("height", 0), meta.get("frameCap"), meta.get("remodel3d"), meta.get("development")), "",
             "| metric | " + " | ".join(names) + (" | baseline play |" if base else " |"),
             "|---|" + "---|" * len(names) + ("---|" if base else "")]
    for k in keys:
        row = "| %s | " % k + " | ".join(fmt(report["phases"][n].get(k)) for n in names) + " |"
        if base and report["baseline"]["play"]:
            row += " %s |" % fmt(report["baseline"]["play"].get(k))
        lines.append(row)
    lines += ["", "Long frames > 50 ms: %d (top %d below). Shader log events: %d" % (report["longFrameCount"], len(report["longFrames"]), report["shaderEventCount"]), "",
              "| t s | ms | phase | enemies | fixed | gc | shader | sections ≥1ms | log |", "|---|---|---|---|---|---|---|---|---|"]
    for lf in report["longFrames"]:
        lines.append("| %.1f | %.0f | %s/%d | %d | %d | %d | %d | %s | %s |" % (lf["time"], lf["ms"], lf["phase"], lf["loadPhase"], lf["enemies"], lf["fixedSteps"], lf["gc"],
                     lf["shaderEvents"], " ".join("%s=%s" % kv for kv in lf["sections"].items()), lf["sampleEvent"].replace("|", "/")[:90]))
    with open(os.path.join(run, "perf-summary.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines[:len(keys) + 6]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
