#!/bin/zsh
set -eu
project_dir="${0:A:h}"
runtime="${FDG_GODOT_BIN:-}"
if [[ -z "$runtime" ]]; then
  for candidate in /Applications/Godot.app/Contents/MacOS/Godot "$HOME/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot"; do
    if [[ -x "$candidate" ]]; then runtime="$candidate"; break; fi
  done
fi
if [[ -z "$runtime" ]]; then runtime="$(command -v godot4 || command -v godot || true)"; fi
if [[ -z "$runtime" || ! -x "$runtime" ]]; then
  print -u2 "Godot 4.7.2 경로를 FDG_GODOT_BIN에 지정한 뒤 다시 실행하세요."
  exit 1
fi
print "EXODUSER native partial preview · checkout: ${project_dir:h}"
print "웹 최신 본편 전체와 동일한 완성 범위가 아닙니다."
if [[ ! -d "$project_dir/.godot/imported" ]]; then
  print -u2 "이 checkout의 Godot 리소스 import가 필요합니다. 자동 전체 import는 실행하지 않습니다."
  exit 1
fi
exec "$runtime" --path "$project_dir" "$@" -- --fdg-native-perspective-first
