import { isNullOrUndefined } from 'lib/isNullOrUndefined';
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T), saveInitial: boolean = false): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    // handle case where the environment does not support local storage (Node environment, Safari private mode, etc.)
    if (!window || !window.localStorage) {
      console.error('Use of Local Storage is not supported in this environment');
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // localStore can't accept functions, so execute if it is
      const unwrappedInitialValue = typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;

      // Save the initial value to the local if nessessary
      if ((!item || item === 'undefined') || (!!item && !isNullOrUndefined(unwrappedInitialValue) && saveInitial)) {
        window.localStorage.setItem(key, JSON.stringify(unwrappedInitialValue));
      }

      // Parse stored json or if none return initialValue
      if (saveInitial && !isNullOrUndefined(unwrappedInitialValue)) return unwrappedInitialValue;
      if (!!item && item !== 'undefined') return JSON.parse(item) as T;
      return unwrappedInitialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = typeof value === 'function'
        ? (value as (val: T) => T)(storedValue)
        : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
      // Check if the error is due to quota exceeded
      if (error instanceof DOMException &&
        (error.code === 22 || // Chrome
          error.name === 'QuotaExceededError' || // Safari
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) { // Firefox
        console.warn('localStorage quota exceeded');
      }
    }
  };

  const deleteValue = () => {
    setStoredValue(null as unknown as T);
    window.localStorage.removeItem(key);
  };

  // handle cross-context updates
  useEffect(() => {
    const handleEvent = (event: StorageEvent) => {
      // ignore events from other storage areas or for other keys
      if (event.key !== key || event.storageArea !== window.localStorage) return;
      setValue(!!event.newValue ? JSON.parse(event.newValue) as T : null as unknown as T);
    };
    window.addEventListener('storage', handleEvent);
    return () => window.removeEventListener('storage', handleEvent);
  }, []);

  return [storedValue, setValue, deleteValue];
}
