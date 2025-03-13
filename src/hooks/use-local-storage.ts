import { isNullOrUndefined } from 'lib/isNullOrUndefined';
import { useState, useEffect } from 'react';

export function useLocalStorage(key: string, initialValue: unknown, saveInitial: boolean = false) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    // handle case where the environment does not support local storage (Node environment, Safari private mode, etc.)
    if (!window || !window.localStorage) {
      console.error('Use of Local Storage is not supported in this environment');
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // localStore can't accept functions, so execute if it is
      const unwrappedInitialValue = typeof initialValue === 'function' ? initialValue() : initialValue;

      // Save the initial value to the local if nessessary
      if ((!item || item === 'undefined') || (!!item && !isNullOrUndefined(unwrappedInitialValue) && saveInitial)) {
        window.localStorage.setItem(key, JSON.stringify(unwrappedInitialValue));
      }

      // Parse stored json or if none return initialValue
      if (saveInitial && !isNullOrUndefined(unwrappedInitialValue)) return unwrappedInitialValue;
      if (!!item && item !== 'undefined') return JSON.parse(item);
      return unwrappedInitialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      return typeof initialValue === 'function' ? initialValue() : initialValue;;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: Function | string | null) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteValue = () => {
    setValue(null);
    window.localStorage.removeItem(key);
  };

  // handle cross-context updates
  useEffect(() => {
    const { body } = document;
    const handleEvent = (event: StorageEvent) => {
      // ignore events from other storage areas or for other keys
      if (event.key !== key || event.storageArea !== window.localStorage) return;
      setValue(!!event.newValue ? JSON.parse(event.newValue) : null);
    };
    body.addEventListener('storage', handleEvent as EventListener);
    return () => body.removeEventListener('storage', handleEvent as EventListener);
  }, []);

  return [storedValue, setValue, deleteValue];
}
