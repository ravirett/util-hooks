/**
 * ImageLoader utility class with optional viewport detection input
 * @param {String} url - Image URL
 * @param {Function<void>} successCallback - Callback to run when image loads successfully
 * @param {Function<void>} errorCallback - Callback to run when image loads fails to load
 * @param {HTMLImageElement=} img - An image element can be provided if you have it
 * @param {Boolean=} inViewport - Stops assignment of URL/callbacks if the URL is not yet in the viewport
 * @returns {HTMLImageElement} - The supplied (or generated) image with properties set according to the function
 */
export const imageLoader = (
  url: string | null | undefined,
  callback: (image: HTMLImageElement) => void,
  errorImage: (err: Event | string) => void,
  img?: HTMLImageElement,
  inViewport?: boolean
) => {
  const image = img ?? new Image();

  // allows us to ensure when the image enters viewport, we load it
  // also only do this URL swap once, so we don't reload as things enter and leave viewport
  if (inViewport && !image.src) {
    image.onload = () => {
      callback(image);
    };

    image.onerror = (err: Event | string) => {
      errorImage(err);
    };

    image.src = url ?? '';
  }

  return image;
}
