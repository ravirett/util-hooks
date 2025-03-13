import { useState } from 'react';
import Cookie from 'js-cookie';

const getItem = (key: string) => Cookie.get(key);

const setItem = (name: string, value: string, options: Cookie.CookieAttributes = {}) => Cookie.set(name, value, options);

/**
 *
 * @param {String} key The key to store our data to
 * @param {String} defaultValue The default value to return in case the cookie doesn't exist
 * @param {Cookie.CookieAttributes} options The options to pass to the cookie
 */
export const useCookie = (key: string, defaultValue: string, options: Cookie.CookieAttributes = {}) => {
  const getCookie = () => getItem(key) || defaultValue;
  const [cookie, setCookie] = useState<string | null>(getCookie());

  const updateCookie = (value: string) => {
    if (!value) {
      Cookie.remove(key, options);
      setCookie(null);
    } else {
      setCookie(value);
      setItem(key, value, options);
    }
  };

  return [cookie, updateCookie];
};
