#!/bin/bash

# Script to create a new release
# Usage: ./scripts/release.sh [patch|minor|major] [message]

set -e

VERSION_TYPE=${1:-patch}
MESSAGE=${2:-"Release version"}

echo "🚀 Creating new release..."

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Please switch to main branch before creating a release"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Pull latest changes
echo "📦 Pulling latest changes..."
git pull origin main

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Calculate new version
case $VERSION_TYPE in
    major)
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print ($1+1)".0.0"}')
        ;;
    minor)
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."($2+1)".0"}')
        ;;
    patch)
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2"."($3+1)}')
        ;;
    *)
        echo "❌ Invalid version type. Use: patch, minor, or major"
        exit 1
        ;;
esac

echo "New version: $NEW_VERSION"

# Update package.json version
echo "📝 Updating package.json..."
npm version $NEW_VERSION --no-git-tag-version

# Update tauri.conf.json version
echo "📝 Updating tauri.conf.json..."
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json

# Update Cargo.toml version
echo "📝 Updating Cargo.toml..."
sed -i '' "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml

# Commit changes
echo "💾 Committing changes..."
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "$MESSAGE v$NEW_VERSION"

# Create and push tag
echo "🏷️  Creating tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "$MESSAGE v$NEW_VERSION"

echo "🚀 Pushing changes and tag..."
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Release v$NEW_VERSION created successfully!"
echo "🔗 Check the GitHub Actions workflow for build progress:"
echo "   https://github.com/PlutoTool/PlutoToDo/actions"
