#!/bin/bash
# Compile third-place-matrix.ts to JS for legacy tool compatibility
# Run this before deploying if you get "cannot find module" errors

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