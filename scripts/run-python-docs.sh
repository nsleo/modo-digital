#!/bin/sh
set -eu

if python3 -c "import docx" >/dev/null 2>&1; then
  exec python3 "$@"
fi

bundled_python="/Users/reniborges/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"

if [ -x "$bundled_python" ]; then
  exec "$bundled_python" "$@"
fi

echo "python-docx is not available in python3 and bundled runtime was not found." >&2
exit 1
