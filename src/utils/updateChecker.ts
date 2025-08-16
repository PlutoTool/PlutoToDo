import { getVersion } from '@tauri-apps/api/app';

interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion?: string;
  currentVersion: string;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
}

const GITHUB_API_URL = 'https://api.github.com/repos/PlutoTool/PlutoToDo/releases';

// Read version from Tauri app configuration
const getAppVersion = async (): Promise<string> => {
  try {
    return await getVersion();
  } catch {
    // Fallback version if Tauri API is not available
    return '1.0.0';
  }
};

/**
 * Compare two semantic version strings
 * Returns true if newVersion is greater than currentVersion
 */
function compareVersions(currentVersion: string, newVersion: string): boolean {
  const cleanCurrent = currentVersion.replace(/^v/, '');
  const cleanNew = newVersion.replace(/^v/, '');
  
  const currentParts = cleanCurrent.split('.').map(num => parseInt(num, 10));
  const newParts = cleanNew.split('.').map(num => parseInt(num, 10));
  
  for (let i = 0; i < Math.max(currentParts.length, newParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const newPart = newParts[i] || 0;
    
    if (newPart > currentPart) return true;
    if (newPart < currentPart) return false;
  }
  
  return false;
}

/**
 * Check for updates from GitHub releases
 */
export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = await getAppVersion();
  console.log('Current app version:', currentVersion);
  
  try {
    console.log('Fetching releases from GitHub API...');
    const response = await fetch(GITHUB_API_URL);
    
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }
    
    const releases: GitHubRelease[] = await response.json();
    console.log('Fetched releases:', releases.length);
    
    // Filter out drafts and prereleases, get the latest stable release
    const stableReleases = releases.filter(release => !release.draft && !release.prerelease);
    console.log('Stable releases:', stableReleases.length);
    
    if (stableReleases.length === 0) {
      console.log('No stable releases found');
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: undefined,
        releaseUrl: undefined,
        releaseNotes: 'No releases have been published yet.',
        publishedAt: undefined,
      };
    }
    
    const latestRelease = stableReleases[0];
    console.log('Latest release:', latestRelease.tag_name);
    const hasUpdate = compareVersions(currentVersion, latestRelease.tag_name);
    console.log('Has update:', hasUpdate);
    
    return {
      hasUpdate,
      latestVersion: latestRelease.tag_name,
      currentVersion,
      releaseUrl: latestRelease.html_url,
      releaseNotes: latestRelease.body,
      publishedAt: latestRelease.published_at,
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return {
      hasUpdate: false,
      currentVersion,
    };
  }
}

/**
 * Get cached update info from localStorage
 */
export function getCachedUpdateInfo(): UpdateInfo | null {
  try {
    const cached = localStorage.getItem('pluto-todo-update-check');
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const cacheTime = data.timestamp;
    const now = Date.now();
    
    // Cache for 1 hour (3600000 ms)
    if (now - cacheTime > 3600000) {
      localStorage.removeItem('pluto-todo-update-check');
      return null;
    }
    
    return data.updateInfo;
  } catch (error) {
    console.error('Failed to get cached update info:', error);
    return null;
  }
}

/**
 * Cache update info to localStorage
 */
export function cacheUpdateInfo(updateInfo: UpdateInfo): void {
  try {
    const data = {
      updateInfo,
      timestamp: Date.now(),
    };
    localStorage.setItem('pluto-todo-update-check', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache update info:', error);
  }
}

/**
 * Check for updates with caching
 */
export async function checkForUpdatesWithCache(): Promise<UpdateInfo> {
  // First check cache
  const cached = getCachedUpdateInfo();
  if (cached) {
    return cached;
  }
  
  // If no cache, fetch from API
  const updateInfo = await checkForUpdates();
  
  // Cache the result
  cacheUpdateInfo(updateInfo);
  
  return updateInfo;
}
