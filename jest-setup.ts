/* eslint-disable no-unused-vars, no-console */
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

declare global {
  var localStorageMock: Storage;
  var sessionStorageMock: Storage;
  var intersectionObserverEntries: { isIntersecting: boolean }[];
}

global.localStorageMock = (() => {
  let store: Record<string, string> = {};

  //@ts-ignore
  const storage: Storage = {
    getItem: jest.fn((key: string) => store[key] || null) as unknown as Storage['getItem'],
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }) as unknown as Storage['setItem'],
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }) as unknown as Storage['removeItem'],
    clear: jest.fn(() => {
      store = {};
    }) as unknown as Storage['clear'],
    key: jest.fn((index: number) => Object.keys(store)[index] || null) as unknown as Storage['key'],
  };

  return Object.assign(Object.create(window.localStorage), storage);
})();

global.sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  //@ts-ignore
  const storage: Storage = {
    getItem: jest.fn((key: string) => store[key] || null) as unknown as Storage['getItem'],
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }) as unknown as Storage['setItem'],
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }) as unknown as Storage['removeItem'],
    clear: jest.fn(() => {
      store = {};
    }) as unknown as Storage['clear'],
    key: jest.fn((index: number) => Object.keys(store)[index] || null) as unknown as Storage['key'],
  };

  return Object.assign(Object.create(window.sessionStorage), storage);
})();

// Usage:
// IN YOUR TEST! Add your entry to this array first and modify it to mock the behavior.
// This MUST have an entry or your observer code will error in testing
global.intersectionObserverEntries = [];

class MockIntersectionObserver {
  constructor(fn: (arg0: unknown, arg1: unknown) => void) {
    fn(global.intersectionObserverEntries, this)
  }

  observe() { jest.fn(); }
  unobserve() { jest.fn(); }
  disconnect() { jest.fn(); }
};

Object.defineProperty(window, 'localStorage', { value: global.localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: global.sessionStorageMock });
Object.defineProperty(window, 'IntersectionObserver', { value: MockIntersectionObserver });

Object.defineProperties(window.HTMLElement.prototype, {
  scrollBy: { value: jest.fn() },
  scrollIntoView: { value: jest.fn() },
  scrollIntoViewIfNeeded: { value: jest.fn() },
});
