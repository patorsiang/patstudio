#!/usr/bin/env sh
# Reads .git/hook-audit.log and answers one question: can step 6 be promoted from
# `trialled` to `running` yet? flow.md defines that as "used on three consecutive units
# of work without being skipped", so the report groups by branch -- a branch is the
# closest thing this repo has to a unit of work -- rather than printing a commit total,
# which cannot be read as the rule is written.
#
# The log is per-clone and lives in .git/, so it is never committed and never conflicts.
# That also means it starts empty on a fresh clone, and the count starts over. Stated
# here because a promotion argued from an empty log would be the exact failure this
# instrument exists to prevent.

set -u
log="$(git rev-parse --git-dir)/hook-audit.log"

if [ ! -f "$log" ]; then
  echo "No commits recorded yet. The counter starts at the first commit after it was installed."
  exit 0
fi

total=$(wc -l < "$log" | tr -d ' ')
verified=$(grep -c '|verified|' "$log" || true)
bypassed=$(grep -c '|bypassed|' "$log" || true)
merges=$(grep -c '|merge|' "$log" || true)

echo "Step 6 hook audit"
echo "-----------------"
echo "commits recorded : $total"
echo "  verified       : $verified"
echo "  bypassed       : $bypassed"
echo "  merges skipped : $merges  (pre-merge-commit runs, not pre-commit -- not a bypass)"
echo ""
echo "By branch, newest first -- a branch is the unit of work:"
echo ""

awk -F'|' '
  $2 != "merge" {
    order[$4] = NR
    n[$4]++
    if ($2 == "bypassed") b[$4]++
  }
  END {
    for (br in n) printf "%d\t%s\t%d\t%d\n", order[br], br, n[br], (br in b ? b[br] : 0)
  }
' "$log" | sort -rn | while IFS="$(printf '\t')" read -r _ br count bad; do
  if [ "$bad" -eq 0 ]; then
    printf '  clean   %-28s %s commits, 0 bypassed\n' "$br" "$count"
  else
    printf '  SKIPPED %-28s %s commits, %s bypassed\n' "$br" "$count" "$bad"
  fi
done

echo ""
clean_run=$(awk -F'|' '$2 != "merge" { if (!seen[$4]++) ord[++k] = $4; if ($2 == "bypassed") bad[$4] = 1 }
  END { run = 0; for (i = k; i >= 1; i--) { if (bad[ord[i]]) break; run++ } print run }' "$log")

echo "Consecutive clean units of work, most recent first: $clean_run"
if [ "$clean_run" -ge 3 ]; then
  echo "=> Promotion condition MET. trialled -> running is now arguable on evidence."
else
  echo "=> Not yet. flow.md requires three; $clean_run so far."
fi
