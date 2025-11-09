import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveConfig {
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
}

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

function getScreenSize(width: number): ScreenSize {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

function getResponsiveConfig(dimensions: ScaledSize): ResponsiveConfig {
  const { width, height } = dimensions;
  const screenSize = getScreenSize(width);
  
  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    width,
    height,
    isLandscape: width > height,
  };
}

export function useResponsive(): ResponsiveConfig {
  const [config, setConfig] = useState<ResponsiveConfig>(() =>
    getResponsiveConfig(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setConfig(getResponsiveConfig(window));
    });

    return () => subscription?.remove();
  }, []);

  return config;
}

export function useIsLargeScreen(): boolean {
  const { isTablet, isDesktop } = useResponsive();
  return isTablet || isDesktop;
}
