#!/bin/bash
set -e

echo "Building UI..."
cd ui && npm run build

echo "Copying UI to extension folder..."
cp -r dist/* ../extension/

echo "Done! You can now load the 'extension' folder into Chrome as an unpacked extension."
