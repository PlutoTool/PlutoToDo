import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ExternalLink, Heart, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const openWebsite = async () => {
    console.log('Attempting to open PlutoTool website...');
    try {
      // Import the openUrl function from Tauri's opener plugin
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      console.log('openUrl function imported successfully');
      await openUrl('https://plutotool.com');
      console.log('Successfully opened PlutoTool website');
    } catch (error) {
      console.error('Failed to open website with Tauri opener:', error);
      try {
        // Fallback to window.open for development/web
        console.log('Trying fallback with window.open');
        window.open('https://plutotool.com', '_blank');
        console.log('Opened with window.open fallback');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Could not open website. Please visit https://plutotool.com manually.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About Pluto: To-do"
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* App Info */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Zap className="w-8 h-8 text-blue-500 mr-2" />
            <h2 className="text-2xl font-bold text-foreground">Pluto: To-do</h2>
          </div>
          <p className="text-muted-foreground">
            Organize your universe with this powerful, cross-platform task manager
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Task management with categories and tags
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Priority levels and due dates
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Dark mode support
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Cross-platform compatibility
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Offline-first with local database
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Built With</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              Rust
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              Tauri 2
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              TypeScript
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              React
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              Tailwind CSS
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              SQLite
            </span>
          </div>
        </div>

        {/* PlutoTool Promotion */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center mb-2">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-foreground">Discover More Tools</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Pluto: To-do is part of the PlutoTool collection - a suite of productivity tools 
            designed to help you stay organized and efficient.
          </p>
          <Button
            onClick={openWebsite}
            className="w-full justify-center"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit PlutoTool.com
          </Button>
        </div>

        {/* Version Info */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Version 1.0.1 • Made with ❤️ by PlutoTool
          </p>
        </div>
      </div>
    </Modal>
  );
};
