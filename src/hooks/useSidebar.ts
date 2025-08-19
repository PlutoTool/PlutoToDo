import { useState, useEffect, useRef } from 'react';

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
  const previousWidthRef = useRef<number>(windowWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const previousWidth = previousWidthRef.current;
      
      // Update refs and state
      previousWidthRef.current = width;
      setWindowWidth(width);
      
      // Determine mobile state transitions
      const isMobile = width < autoHideBreakpoint;
      const wasMobile = previousWidth < autoHideBreakpoint;
      
      // If switching from desktop to mobile, collapse
      if (isMobile && !wasMobile) {
        console.log('Switching to mobile - collapsing sidebar');
        setIsExpanded(false);
      }
      // If switching from mobile to desktop, expand
      else if (!isMobile && wasMobile) {
        console.log('Switching to desktop - expanding sidebar');
        setIsExpanded(defaultExpanded);
      }
    };

    // Initial setup
    const width = window.innerWidth;
    previousWidthRef.current = width;
    setWindowWidth(width);
    
    // Set initial expanded state based on screen size
    if (width >= autoHideBreakpoint) {
      setIsExpanded(defaultExpanded);
    } else {
      setIsExpanded(false); // Start collapsed on mobile
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoHideBreakpoint, defaultExpanded]); // Add proper dependencies

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
