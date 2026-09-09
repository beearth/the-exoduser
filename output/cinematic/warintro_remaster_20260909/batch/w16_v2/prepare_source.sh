#!/usr/bin/env bash
set -euo pipefail
# Input: original W16 generated animation saved as generated.mp4.
# Retain the skull grin; discard the later humanizing face transition.
ffmpeg -v error -i generated.mp4 -t 1.8 -an -c:v libx264 -crf 16 trim.mp4
ffmpeg -v error -i trim.mp4 -vf 'setpts=3.3333333333*(PTS-STARTPTS)' -r 24 -t 6 -an -c:v libx264 -crf 16 source.mp4
