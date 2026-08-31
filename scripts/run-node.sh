#!/bin/sh
set -eu

if command -v node >/dev/null 2>&1; then
  exec node "$@"
fi

bundled_node="/Users/reniborges/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

if [ -x "$bundled_node" ]; then
  exec "$bundled_node" "$@"
fi

echo "node is not available in PATH and bundled runtime was not found." >&2
exit 1
