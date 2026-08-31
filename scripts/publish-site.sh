#!/bin/sh
set -eu

./scripts/run-python-docs.sh scripts/publish-public-docs.py
./scripts/build-static-site.sh
