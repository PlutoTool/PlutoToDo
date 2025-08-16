import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { UpdateInfo } from '../utils/updateChecker';
import { ExternalLink, Download } from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
}) => {
  const handleDownload = () => {
    if (updateInfo.releaseUrl) {
      window.open(updateInfo.releaseUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatReleaseNotes = (notes: string) => {
    // Simple markdown-like formatting for release notes
    return notes
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return <h3 key={index} className="font-semibold text-lg mt-4 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={index} className="font-medium text-base mt-3 mb-1">{line.slice(4)}</h4>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={updateInfo.hasUpdate ? "Update Available" : updateInfo.latestVersion ? "You're Up to Date" : "No Releases Available"}
      size="xl"
    >
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-6">
          {updateInfo.hasUpdate 
            ? "A new version of Pluto: To-do is available"
            : updateInfo.latestVersion 
              ? "You have the latest version of Pluto: To-do"
              : "No releases have been published yet for Pluto: To-do"
          }
        </p>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Version Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Current Version:</span>
                <span className="font-mono text-sm">{updateInfo.currentVersion}</span>
              </div>
              {updateInfo.latestVersion ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Latest Version:</span>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {updateInfo.latestVersion}
                    </span>
                  </div>
                  {updateInfo.publishedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Released:</span>
                      <span className="text-sm">{formatDate(updateInfo.publishedAt)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm text-orange-600 dark:text-orange-400">No releases published</span>
                </div>
              )}
            </div>

            {/* Release Notes */}
            {updateInfo.hasUpdate && updateInfo.releaseNotes && (
              <div>
                <h3 className="font-semibold text-base mb-3">What's New</h3>
                <div className="prose prose-sm max-w-none text-foreground">
                  {formatReleaseNotes(updateInfo.releaseNotes)}
                </div>
              </div>
            )}

            {!updateInfo.hasUpdate && updateInfo.latestVersion && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">All up to date!</h3>
                <p className="text-muted-foreground">
                  You're running the latest version of Pluto: To-do.
                  We'll notify you when new updates are available.
                </p>
              </div>
            )}

            {!updateInfo.hasUpdate && !updateInfo.latestVersion && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">No releases yet</h3>
                <p className="text-muted-foreground mb-4">
                  You're running version {updateInfo.currentVersion}, but no official releases have been published on GitHub yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back later or visit{' '}
                  <a 
                    href="https://github.com/PlutoTool/PlutoToDo/releases" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub Releases
                  </a>
                  {' '}for updates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            {updateInfo.hasUpdate ? "Later" : "Close"}
          </Button>
          {updateInfo.hasUpdate && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download Update
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
