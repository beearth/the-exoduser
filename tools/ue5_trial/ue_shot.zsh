#!/bin/zsh
# ue_shot.zsh <tag> <w> <h> <fov> <dpcvars or -> [extra]
set -u; tag=$1;w=$2;h=$3;fov=$4;cv=$5;shift 5
SP=${0:A:h};P=~/EXODUSER-Storage/ue5-trial/EXO_UE5_Trial;O=~/exoduser-wt/_out/UE5;E="/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor"
rm -rf $P/Saved/Screenshots; export UE_OUT=$O UE_TAG=$tag UE_FOV=$fov UE_WARM=${UE_WARM:-45}; S=$(date +%s)
dp=(); [ "$cv" != "-" ] && dp=(-dpcvars="$cv")
perl -e 'alarm 900; exec @ARGV' "$E" $P/EXO_UE5_Trial.uproject -game -windowed -ResX=$w -ResY=$h -ForceRes -nosound -unattended -nosplash -stdout -FullStdOutLogOutput $dp -ExecCmds="py $SP/run_shot.py" "$@" </dev/null > $O/$tag.log 2>&1 &
pid=$!; max=0; while kill -0 $pid 2>/dev/null; do r=$(ps -o rss= -p $pid 2>/dev/null | tr -d ' '); [ -n "$r" ] && [ "$r" -gt $max ] && max=$r; sleep 3; done; wait $pid; rc=$?
f=$(find $P/Saved/Screenshots -name '*.png' 2>/dev/null | head -1); [ -n "$f" ] && cp "$f" $O/$tag.png
echo "$tag rc=$rc sec=$(( $(date +%s)-S )) maxRSS_MB=$((max/1024)) png=$(sips -g pixelWidth -g pixelHeight $O/$tag.png 2>/dev/null | awk '/pixel/{printf $2" "}')"; cat $O/$tag.perf.json 2>/dev/null | tr -d '\n ' ; echo; grep -E 'SHOT_DONE|Fatal error|LogPython: Error|shader.*compil' $O/$tag.log | head -4 | cut -c1-220
