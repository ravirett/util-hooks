import { useEffect, useRef } from 'react';

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const timeoutID = useRef<ReturnType<typeof setTimeout> | undefined>();

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return () => { };
    }

    timeoutID.current = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(timeoutID.current);
  }, [delay]);

  return () => {
    clearTimeout(timeoutID.current);
  };
}
