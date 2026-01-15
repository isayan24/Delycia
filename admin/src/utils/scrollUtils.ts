/**
 * Navbar scroll control utility functions
 */

import { create } from 'zustand';

interface ScrollControlProps {
  currentScrollY: number;
  lastScrollY: number;
  setVisible: (visible: boolean) => void;
  setLastScrollY: (scrollY: number) => void;
  threshold?: number; // Optional threshold parameter
}

interface TopScrollControlProps {
  currentScrollY: number;
  setShowImage: (show: boolean) => void;
  topThreshold?: number; // Optional threshold for top detection
}

// Create a global store for navbar visibility state
interface NavVisibilityStore {
  isNavVisible: boolean;
  setNavVisible: (visible: boolean) => void;
}

export const useNavVisibility = create<NavVisibilityStore>((set) => ({
  isNavVisible: true,
  setNavVisible: (visible: boolean) => set({ isNavVisible: visible }),
}));

/**
 * Controls navbar visibility based on scroll direction with threshold
 */
export const controlNavbarScroll = ({
  currentScrollY,
  lastScrollY,
  setVisible,
  setLastScrollY,
  threshold = 50, // Default threshold of 50px
}: ScrollControlProps) => {
  const scrollDifference = Math.abs(currentScrollY - lastScrollY);
  
  // Always show navbar at the top of the page
  if (currentScrollY <= 10) {
    setVisible(true);
    useNavVisibility.getState().setNavVisible(true);
    setLastScrollY(currentScrollY);
    return;
  }
  
  // Only process if scroll difference exceeds threshold
  if (scrollDifference >= threshold) {
    // Show navbar when scrolling up
    if (currentScrollY < lastScrollY) {
      setVisible(true);
      useNavVisibility.getState().setNavVisible(true);
    } 
    // Hide navbar when scrolling down
    else if (currentScrollY > lastScrollY) {
      setVisible(false);
      useNavVisibility.getState().setNavVisible(false);
    }
    
    // Update last scroll position only when threshold is met
    setLastScrollY(currentScrollY);
  }
};

/**
 * Controls background image visibility based on top position
 */
export const controlBackgroundImage = ({
  currentScrollY,
  setShowImage,
  topThreshold = 100, // Default threshold of 100px from top
}: TopScrollControlProps) => {
  // Show image only when at the top of the page
  if (currentScrollY <= topThreshold) {
    setShowImage(true);
  } else {
    setShowImage(false);
  }
};