import { useState, useEffect } from 'react';

interface UseSidebarOptions {
  autoHideBreakpoint?: number; // Default breakpoint for auto-hide (pixels)
  defaultExpanded?: boolean;   // Default expanded state
}

export const useSidebar = (options: UseSidebarOptions = {}) => {
  const { autoHideBreakpoint = 768, defaultExpanded = true } = options;
  
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed on mobile by default
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      // Auto-expand on large screens, auto-collapse on mobile only during resize
      const isMobile = width < autoHideBreakpoint;
      
      // If switching from mobile to desktop, expand
      if (!isMobile && windowWidth < autoHideBreakpoint && !isExpanded) {
        setIsExpanded(defaultExpanded);
      }
      // If switching from desktop to mobile, collapse
      else if (isMobile && windowWidth >= autoHideBreakpoint && isExpanded) {
        setIsExpanded(false);
      }
    };

    // Initial setup
    const width = window.innerWidth;
    setWindowWidth(width);
    
    // Set initial expanded state based on screen size
    if (width >= autoHideBreakpoint) {
      setIsExpanded(defaultExpanded);
    } else {
      setIsExpanded(false); // Start collapsed on mobile
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Remove dependencies to avoid infinite loops

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const expandSidebar = () => {
    setIsExpanded(true);
  };

  const collapseSidebar = () => {
    setIsExpanded(false);
  };

  return {
    isExpanded,
    windowWidth,
    isMobile: windowWidth < autoHideBreakpoint,
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
  };
};
