import { useRef, useState, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { useInViewport } from '../use-in-viewport';
import { imageLoader } from './image-loader';

type ImageProperties = {
  url?: string | null;
  isLoading: boolean;
  hasError: boolean;
  orientation?: 'square' | 'landscape' | 'portrait';
  dimensions?: { height: number, width: number };
}

interface IHookParams {
  url?: string | null;
  ref: MutableRefObject<HTMLImageElement>;
  lazy?: boolean;
  onLoad?: (image: HTMLImageElement) => void;
  onError?: (err: Event | string) => void;
}

const defaultState = {
  url: null,
  isLoading: true,
  hasError: false
};

/**
 * A hook which can load/lazyload a given image URL, and handles error states, etc. internally
 * @param {UseImageParams} params
 * @returns {ImageProperties}
 */
export const useImage = ({ url, ref, lazy = false, onLoad = () => { }, onError = () => { } }: IHookParams) => {
  const [imageProperties, setImageProperties] = useState<ImageProperties>(defaultState);
  const imageRef = ref || useRef<HTMLImageElement>(new Image());

  // if enabled, track whether image is in viewport (for lazy loading)
  const inViewport = lazy ? useInViewport(imageRef) : true;

  const getOrientation = useCallback((image: HTMLImageElement) => {
    const ratio = image.naturalWidth / image.naturalHeight;
    if (ratio === 1) return 'square';
    if (ratio > 1) return 'landscape';
    return 'portrait';
  }, []);

  const successCallback = useCallback((image: HTMLImageElement) => {
    onLoad(image);
    setImageProperties({
      url,
      orientation: getOrientation(image),
      isLoading: false,
      hasError: false,
      dimensions: { width: image.naturalWidth, height: image.naturalHeight }
    });
  }, [getOrientation, onLoad, url]);

  const errorCallback = useCallback((err: Event | string) => {
    onError(err);
    setImageProperties({ url, hasError: true, isLoading: false });
  }, [onError]);

  const intersectionImageLoader = useCallback(() => imageLoader(url, successCallback, errorCallback, imageRef.current, inViewport), [errorCallback, inViewport, successCallback, url]);

  useEffect(() => {
    if (!!url) {
      imageRef.current = intersectionImageLoader();
    } else {
      setImageProperties({ url: null, hasError: true, isLoading: false });
    }
  }, [intersectionImageLoader, url]);

  return imageProperties;
};
