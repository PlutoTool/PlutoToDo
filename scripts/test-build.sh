#!/bin/bash

# Test script to verify the build setup locally
# Usage: ./scripts/test-build.sh

set -e

echo "🧪 Testing build setup..."

# Check if all required tools are installed
echo "📋 Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed"
    exit 1
fi
echo "✅ Rust: $(rustc --version)"

# Check Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI is not installed globally"
    echo "💡 Install with: npm install -g @tauri-apps/cli"
    # Try to use local tauri
    if [ -f "node_modules/.bin/tauri" ]; then
        echo "✅ Found local Tauri CLI"
    else
        exit 1
    fi
else
    echo "✅ Tauri CLI: $(tauri --version)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Test frontend build
echo "🏗️  Testing frontend build..."
npm run build

# Test Tauri build (without creating bundle to save time)
echo "🚀 Testing Tauri build (no bundle)..."
npm run tauri build -- --no-bundle

echo "✅ All tests passed! Build setup is working correctly."
echo "🎉 You can now create releases using the automated workflow."
