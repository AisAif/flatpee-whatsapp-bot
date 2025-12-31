#!/bin/bash
set -e

echo "🚀 Starting application..."

# Ensure we're in a Git repo
if [ ! -d ".git" ]; then
  echo "❌ This directory is not a Git repository."
  exit 1
fi

# Sync with remote
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
echo "📥 Pulling latest from $CURRENT_BRANCH (force sync)..."
git fetch origin
git reset --hard origin/$CURRENT_BRANCH
git clean -fd

# Check project root
if [ ! -f "package.json" ]; then
  echo "❌ Please run this script from the project root directory."
  exit 1
fi

# Check docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

# Ask if the user wants to rebuild the image
echo "Do you want to rebuild the image? (y/n)"
read -r REBUILD
docker compose down

if [[ "$REBUILD" == "y" || "$REBUILD" == "Y" ]]; then
  echo "🔄 Rebuilding the image before starting Docker Compose..."
  docker compose down --rmi local
  docker compose --env-file ./.env up --build -d
else
  echo "🚀 Starting containers without rebuilding..."
  docker compose --env-file ./.env up -d
fi

# Show status
echo "🔍 Checking container status..."
docker compose ps

echo "✅ Application started successfully."
