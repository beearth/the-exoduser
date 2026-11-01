#!/bin/sh
set -eu
repo=/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024
root=/Users/fordeargamers/exoduser-wt/_out/web-media-derivatives-20261101
ffmpeg=/Users/fordeargamers/the-exoduser/output/marketing_video_20261008/runtime/ffmpeg
source_file="$root/build-input/video/world_intro_v22b_steam.mp4"
candidate="$root/candidates/world_intro_v22b_steam.web.mp4"
mkdir -p "$root/build-input/video" "$root/candidates"
if [ ! -f "$source_file" ]; then
  (cd "$repo" && GIT_NO_LAZY_FETCH=1 git cat-file blob 2b4770ff9ccba8d496673af52bdd6c8f37e8491e) > "$source_file"
fi
test "$(shasum -a 256 "$source_file" | cut -d ' ' -f 1)" = 3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f
"$ffmpeg" -hide_banner -loglevel error -i "$source_file" -map 0:v:0 -map 0:a:0 -c:v libx264 -preset medium -crf 20 -threads 2 -pix_fmt yuv420p -c:a copy -movflags +faststart -y "$candidate"
test "$(stat -f %z "$candidate")" -lt 100000000
shasum -a 256 "$candidate"
