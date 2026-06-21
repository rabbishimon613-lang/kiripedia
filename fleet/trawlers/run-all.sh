#!/usr/bin/env bash
# Cron entrypoint. Runs all trawlers, capped by budget.
# Suggested cron: every 6h
#   0 */6 * * * cd /Volumes/EOS_DIGITAL/KiriPedia && ./fleet/trawlers/run-all.sh >> fleet/ledger/cron.log 2>&1

set -u
cd "$(dirname "$0")/../.."

echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) fleet sortie ==="
node fleet/trawlers/youtube.mjs
# Future: node fleet/trawlers/web.mjs (uses fleet workers — budgeted separately)
echo "=== sortie complete ==="
