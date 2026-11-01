#!/usr/bin/env python3
"""Rebuild lossless WAV->FLAC candidates from the pinned Git tree; no project edits."""
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import re
import wave

COMMIT = "58956eec7d35873d229d94d5244cb73f665ef49e"
ROOT = pathlib.Path(__file__).resolve().parent
REPO = pathlib.Path("/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024")
FFMPEG = pathlib.Path("/Users/fordeargamers/the-exoduser/output/marketing_video_20261008/runtime/ffmpeg")

def run(*args, **kw):
    return subprocess.run(args, check=True, **kw)

def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()

def source_rows():
    raw = run("git", "ls-tree", "-r", "-l", "-z", COMMIT, cwd=REPO,
              env={**os.environ, "GIT_NO_LAZY_FETCH": "1"}, capture_output=True).stdout
    for record in raw.split(b"\0"):
        if not record:
            continue
        meta, name = record.split(b"\t", 1)
        fields = meta.split()
        if len(fields) == 4 and fields[3].isdigit():
            yield name.decode(), fields[2].decode(), int(fields[3])

def extract(blob, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        with open(dst, "wb") as f:
            run("git", "cat-file", "blob", blob, cwd=REPO,
                env={**os.environ, "GIT_NO_LAZY_FETCH": "1"}, stdout=f)
    actual = run("git", "hash-object", str(dst), cwd=REPO, capture_output=True).stdout.decode().strip()
    if actual != blob:
        raise ValueError(f"Git blob mismatch: {dst}: {actual} != {blob}")

def decoded_pcm_hash(path):
    p = subprocess.Popen([str(FFMPEG), "-hide_banner", "-loglevel", "error", "-i", str(path),
        "-map", "0:a:0", "-c:a", "pcm_s16le", "-f", "s16le", "-"], stdout=subprocess.PIPE)
    h = hashlib.sha256()
    for b in iter(lambda: p.stdout.read(1 << 20), b""):
        h.update(b)
    if p.wait() != 0:
        raise RuntimeError(f"PCM decode failed: {path}")
    return h.hexdigest()

def main():
    entries = []
    pcm_cache = {}
    candidate_cache = {}
    for path, blob, size in source_rows():
        if not (path.startswith("bgm/") and path.lower().endswith(".wav")):
            continue
        src = ROOT / "build-input" / path
        dst = ROOT / "candidates" / pathlib.Path(path).with_suffix(".flac")
        extract(blob, src)
        if src.stat().st_size != size:
            raise ValueError(f"source size mismatch: {path}")
        if blob not in candidate_cache:
            dst.parent.mkdir(parents=True, exist_ok=True)
            if not dst.exists():
                run(str(FFMPEG), "-hide_banner", "-loglevel", "error", "-i", str(src),
                    "-map", "0:a:0", "-c:a", "flac", "-compression_level", "8", "-threads", "2", "-y", str(dst))
            pcm_cache[blob] = decoded_pcm_hash(src)
            if pcm_cache[blob] != decoded_pcm_hash(dst):
                raise ValueError(f"decoded PCM mismatch: {path}")
            candidate_cache[blob] = dst
        else:
            # Duplicate source paths get their own deliverable alias without a second encode.
            if not dst.exists():
                os.link(candidate_cache[blob], dst)
            pcm_cache.setdefault(blob, decoded_pcm_hash(src))
        if dst.stat().st_size >= size:
            raise ValueError(f"no size saving: {path}")
        with wave.open(str(src), "rb") as wav:
            channels, sample_rate, sample_frames, sample_width = wav.getnchannels(), wav.getframerate(), wav.getnframes(), wav.getsampwidth()
        info = run("afinfo", str(dst), capture_output=True).stdout.decode()
        fmt = re.search(r"Data format:\s*(\d+) ch,\s*(\d+) Hz", info)
        frames = re.search(r"audio (\d+) valid frames", info)
        if not fmt or not frames or (int(fmt[1]),int(fmt[2]),int(frames[1])) != (channels,sample_rate,sample_frames):
            raise ValueError(f"FLAC sample rate/channels/frame count mismatch: {path}")
        entries.append({"source_path": path, "source_commit": COMMIT, "source_git_blob": blob,
            "source_sha256": sha(src), "source_bytes": size, "candidate_path": str(dst.relative_to(ROOT)),
            "candidate_sha256": sha(dst), "candidate_bytes": dst.stat().st_size,
            "codec": "FLAC", "mime": "audio/flac", "decoded_s16le_pcm_sha256": pcm_cache[blob],
            "decoded_pcm_identical": True,"channels":channels,"sample_rate_hz":sample_rate,
            "sample_frames":sample_frames,"source_sample_width_bytes":sample_width})
        print(f"PASS {path}: {size} -> {dst.stat().st_size}", flush=True)
    out = {"source_commit": COMMIT, "entries": entries,
           "source_bytes": sum(e["source_bytes"] for e in entries),
           "candidate_bytes": sum(e["candidate_bytes"] for e in entries)}
    (ROOT / "bgm-flac-manifest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(f"TOTAL {out['source_bytes']} -> {out['candidate_bytes']}")

if __name__ == "__main__":
    main()
