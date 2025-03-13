import { useState } from 'react';
import { imageLoader } from '../src/hooks/use-image/image-loader';
import { renderHook, act, waitFor, screen, fireEvent } from '@testing-library/react';

const mockImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAEElEQVR4nGKKfqoDCAAA//8DEwFvdvfyowAAAABJRU5ErkJggg==';
const mockSuccess = jest.fn();
const mockError = jest.fn();

let forceIntoViewport: () => void;
const TestWrapper = ({ url, image, inViewport = true }: { url?: string | null, image?: HTMLImageElement, inViewport?: boolean }) => {
  const [isInViewport, setIsInViewport] = useState(inViewport);
  forceIntoViewport = () => setIsInViewport(true);
  const result = imageLoader(url, mockSuccess, mockError, image, isInViewport);
  return result;
}

describe('Image Loader component tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should create an image element if not given one', () => {
    const image = imageLoader(mockImageUrl, mockSuccess, mockError, undefined, true);
    expect(image).toBeInstanceOf(HTMLImageElement);
    expect(image.src).toBe(mockImageUrl);
  });

  it('Should reuse an image element if given one', () => {
    const image = new Image();
    const image2 = imageLoader(mockImageUrl, mockSuccess, mockError, image, true);
    expect(image2).toBe(image);
  });

  it('Should set the success callback when the image src is set and the image is in the viewport, and call the callback when the image is loaded', async () => {
    const image = new Image();
    renderHook(() => TestWrapper({ url: mockImageUrl, inViewport: false, image }));

    expect(image.onload).toBeNull();

    act(() => {
      forceIntoViewport();
    });

    await waitFor(() => {
      fireEvent.load(image);
      expect(mockSuccess).toBeCalled();
    });
  });

  it('Should set the error callback when the image src is set and the image is in the viewport, and call the callback when the image errors', async () => {
    const image = new Image();
    renderHook(() => TestWrapper({ url: mockImageUrl, inViewport: false, image }));

    expect(image.onerror).toBeNull();

    act(() => {
      forceIntoViewport();
    });

    await waitFor(() => {
      fireEvent.error(image);
      expect(mockError).toBeCalled();
    });
  });
});