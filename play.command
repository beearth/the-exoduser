#!/bin/zsh
set -eu
project_dir="${0:A:h}"
cd "$project_dir"
runtime="${FDG_NODE_BIN:-}"
if [[ -z "$runtime" && -x "$HOME/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node" ]]; then
  runtime="$HOME/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node"
fi
if [[ -z "$runtime" ]]; then runtime="$(command -v node || true)"; fi
if [[ -z "$runtime" || ! -x "$runtime" ]]; then
  print -u2 "Node 실행 경로를 FDG_NODE_BIN에 지정하세요."
  exit 1
fi
print "EXODUSER web source: $project_dir"
print "Git: $(git rev-parse --short HEAD 2>/dev/null || print unknown)"
print "http://127.0.0.1:3333/index.html"
print "3333이 사용 중이면 기존 서버를 먼저 직접 종료하세요. 이 런처는 기존 서버를 종료하지 않습니다."
exec "$runtime" "$project_dir/server.cjs"
