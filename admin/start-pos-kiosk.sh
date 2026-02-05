#!/bin/bash

# Load Environment Variables from .env file if it exists
if [ -f .env ]; then
  # Export variables from .env, ignoring comments
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
# Use POS_URL from .env, otherwise default to localhost:4500
URL="${POS_URL:-http://localhost:4500}"

echo "=================================================="
echo "   STARTING DELYCIA POS TERMINAL (KIOSK MODE)    "
echo "=================================================="
echo "Target URL: $URL"
echo "Mode: Kiosk + Silent Printing"
echo ""
echo "NOTE: To exit Kiosk mode, press ALT + F4 or CTRL + W"
echo ""

# Check for Chrome/Chromium and launch
if command -v google-chrome &> /dev/null; then
    google-chrome --kiosk --kiosk-printing "$URL"
elif command -v google-chrome-stable &> /dev/null; then
    google-chrome-stable --kiosk --kiosk-printing "$URL"
elif command -v chromium &> /dev/null; then
    chromium --kiosk --kiosk-printing "$URL"
elif command -v chromium-browser &> /dev/null; then
    chromium-browser --kiosk --kiosk-printing "$URL"
else
    echo "ERROR: Google Chrome or Chromium browser not found."
    echo "Please install Chrome to use Kiosk printing features."
    exit 1
fi
