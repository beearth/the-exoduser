#!/usr/bin/env bash
set -euo pipefail
TASK="$(cd "$(dirname "$0")" && pwd)"
ffmpeg -hide_banner -y \
  -i "$TASK/delivery/native-source-audio.mp4" \
  -i "$TASK/input/prologue_theme.mp3" \
  -filter_complex "[0:a]afade=t=out:st=29.6:d=0.4[game];[1:a]atrim=start=60:end=90,asetpts=PTS-STARTPTS,volume='if(lt(t,2),0.12,if(lt(t,6),0.24,if(lt(t,11.8),0.16,if(lt(t,13.3),0.055,if(lt(t,18),0.18,if(lt(t,25),0.24,0.18))))))':eval=frame,afade=t=in:st=0:d=0.25,afade=t=out:st=27.5:d=2.5[music];[game][music]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.2:LRA=11[a]" \
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -t 30 -movflags +faststart "$TASK/delivery/EXODUSER_HERO_TRAILER_30S_REVIEW_20261008.mp4"
