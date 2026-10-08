#!/usr/bin/env python3
"""Prepare accurately trimmed game footage for a zero-trim native composition.

Standard library only. Original WebM files are never changed. A manifest is
published only after all five encoded MP4 files pass metadata/frame checks.
This tool does not establish visual quality, audibility, or Steam equivalence.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from fractions import Fraction
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys


SPECS = (
    ("parry", Fraction(5), 5),
    ("rage_slam", Fraction(1), 7),
    ("fire", Fraction(2), 8),
    ("ice_orb", Fraction(29, 30), 7),
    ("blackhole", Fraction(1), 7),
)
FPS = 30


class PreparationError(RuntimeError):
    pass


def number(value):
    """Return a finite Decimal or None, never an invented duration."""
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None
    return result if result.is_finite() else None


def run(command, timeout):
    try:
        result = subprocess.run(
            command, check=False, capture_output=True, text=True, timeout=timeout
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise PreparationError(f"Command could not finish: {command[0]}: {exc}") from exc
    if result.returncode:
        raise PreparationError(
            f"Command failed ({result.returncode}): {command[0]}\n"
            f"{result.stderr[-6000:]}"
        )
    return result.stdout


def probe(path, ffprobe, timeout, count_frames=False):
    command = [ffprobe, "-v", "error"]
    if count_frames:
        command.append("-count_frames")
    command += ["-show_streams", "-show_format", "-of", "json", str(path)]
    try:
        return json.loads(run(command, timeout))
    except json.JSONDecodeError as exc:
        raise PreparationError(f"Invalid ffprobe JSON: {path}") from exc


def stream_of(metadata, kind, path):
    for stream in metadata.get("streams", []):
        if stream.get("codec_type") == kind:
            return stream
    raise PreparationError(f"Missing {kind} stream: {path}")


def packet_extent(path, ffprobe, timeout):
    """Video packets only: audio tails must not extend usable picture length.

    Packet PTS + packet duration is observed timing. If duration is absent we
    conservatively use PTS alone, rather than adding an assumed last-frame time.
    Negative initial timestamps do not extend the positive source trim range.
    """
    command = [
        ffprobe, "-v", "error", "-select_streams", "v:0", "-show_packets",
        "-show_entries", "packet=pts_time,dts_time,duration_time", "-of", "json",
        str(path),
    ]
    try:
        packets = json.loads(run(command, timeout)).get("packets", [])
    except json.JSONDecodeError as exc:
        raise PreparationError(f"Invalid packet JSON: {path}") from exc
    start = None
    end = None
    missing_duration = 0
    usable = 0
    for packet in packets:
        pts = number(packet.get("pts_time"))
        if pts is None:
            pts = number(packet.get("dts_time"))
        if pts is None:
            continue
        duration = number(packet.get("duration_time"))
        if duration is None or duration <= 0:
            duration = Decimal(0)
            missing_duration += 1
        start = pts if start is None else min(start, pts)
        packet_end = pts + duration
        end = packet_end if end is None else max(end, packet_end)
        usable += 1
    if end is None or end <= 0:
        raise PreparationError(f"No positive observed video packet extent: {path}")
    return end, {
        "packetStart": float(start),
        "packetEnd": float(end),
        "videoPackets": usable,
        "packetsWithoutDuration": missing_duration,
    }


def observed_duration(path, metadata, ffprobe, timeout, video_only=False):
    video = stream_of(metadata, "video", path)
    # Prefer video duration over format duration (which can include audio tails).
    duration = number(video.get("duration"))
    if duration is not None and duration > 0:
        return duration, "video_stream.duration", {}
    if not video_only:
        duration = number(metadata.get("format", {}).get("duration"))
        if duration is not None and duration > 0:
            return duration, "format.duration", {}
    duration, details = packet_extent(path, ffprobe, timeout)
    return duration, "max_video_packet_pts_plus_duration", details


def choose_original(directory, key):
    exact = directory / f"{key}.original.webm"
    if exact.is_file():
        return exact
    # Support renamed raw captures while refusing ambiguous source selection.
    token = re.compile(rf"(?:^|[_-]){re.escape(key)}(?:[_.-]|$)")
    originals = sorted(
        p for p in directory.glob("*.original.webm")
        if p.is_file() and token.search(p.name)
    )
    if len(originals) == 1:
        return originals[0]
    if len(originals) > 1:
        raise PreparationError(f"Ambiguous original WebM for {key}: {originals}")
    exact = directory / f"{key}.webm"
    if exact.is_file():
        return exact
    raw = sorted(
        p for p in directory.glob("raw*.webm")
        if p.is_file() and token.search(p.name) and not p.name.endswith(".original.webm")
    )
    if len(raw) == 1:
        return raw[0]
    raise PreparationError(f"Expected one original/raw WebM for {key}; found {raw}")


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def rate(value, path):
    try:
        result = Fraction(str(value))
    except (ValueError, ZeroDivisionError) as exc:
        raise PreparationError(f"Invalid frame rate {value!r}: {path}") from exc
    return result


def validate_output(path, source_video, seconds, ffprobe, timeout):
    metadata = probe(path, ffprobe, timeout, count_frames=True)
    video = stream_of(metadata, "video", path)
    audio = stream_of(metadata, "audio", path)
    duration, basis, packet_details = observed_duration(
        path, metadata, ffprobe, timeout, video_only=True
    )
    expected_frames = seconds * FPS
    try:
        frames = int(video["nb_read_frames"])
    except (KeyError, ValueError, TypeError) as exc:
        raise PreparationError(f"Cannot verify decoded video frame count: {path}") from exc
    if frames != expected_frames:
        raise PreparationError(f"{path}: {frames} frames; expected exactly {expected_frames}")
    if duration < Decimal(seconds):
        raise PreparationError(f"{path}: observed video {duration}s is shorter than {seconds}s")
    if duration > Decimal(seconds) + Decimal(1) / FPS:
        raise PreparationError(f"{path}: observed video {duration}s exceeds trim by over one frame")
    if rate(video.get("avg_frame_rate"), path) != FPS:
        raise PreparationError(f"{path}: expected 30fps, got {video.get('avg_frame_rate')}")
    expected_size = (int(source_video["width"]), int(source_video["height"]))
    actual_size = (int(video.get("width", 0)), int(video.get("height", 0)))
    if actual_size != expected_size or min(actual_size) <= 0:
        raise PreparationError(f"{path}: resolution {actual_size}; expected {expected_size}")
    if video.get("codec_name") != "h264" or video.get("pix_fmt") != "yuv420p":
        raise PreparationError(f"{path}: expected H.264/yuv420p output")
    if audio.get("codec_name") != "aac":
        raise PreparationError(f"{path}: expected original-source audio encoded as AAC")
    if path.stat().st_size <= 0:
        raise PreparationError(f"Empty encoded file: {path}")
    return {
        "sourceDuration": float(duration),
        "durationBasis": basis,
        "frames": frames,
        "fps": FPS,
        "width": actual_size[0],
        "height": actual_size[1],
        "videoCodec": video["codec_name"],
        "pixelFormat": video["pix_fmt"],
        "audioCodec": audio["codec_name"],
        "audioSampleRate": audio.get("sample_rate"),
        "audioChannels": audio.get("channels"),
        "formatDuration": metadata.get("format", {}).get("duration"),
        "bytes": path.stat().st_size,
        **packet_details,
    }


def prepare(args):
    directory = Path(args.input_dir).expanduser().resolve()
    if not directory.is_dir():
        raise PreparationError(f"Input directory not found: {directory}")
    jobs = []
    # Check ALL original ranges before encoding anything.
    for key, start, seconds in SPECS:
        original = choose_original(directory, key).resolve()
        metadata = probe(original, args.ffprobe, args.timeout)
        video = stream_of(metadata, "video", original)
        stream_of(metadata, "audio", original)  # Never synthesize missing game audio.
        duration, basis, packet_details = observed_duration(
            original, metadata, args.ffprobe, args.timeout
        )
        source_start = Decimal(start.numerator) / Decimal(start.denominator)
        if source_start + seconds > duration:
            raise PreparationError(
                f"{key}: original trim {start}+{seconds}s exceeds observed {duration}s ({basis})"
            )
        stat = original.stat()
        jobs.append({
            "key": key, "start": start, "seconds": seconds,
            "original": original, "sourceVideo": video,
            "originalDuration": duration, "originalDurationBasis": basis,
            "packetDetails": packet_details,
            "originalSignature": (stat.st_size, stat.st_mtime_ns),
            "originalSha256": sha256(original),
        })
    pending = []
    manifest = {}
    manifest_temp = directory / f".prepared.{os.getpid()}.json.tmp"
    try:
        for job in jobs:
            key, start, seconds = job["key"], job["start"], job["seconds"]
            final = directory / f"{key}.prepared.mp4"
            temporary = directory / f".{key}.prepared.{os.getpid()}.tmp.mp4"
            pending.append((temporary, final))
            start_text = format(Decimal(start.numerator) / Decimal(start.denominator), ".12f")
            command = [
                args.ffmpeg, "-hide_banner", "-nostdin", "-loglevel", "warning", "-y",
                "-ss", start_text, "-i", str(job["original"]), "-t", str(seconds),
                "-map", "0:v:0", "-map", "0:a:0",
                # Ordinary timestamp-based frame selection/duplication only;
                # no motion interpolation, synthetic padding, loop, or speed-up.
                "-vf", "fps=30", "-fps_mode", "cfr",
                "-c:v", "libx264", "-crf", "12", "-preset", "fast",
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k",
                "-movflags", "+faststart", str(temporary),
            ]
            print(f"Preparing {key}: source {start}+{seconds}s", file=sys.stderr)
            run(command, args.timeout)
            output = validate_output(
                temporary, job["sourceVideo"], seconds, args.ffprobe, args.timeout
            )
            current = job["original"].stat()
            if (current.st_size, current.st_mtime_ns) != job["originalSignature"]:
                raise PreparationError(f"Original changed during preparation: {job['original']}")
            manifest[key] = {
                "file": str(final),
                **output,
                "originalFile": str(job["original"]),
                "originalFrom": float(start),
                "originalFromExact": str(start),
                "originalDur": seconds,
                "originalDuration": float(job["originalDuration"]),
                "originalDurationBasis": job["originalDurationBasis"],
                "originalPacketTiming": job["packetDetails"],
                "originalSha256": job["originalSha256"],
                "sha256": sha256(temporary),
                "preparedAtUtc": datetime.now(timezone.utc).isoformat(),
                "preparation": "accurate_source_trim_then_30fps_h264_crf12_aac256k",
                "ffmpegCommand": command,
                "nativeCompositionTrimStart": 0,
                "visualAudioReview": "pending",
                "steamBuildEquivalence": "unverified",
            }
        # All five files were validated. Generated outputs may replace earlier
        # generated outputs; the original WebM files are never renamed/deleted.
        for temporary, final in pending:
            os.replace(temporary, final)
        with manifest_temp.open("w", encoding="utf-8") as handle:
            json.dump(manifest, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        manifest_path = directory / "prepared.json"
        os.replace(manifest_temp, manifest_path)
        print(str(manifest_path))
    finally:
        for temporary, _ in pending:
            temporary.unlink(missing_ok=True)
        manifest_temp.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", default="/home/user/exoduser-fresh")
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--ffprobe", default="ffprobe")
    parser.add_argument("--timeout", type=float, default=300, help="Per-command timeout in seconds")
    args = parser.parse_args()
    if args.timeout <= 0:
        parser.error("--timeout must be positive")
    try:
        prepare(args)
    except (PreparationError, OSError, KeyError, ValueError) as exc:
        print(f"Preparation failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
