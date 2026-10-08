#!/usr/bin/env bash
set -euo pipefail
TASK="$(cd "$(dirname "$0")" && pwd)"
ffmpeg -hide_banner -i "$TASK/delivery/native-source-audio-r1.mp4" -i "$TASK/input/prologue_theme.mp3" -filter_complex "[0:a]afade=t=out:st=26.15:d=0.15[game];[1:a]atrim=start=14:end=40.3,asetpts=PTS-STARTPTS,volume=0.18,afade=t=in:st=0:d=0.4,afade=t=out:st=24.3:d=2[music];[game][music]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95:level=false:latency=true[a]" -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 256k -ac 2 -ar 48000 -t 26.3 -movflags +faststart "$TASK/delivery/EXODUSER_GAMEPLAY_TEASER_REVIEW_V2_R1_REPRODUCED.mp4"
