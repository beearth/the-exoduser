#!/bin/zsh
# PERF-U0 Mac run: waits until no other Unity Editor / EXODUSER player runs, then one perf fullrun.
# usage: run-mac.sh <app> <out dir> [extra player args...]
#   e.g. run-mac.sh build/EXODUSER-Unity.app _out/perf/r1-baseline -qa-max-ticks 7200
# Uncapped (no -perf-cap), 1920x1080 window, muted, isolated save, no PNG capture (PerfProbe disables FullRunShot).
set -u
app=$1; out=$2; shift 2
mkdir -p "$out/sandbox"
others() { ps -axo pid=,command= | grep -E "Unity.app/Contents/MacOS/Unity|EXODUSER-Unity.app/Contents/MacOS|EXODUSER .*QA" | grep -v grep | grep -v "$app" | wc -l | tr -d ' '; }
waited=0
while [ "$(others)" -gt 0 ]; do
  [ $waited -ge 5400 ] && { echo "PERF_WAIT_TIMEOUT others=$(others)"; exit 3; }
  sleep 30; waited=$((waited+30))
done
echo "PERF_START waited=${waited}s $(date '+%F %T')"
bundle=$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$app/Contents/Info.plist")
# caffeinate -d -u keeps the display awake (a sleeping display stops Metal presentation: GPU time reads ~0 and frame pacing is invalid).
# App Nap would throttle a background window and distort frame times; disable it for this test bundle only, restore after.
defaults write "$bundle" NSAppSleepDisabled -bool YES
start=$(date +%s)
caffeinate -d -i -u open -g -n -W "$app" --args --remodel3d --unity-mute --unity-perf --unity-fullrun-qa \
  --unity-qa-sandbox "$out/sandbox" -output "$out" -qa-locale ko \
  -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -popupwindow -nosound -logFile "$out/player.log" "$@"
code=$?
defaults delete "$bundle" NSAppSleepDisabled 2>/dev/null
echo "PERF_END open=$code elapsed=$(( $(date +%s)-start ))s"
grep -E "FULLRUN_RESULT|UNITY_PERF_WRITTEN|Renderer:|GfxDevice" "$out/player.log" | head -8
[ -f "$out/perf-frames.csv" ] && python3 -I "$(dirname "$0")/analyze.py" "$out"
