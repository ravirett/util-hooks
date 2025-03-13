import { useEffect, useMemo, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';

export const useInViewport = (ref: RefObject<HTMLElement> | MutableRefObject<HTMLElement>) => {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(() => new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting)), []);

  useEffect(() => {
    observer.observe(ref.current as Element);

    // Remove the observer when component is unmounted
    return () => observer.disconnect();
  }, [ref, observer]);

  return isIntersecting;
};
