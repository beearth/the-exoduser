"""Prepare only reviewed real-time intervals; retain an immutable provenance chain.

No compositing, graphics, gameplay alteration, interpolation, or speed changes.
Native Higgsedit owns the final edit. Raw recordings remain in Downloads.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(os.environ.get("EXODUSER_INPUT_PACKAGE", str(ROOT / "output/trailer-production-20261009/production-input-v1")))
FFMPEG = ROOT / "output/trailer-production-20261009/.venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
CHECKOUT = "/Users/fordeargamers/Projects/exoduser-migration-20261001"
COMMIT = "c34da0ec5de7ac0b2c1be0d2383e734b6ba7307b"
SELECTION = [
    ("charge-hook", "1791504338294", 7.1, 2.7, "NORMAL_TUTORIAL", 3),
    ("field-movement", "1791504916671", 5.8, 2.4, "NORMAL_PLAY", 8),
    ("weapon-strikes", "1791504338294", 0.4, 1.6, "NORMAL_TUTORIAL", 3),
    ("magic-impact", "1791504385432", 7.3, 1.6, "NORMAL_TUTORIAL", 4),
    ("trap-retreat", "1791504385432", 21.4, 2.7, "NORMAL_TUTORIAL", 4),
    ("field-charge", "1791504808409", 8.5, 3.0, "NORMAL_TUTORIAL", 7),
]


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    OUT.mkdir(parents=True, exist_ok=False)
    (OUT / "input").mkdir()
    (OUT / "evidence").mkdir()
    for filename in ("originallogo.png", "dm-sans-400.woff2", "dm-sans-700.woff2", "DM-Sans-OFL.txt"):
        shutil.copy2(ROOT / "output/trailer-production-20261009/input" / filename, OUT / "input" / filename)
    records = {}
    for name, stamp, start, duration, capture_kind, number in SELECTION:
        raw = Path.home() / "Downloads" / f"verified_manual_{stamp}.mp4"
        raw_audit = raw.with_suffix(".json")
        evidence = json.loads(raw_audit.read_text())
        assert evidence["sourceStable"] is True and evidence["staged"] is False
        assert evidence["manipulation"]["combatValuesChanged"] is False
        assert evidence["manipulation"]["spawnedEnemies"] is False
        original_hash = digest(raw)
        original_audit_hash = digest(raw_audit)
        game_hash = evidence["preRecordingVerification"]["sources"]["game"]["sha256"]
        target = OUT / "input" / f"{name}.mp4"
        command = [str(FFMPEG), "-hide_banner", "-nostdin", "-v", "warning", "-ss", str(start), "-i", str(raw),
                   "-t", str(duration + 0.10), "-vf", "fps=30", "-c:v", "libx264", "-crf", "18", "-preset", "fast",
                   "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                   "-movflags", "+faststart", str(target)]
        subprocess.run(command, check=True)
        prepared_hash = digest(target)
        review = f"candidate-take-{number:02d}-review.md"
        shutil.copy2(ROOT / "marketing/trailers/new-version-20261009" / review, OUT / "evidence" / review)
        if not (OUT / "evidence" / raw_audit.name).exists():
            shutil.copy2(raw_audit, OUT / "evidence" / raw_audit.name)
        build = {"checkout": CHECKOUT, "commit": COMMIT, "gameSha256": game_hash}
        audit = {
            "status": "REVIEW_CANDIDATE", "approved": False, "mediaSha256": prepared_hash, "build": build,
            "captureKind": capture_kind, "serverPort": 3387, "staged": False,
            "agentSpawnedEnemies": False, "agentModifiedCombatValues": False,
            "baseGameTutorialSpawns": capture_kind == "NORMAL_TUTORIAL",
            "tutorialCarryover": number == 7,
            "currentVersionVerified": True, "visualReview": "PARTIAL", "audioReview": "UNHEARD",
            "sourceAudioHeard": False, "reviewedBy": "FDG production / Codex root and source-review agents",
            "reviewedAt": "2026-10-09", "evidence": f"evidence/{review}",
            "derivation": {"rawLocalFile": str(raw), "rawSha256": original_hash,
                "rawAuditFile": f"evidence/{raw_audit.name}", "rawAuditSha256": original_audit_hash,
                "originalFromSeconds": start, "selectedDurationSeconds": duration,
                "originalInSeconds": start, "originalOutSeconds": start + duration + 0.10,
                "method": "FFMPEG_TRIM_H264_CRF18_CFR30_AAC48K_REALTIME", "speed": 1, "interpolation": False,
                "preparedTailPaddingSeconds": 0.1, "sourceSpeed": 1,
                "outputClock": "CFR30 by frame duplication/drop only; no interpolation or retiming",
                "command": command},
            "limitations": ["Canvas layers only; HTML HUD excluded by recorder",
                "Development footage; equivalence to downloadable Steam demo is unverified",
                "No actual full-audio listening approval"],
        }
        audit_name = f"input/{name}.audit.json"
        (OUT / audit_name).write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n")
        records[name] = {"status": "REVIEW_CANDIDATE", "approved": False, "file": f"input/{name}.mp4",
            "auditFile": audit_name, "sha256": prepared_hash, "build": build, "captureKind": capture_kind,
            "selectedDurationFrames": round(duration * 30), "originalFromSeconds": start,
            "reviewFile": f"evidence/{review}"}
        print(f"Prepared {name}: {duration:.2f}s selected, {target.stat().st_size} bytes")
    (OUT / "prepared-sources.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
