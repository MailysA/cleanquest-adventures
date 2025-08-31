import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  hasNotch: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export function useMobile(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    hasNotch: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait'
  });

  useEffect(() => {
    const updateMobileInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      
      // Check if app is running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      // Check for notch (simplified detection)
      const hasNotch = isIOS && (window.screen.height >= 812 || window.screen.width >= 812);
      
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

      setMobileInfo({
        isMobile,
        isIOS,
        isAndroid,
        isStandalone,
        hasNotch,
        screenWidth,
        screenHeight,
        orientation
      });
    };

    // Initial check
    updateMobileInfo();

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, []);

  return mobileInfo;
}

// Hook for haptic feedback (if available)
export function useHaptics() {
  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      // Check if Haptics plugin is available (Capacitor)
      if ('Haptics' in window) {
        const { Haptics } = await import('@capacitor/haptics');
        switch (type) {
          case 'light':
            await Haptics.impact({ style: 'light' });
            break;
          case 'medium':
            await Haptics.impact({ style: 'medium' });
            break;
          case 'heavy':
            await Haptics.impact({ style: 'heavy' });
            break;
        }
      } else if ('vibrate' in navigator) {
        // Fallback to Web Vibration API
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  return { triggerHaptic };
}

// Hook for mobile gestures
export function useMobileGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          // Swipe left
          return 'left';
        } else {
          // Swipe right
          return 'right';
        }
      }
    } else {
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0) {
          // Swipe up
          return 'up';
        } else {
          // Swipe down
          return 'down';
        }
      }
    }
    
    return null;
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    touchStart,
    touchEnd
  };
}

// Hook for mobile app state
export function useMobileApp() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleVisibilityChange = () => setIsVisible(!document.hidden);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isOnline, isVisible };
}
