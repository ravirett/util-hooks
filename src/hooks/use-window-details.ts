import { useState, useEffect } from 'react';

interface IWindowDetails {
  size: {
    width: number | undefined;
    height: number | undefined;
  };
  position: {
    top: number | undefined;
    left: number | undefined;
  };
}

// Hook
export const useWindowDetails = () => {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowDetails, setWindowDetails] = useState<IWindowDetails>({
    size: {
      width: undefined,
      height: undefined,
    },
    position: {
      top: undefined,
      left: undefined,
    },
  });

  useEffect(() => {
    // short circuit in case of SSR!
    if (typeof window === 'undefined') return;

    // Handler to call on window resize
    // @TODO: This is a bit of a hack, we should probably use ResizeObserver. Also, probably should debounce it.
    const handleResize = () => {
      // Set window width/height to state
      setWindowDetails({
        size: {
          width: window.outerWidth,
          height: window.outerHeight,
        },
        position: {
          top: window.screenTop,
          left: window.screenLeft,
        },
      });
    }
    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowDetails;
}
