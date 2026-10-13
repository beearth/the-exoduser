#!/bin/zsh
set -eu
package_dir="${0:A:h}"
project_dir="$package_dir/snapshot"
runtime="/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot"
if [[ ! -x "$runtime" ]]; then
  printf '%s\n' "Godot 4.7.2 runtime is missing: $runtime" >&2
  exit 1
fi
if [[ ! -f "$project_dir/project.godot" ]]; then
  printf '%s\n' "Review snapshot is missing: $project_dir/project.godot" >&2
  exit 1
fi
exec "$runtime" --path "$project_dir"
