#!/usr/bin/env bash
set -euo pipefail
TASK="$(cd "$(dirname "$0")" && pwd)"
ffmpeg -hide_banner -y -i "$TASK/delivery/native-silent.mp4" \
  -i "$TASK/input/prologue_theme.mp3" \
  -filter_complex "[1:a]atrim=start=60:end=90,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.3,afade=t=out:st=28.5:d=1.5,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -t 30 -movflags +faststart "$TASK/delivery/EXODUSER_ART_TEASER_30S_20261009.mp4"
