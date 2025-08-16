import { useState, useEffect } from 'react';
import { checkForUpdatesWithCache, UpdateInfo } from '../utils/updateChecker';

export function useUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('Checking for updates...');
      const info = await checkForUpdatesWithCache();
      console.log('Update check result:', info);
      setUpdateInfo(info);
    } catch (err) {
      console.error('Update check failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check for updates on component mount
    checkForUpdates();
  }, []);

  return {
    updateInfo,
    isChecking,
    error,
    checkForUpdates,
  };
}
