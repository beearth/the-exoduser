#!/bin/zsh
# Opt-in only. Usage: ./run-look-001.command --mode A|B|C|D (default A).
set -eu
task_root="${0:A:h:h}"
exec /usr/bin/python3 "$task_root/tools/look001_run_compare.py" "$@"
