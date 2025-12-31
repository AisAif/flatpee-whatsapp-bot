#!/bin/bash

echo "🛑 Stopping application..."

# Stop Docker containers
docker compose down

if [ $? -ne 0 ]; then
  echo "❌ Failed to stop Docker containers."
  exit 1
fi

echo "✅ App stopped successfully."
