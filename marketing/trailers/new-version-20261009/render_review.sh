#!/usr/bin/env bash
# Reproduce the review movie from an unpacked input/editable package.
# Run on the Higgsedit toolchain host. Never uploads or publishes.
set -euo pipefail
production_dir="${1:?Pass an absolute unpacked package directory}"
[[ "$production_dir" = /* && -d "$production_dir" ]] || exit 2
cd "$production_dir"
if [[ ! -f project/project.json ]]; then
  EXODUSER_PRODUCTION_DIR="$production_dir" higgsedit build "$production_dir/edit.jsx"
fi
higgsedit check "$production_dir/project"
mkdir -p renders
higgsedit render "$production_dir/project" \
  --out "$production_dir/renders/native-picture-game-audio.mp4" \
  --quality final --bitrate 20M --depth 8 --workers 4
ffmpeg -hide_banner -nostdin -y \
  -i renders/native-picture-game-audio.mp4 -i input/prologue_theme.mp3 \
  -filter_complex '[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.85,afade=t=out:st=13.8:d=0.2[g];[1:a]atrim=start=35:end=53,asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-24:TP=-6:LRA=8,afade=t=in:st=0:d=0.08,afade=t=out:st=16.5:d=1.5[m];[g][m]amix=inputs=2:duration=longest:normalize=0[a]' \
  -map '[a]' -t 18 -c:a pcm_s24le -ar 48000 -ac 2 renders/mix-before-master.wav \
  2> renders/mix.log
ffmpeg -hide_banner -nostdin -i renders/mix-before-master.wav \
  -af loudnorm=I=-14:TP=-2:LRA=9:print_format=json -f null - \
  2> renders/master-pass1.log
python3 - <<'PY'
import json
from pathlib import Path
log = Path('renders/master-pass1.log').read_text()
m = json.loads(log[log.rfind('{'):])
mapping = {'measured_I':'input_i', 'measured_TP':'input_tp',
           'measured_LRA':'input_lra', 'measured_thresh':'input_thresh',
           'offset':'target_offset'}
f = 'loudnorm=I=-14:TP=-2:LRA=9:linear=true:print_format=json'
for key, value in mapping.items():
    f += f':{key}={float(m[value])}'
Path('renders/master-filter.txt').write_text(f + '\n')
PY
ffmpeg -hide_banner -nostdin -y -i renders/native-picture-game-audio.mp4 \
  -i renders/mix-before-master.wav -map 0:v -map 1:a \
  -af "$(cat renders/master-filter.txt)" -t 18 \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart \
  renders/EXODUSER_NewVersion_CombatTeaser_20261009_REVIEW_V3.mp4 \
  2> renders/master-pass2.log
ffprobe -v error -show_format -show_streams -of json \
  renders/EXODUSER_NewVersion_CombatTeaser_20261009_REVIEW_V3.mp4 > renders/final-probe.json
ffmpeg -hide_banner -nostdin \
  -i renders/EXODUSER_NewVersion_CombatTeaser_20261009_REVIEW_V3.mp4 \
  -vn -af loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json -f null - \
  2> renders/final-audio-analysis.log
ffmpeg -v error -nostdin \
  -i renders/EXODUSER_NewVersion_CombatTeaser_20261009_REVIEW_V3.mp4 \
  -f null - 2> renders/final-decode.log
sha256sum renders/*.mp4 > renders/SHA256SUMS.txt
printf '%s\n' 'REVIEW CANDIDATE: actual visual inspection and listening remain separate from build/encode success. No public approval is granted by this script.'
