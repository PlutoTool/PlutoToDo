# Automated Build and Release System

This project uses GitHub Actions to automatically build and release the Tauri application across multiple platforms when a new version tag is pushed to the repository.

## Supported Platforms

The automated build system creates releases for:
- **macOS**: Both Intel (x86_64) and Apple Silicon (aarch64) architectures
- **Windows**: x86_64 architecture
- **Linux**: x86_64 architecture (Ubuntu 22.04 base)

## How to Create a Release

### Option 1: Using the Release Script (Recommended)

Use the provided release script to automatically update versions and create tags:

```bash
# Create a patch release (1.0.1 -> 1.0.2)
npm run release:patch

# Create a minor release (1.0.1 -> 1.1.0)
npm run release:minor

# Create a major release (1.0.1 -> 2.0.0)
npm run release:major
```

The script will:
1. Check that you're on the main branch
2. Ensure there are no uncommitted changes
3. Pull the latest changes
4. Update version numbers in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`
5. Commit the changes
6. Create and push a git tag
7. Trigger the automated build and release process

### Option 2: Manual Release

If you prefer to create releases manually:

1. Update the version in all relevant files:
   - `package.json`
   - `src-tauri/tauri.conf.json` 
   - `src-tauri/Cargo.toml`

2. Commit your changes:
   ```bash
   git add .
   git commit -m "Release v1.0.2"
   ```

3. Create and push a tag:
   ```bash
   git tag -a v1.0.2 -m "Release v1.0.2"
   git push origin main
   git push origin v1.0.2
   ```

## Build Process

When a tag is pushed, the GitHub Actions workflow will:

1. **Setup Environment**: Install Node.js 20, Rust, and platform-specific dependencies
2. **Install Dependencies**: Run `npm install --legacy-peer-deps` to handle peer dependency conflicts
3. **Build Application**: Use `tauri-action` to build the application for each platform
4. **Create Release**: Automatically create a GitHub release with all platform binaries

## Monitoring Builds

You can monitor the build progress at:
https://github.com/PlutoTool/PlutoToDo/actions

## Continuous Integration

The project also includes a CI workflow that runs on every push and pull request to ensure code quality and build integrity across all platforms.

## Troubleshooting

### Build Failures

If a build fails:
1. Check the GitHub Actions logs for specific error messages
2. Ensure all version numbers are synchronized across files
3. Verify that the tag follows the `v*` pattern (e.g., `v1.0.1`)

### Dependencies Issues

The build uses `--legacy-peer-deps` flag to handle React 19 peer dependency conflicts. If you encounter dependency issues:
1. Try running `npm install --legacy-peer-deps` locally first
2. Update the workflow if additional flags are needed

### Platform-Specific Issues

- **macOS**: Requires Xcode Command Line Tools
- **Linux**: Requires WebKit2GTK development libraries
- **Windows**: Uses Windows Latest with MSVC toolchain

## Security

The GitHub Actions workflow uses:
- `GITHUB_TOKEN` for creating releases (automatically provided by GitHub)
- No additional secrets required for basic functionality
- All builds run in isolated GitHub-hosted runners
