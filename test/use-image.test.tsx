/* eslint-disable max-classes-per-file */
import '@testing-library/jest-dom';
import * as React from 'react';
import { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useImage } from '../src/hooks/use-image/hook';

declare global {
  var intersectionObserverEntries: Array<{ isIntersecting: boolean }>;
}

jest.mock('../src/hooks/use-image/image-loader', () => {
  const image = { naturalWidth: 100, naturalHeight: 100 };
  let forceError = false;

  return {
    __esModule: true,
    imageLoader: jest.fn((_url, success, error, _img, _inViewport) => (!!forceError ? error() : success(image))),
    setDimensions: (w: number, h: number) => { image.naturalWidth = w; image.naturalHeight = h; },
    useCallback: (r: string) => {
      if (r !== 'error' && r !== 'success') console.warn('invalid handler requested, assuming you want success');
      forceError = r === 'error';
    }
  };
});

const imageLoader = require('../src/hooks/use-image/image-loader');

describe('Image Loader hook tests', () => {
  const onLoad = jest.fn();
  const onError = jest.fn();
  const TestWrapper = ({ url }: { url?: string | null }) => {
    const ref = useRef(new Image());
    const imageProperties = useImage({ url, ref, onLoad, onError });

    return (
      <div ref={ref}>
        <ul>
          {
            Object.entries(imageProperties)
              .map(([k, v]) => (<li key={k} data-testid={k}>{JSON.stringify(v)}</li>))
          }
        </ul>
      </div>
    );
  };

  const url = () => screen.getByTestId('url');
  const hasError = () => screen.getByTestId('hasError');
  const orientation = () => screen.getByTestId('orientation');
  const loading = () => screen.getByTestId('isLoading');

  const s = (props = {}) => render(<TestWrapper {...props} />);

  beforeAll(() => {
    global.intersectionObserverEntries = [{ isIntersecting: true }];
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(() => {
    global.intersectionObserverEntries = [];
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('image properties are set correctly when url is falsey', () => {
    s({ url: null });
    expect(url()).toHaveTextContent('null');
    expect(hasError()).toHaveTextContent('true');
    expect(loading()).toHaveTextContent('false');
  });

  describe('Failed load', () => {
    beforeEach(() => {
      imageLoader.useCallback('error');

      //@ts-ignore
      global.Image = class {
        constructor() {
          setTimeout(() => { this.onerror(); }, 100);
        }
        onerror() { }
      };
    });

    test('Error callback runs', async () => {
      s({ url: 'blah.png' });
      jest.advanceTimersByTime(200);

      await waitFor(() => expect(onError).toBeCalled());
      expect(imageLoader.imageLoader).toHaveBeenCalledWith('blah.png', expect.any(Function), expect.any(Function), expect.any(HTMLElement), true);
    });
  });

  describe('Successful load', () => {
    beforeEach(() => {
      imageLoader.useCallback('success');

      // @ts-ignore
      global.Image = class {
        constructor() {
          setTimeout(() => { this.onload(); }, 100);
        }
        onload() { }
      };
    });

    describe('Orientation detection', () => {
      test('Square (Default)', async () => {
        s({ url: 'blah.png' });
        jest.advanceTimersByTime(200);

        await waitFor(() => expect(onLoad).toBeCalled());
        expect(orientation()).toHaveTextContent('square');
        expect(imageLoader.imageLoader).toHaveBeenCalledWith('blah.png', expect.any(Function), expect.any(Function), expect.any(HTMLElement), true);
      });

      test('Landscape', async () => {
        imageLoader.setDimensions(200, 100);
        s({ url: 'blah.png' });
        jest.advanceTimersByTime(200);

        await waitFor(() => expect(onLoad).toBeCalled());
        expect(orientation()).toHaveTextContent('landscape');
        expect(imageLoader.imageLoader).toHaveBeenCalledWith('blah.png', expect.any(Function), expect.any(Function), expect.any(HTMLElement), true);
      });

      test('Portrait', async () => {
        imageLoader.setDimensions(100, 200);
        s({ url: 'blah.png' });
        jest.advanceTimersByTime(200);

        await waitFor(() => expect(onLoad).toBeCalled());
        expect(orientation()).toHaveTextContent('portrait');
        expect(imageLoader.imageLoader).toHaveBeenCalledWith('blah.png', expect.any(Function), expect.any(Function), expect.any(HTMLElement), true);
      });
    });
  });
});
