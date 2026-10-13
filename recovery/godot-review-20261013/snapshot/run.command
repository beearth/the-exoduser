#!/bin/zsh
set -eu
project_dir="${0:A:h}"
runtime="/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot"
exec "$runtime" --path "$project_dir"
