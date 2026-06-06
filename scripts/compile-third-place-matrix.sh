#!/bin/bash
# Compile third-place-matrix.ts to JS for legacy tool compatibility
# NOTE: Astro/Vite can use the .ts file directly, so this script is mainly
# for tools that require CommonJS .js files.
#
# Usage:
#   ./scripts/compile-third-place-matrix.sh    # Compile to JS
#   ./scripts/delete-third-place-matrix-js.sh   # Delete the compiled JS files
#
# The JS files (third-place-matrix.js and .js.map) are NOT needed for:
#   - Astro build (Vite handles .ts natively)
#   - Functions deployment (uses functions/src/data/third-place-matrix.ts)
#
# They are kept in git for any legacy tools that might need them.

cd /Users/cscovino/github/quiniela

echo "Compiling third-place-matrix.ts to JS..."

npx tsc src/data/third-place-matrix.ts \
  --outDir src/data \
  --declaration \
  --skipLibCheck \
  --module commonjs \
  --target es2022 \
  --esModuleInterop \
  --strict false \
  src/data/third-place-matrix.ts 2>&1

if [ $? -eq 0 ]; then
  echo "✓ Compiled successfully"
  ls -la src/data/third-place-matrix.* 2>&1
else
  echo "✗ Compilation failed"
  exit 1
fi