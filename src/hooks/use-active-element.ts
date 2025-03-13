import { useEffect, useState } from 'react';

export const useActiveElement = () => {
  const [activeElement, setActiveElement] = useState<Element | null>(() => {
    if (typeof document !== 'undefined') return document.activeElement;
    return null;
  });
  const [previousActiveElement, setPreviousActiveElement] = useState<Element | null>(null);

  const handleFocusIn = () => {
    setActiveElement((prev) => {
      setPreviousActiveElement(prev);
      return document.activeElement;
    });
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('focusin', handleFocusIn);
      return () => {
        document.removeEventListener('focusin', handleFocusIn);
      };
    }
  }, []);

  return { activeElement, previousActiveElement };
};
