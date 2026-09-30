#!/usr/bin/env python3
"""S-02 BGM compression evaluation for 지옥의 길 (The Exoduser).

Measures what can be measured without listening: container/codec format,
size, duration and sample count, loudness (EBU R128 integrated, true peak),
clipping after decode, leading/trailing silence (encoder delay/padding that
would break a gapless loop), loop-seam jump, null-test residual against the
original, and tags. Originals are never modified.

Usage:
  python3 tools/bgm_compress_eval.py survey                 # every WAV the game loads
  python3 tools/bgm_compress_eval.py encode OUT_DIR WAV...  # make candidates + compare
Needs ffmpeg on PATH and numpy.
Owned by docs/6사운드디자인/SOUND_TEAM_LEAD.md (S-02).
"""
import os, re, sys, json, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000  # analysis rate; every file is resampled to it so sample counts compare
# name -> (extension, ffmpeg codec args)
CANDIDATES = {
    "ogg_q6": (".ogg", ["-c:a", "libvorbis", "-q:a", "6"]),
    "opus_160k": (".opus", ["-c:a", "libopus", "-b:a", "160k", "-vbr", "on"]),
    "mp3_256k": (".mp3", ["-c:a", "libmp3lame", "-b:a", "256k"]),
}


def run(args):
    return subprocess.run(args, capture_output=True, text=True, errors="ignore")


def probe(path):
    """Format line, duration and tags from `ffmpeg -i` (no ffprobe needed)."""
    err = run(["ffmpeg", "-hide_banner", "-i", path]).stderr
    stream = re.search(r"Stream #\d:\d.*?Audio: (.+)", err)
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    br = re.search(r"bitrate: (\d+) kb/s", err)
    tags = {}
    meta = re.search(r"Metadata:\n((?:\s{4}.+\n)+)", err)
    if meta:
        for line in meta.group(1).splitlines():
            k, _, v = line.strip().partition(":")
            if k.strip().lower() not in ("encoder",):
                tags[k.strip()] = v.strip()
    secs = int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3)) if dur else None
    return {"format": stream.group(1).strip() if stream else "?", "duration_s": secs,
            "kbps": int(br.group(1)) if br else None, "tags": tags}


def loudness(path):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true",
               "-f", "null", "-"]).stderr
    tail = err[err.rfind("Summary:"):]
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", tail)
    lra = re.search(r"LRA:\s+(-?[\d.]+) LU", tail)
    tp = re.search(r"Peak:\s+(-?[\d.inf]+) dBFS", tail)
    return {"lufs": float(i.group(1)) if i else None, "lra": float(lra.group(1)) if lra else None,
            "true_peak_dbfs": float(tp.group(1)) if tp and tp.group(1) != "-inf" else None}


def pcm(path):
    """Decode to float32 stereo at SR (ffmpeg honours gapless headers where present)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)


def edge_silence(x, thresh_db=-60.0):
    mono = np.abs(x).max(axis=1)
    loud = np.nonzero(mono > 10 ** (thresh_db / 20))[0]
    if not len(loud):
        return len(x), len(x)
    return int(loud[0]), int(len(x) - 1 - loud[-1])


def seam_jump(x):
    """Step between the last and first sample when the file wraps (a.loop=true), in dBFS.
    Below about -40 dBFS is inaudible as a click; near 0 dBFS is a hard click."""
    return round(float(20 * np.log10(np.abs(x[0] - x[-1]).max() + 1e-9)), 1)


def pcm_stats(x):
    lead, trail = edge_silence(x)
    return {"samples": int(len(x)), "clip_samples": int((np.abs(x) >= 0.9999).any(axis=1).sum()),
            "lead_silence_ms": round(lead / SR * 1000, 1), "trail_silence_ms": round(trail / SR * 1000, 1),
            "seam_jump_dbfs": seam_jump(x)}


def null_test(ref, cand):
    """Align by FFT cross-correlation (+-4096 samples, 20 s window from 10 s in), then the
    residual level relative to the original in dB. Lower = closer to the original."""
    MAXLAG = 4096
    s = min(SR * 10, max(0, len(ref) - SR * 20 - MAXLAG))
    a = ref[s:s + SR * 20, 0].astype(np.float64)
    b = cand[max(0, s - MAXLAG):s + SR * 20 + MAXLAG, 0].astype(np.float64)
    nfft = 1 << int(np.ceil(np.log2(len(a) + len(b))))
    xc = np.fft.irfft(np.fft.rfft(b, nfft) * np.conj(np.fft.rfft(a, nfft)), nfft)
    off = max(0, s - MAXLAG)
    lags = [l for l in range(-MAXLAG, MAXLAG + 1) if 0 <= s + l - off < len(xc)]
    lag = max(lags, key=lambda l: xc[s + l - off])
    r0, c0 = (0, lag) if lag >= 0 else (-lag, 0)
    n = min(len(ref) - r0, len(cand) - c0)
    r, c = ref[r0:r0 + n], cand[c0:c0 + n]
    resid = 10 * np.log10(np.mean((r - c) ** 2) + 1e-20) - 10 * np.log10(np.mean(r ** 2) + 1e-20)
    return {"align_lag_samples": lag, "residual_db": round(float(resid), 1)}


def game_wavs():
    text = open(os.path.join(ROOT, "game.html"), encoding="utf-8", errors="ignore").read()
    refs = sorted(set(unicodedata.normalize("NFC", m) for m in re.findall(r"bgm/[^'\"`<>\n]+?\.wav", text)))
    return refs


def survey():
    rows = []
    for rel in game_wavs():
        p = os.path.join(ROOT, rel)
        row = {"file": rel, "bytes": os.path.getsize(p), **probe(p), **loudness(p)}
        row.update(pcm_stats(pcm(p)))
        rows.append(row)
        print(json.dumps(row, ensure_ascii=False), flush=True)
    return rows


def encode(out_dir, wavs):
    os.makedirs(out_dir, exist_ok=True)
    for rel in wavs:
        src = os.path.join(ROOT, rel)
        base = os.path.splitext(os.path.basename(rel))[0]
        ref = pcm(src)
        orig = {"file": rel, "variant": "original_wav", "bytes": os.path.getsize(src), **probe(src),
                **loudness(src), **pcm_stats(ref)}
        print(json.dumps(orig, ensure_ascii=False), flush=True)
        for name, (ext, args) in CANDIDATES.items():
            dst = os.path.join(out_dir, f"{base}.{name}{ext}")
            # -map_metadata 0 keeps source tags; 44.1 kHz stays unless the codec needs 48 kHz (Opus).
            r = run(["ffmpeg", "-y", "-v", "error", "-i", src, "-map_metadata", "0", *args, dst])
            if r.returncode:
                print(json.dumps({"file": rel, "variant": name, "error": r.stderr[-300:]}), flush=True)
                continue
            x = pcm(dst)
            row = {"file": rel, "variant": name, "out": os.path.relpath(dst, ROOT), "bytes": os.path.getsize(dst),
                   "size_pct": round(os.path.getsize(dst) / orig["bytes"] * 100, 1), **probe(dst), **loudness(dst),
                   **pcm_stats(x), "sample_delta": int(len(x) - len(ref)), **null_test(ref, x)}
            print(json.dumps(row, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "survey":
        survey()
    elif len(sys.argv) >= 4 and sys.argv[1] == "encode":
        encode(sys.argv[2], sys.argv[3:])
    else:
        print(__doc__)
