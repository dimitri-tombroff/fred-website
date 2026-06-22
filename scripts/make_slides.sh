#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLIDES_SRC="$REPO_ROOT/slides"
SLIDES_OUT="$REPO_ROOT/static/slides"

mkdir -p "$SLIDES_OUT"

# Copy diagrams folder so relative image paths resolve when served.
# Remove any prior copy first so re-runs stay idempotent (cp -r into an
# existing dir would otherwise nest it as diagrams/diagrams).
if [[ -d "$SLIDES_SRC/diagrams" ]]; then
  rm -rf "$SLIDES_OUT/diagrams"
  cp -r "$SLIDES_SRC/diagrams" "$SLIDES_OUT/diagrams"
fi

shopt -s nullglob
md_files=("$SLIDES_SRC"/*.md)

if [[ ${#md_files[@]} -eq 0 ]]; then
  echo "No .md files found in $SLIDES_SRC"
  exit 0
fi

for src in "${md_files[@]}"; do
  filename="$(basename "$src" .md)"
  out="$SLIDES_OUT/${filename}.html"

  echo "Building: $filename ..."
  # cd into slides/ so relative image paths (e.g. diagrams/) resolve correctly
  (cd "$SLIDES_SRC" && marp "$filename.md" --allow-local-files --html -o "$out")
  echo "  -> $out"
done

echo "Done. ${#md_files[@]} slide deck(s) built."
