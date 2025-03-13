# Util-Hooks
This is just a collection of utility hooks that I've found useful throughout my career. I've been rewriting them on and off as needed when changing roles, and decided that it might be time to just commit them to a repo.

## Documentation

### useActiveElement
This hook tracks the current and directly previous active elements within the browser. Why the previous element? Because sometimes you need to click on an element and know what was active directly before focus shifted. Changes are tracked via a window listener on `focusin`. In the case `document` isn't available, both properties return `null` and no attempt to register listeners occurs.

**Usage**
`const {activeElement: Element|null, previousActiveElement: Element|null} = useActiveElement();`

### useCookie
Just a hook that wraps [js-cookie](https://github.com/js-cookie/js-cookie), making it easy to read and manipulate cookies. This will be refactored to remove the dependency once [CookieStore](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) is better supported.

**Usage**
`const [cookie: string|null, updateCookie?: (string) => void] = useCookie(key: string, defaultValue?: string, options?: `[CookieAttributes](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/js-cookie/index.d.ts)`)`

*Returned API*
>`cookie` is the returned value of the cookie
>
>`updateCookie()`will update that value if supplied, or delete the cookie if no argument is supplied 

### useInViewport
A simple hook that uses [Intersection Observers](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to determine if a given element is currently within the viewport.

**Usage**
`const isIntersecting: boolean = useInViewport(ref: React.RefObject<HTMLElement>)`

### useLocalStorage / useSessionStorage
SSR-safe hooks to enable easy access/manipulation of local and session storage APIs.

**Usage**
`const [storedValue: Object|string|number|null, setValue: (Function|string|null) => void, deleteValue: () => void] = useLocalStorage(key: string, initialValue: unknown, saveInitial: boolean = false`

*Arguments*
>`key` is the key name of the storage entry
>
>`initialValue` is an optional initial (JSON-serialiable) value, used if the key isn't present
>
>`saveInitial`, if true, will force the initialValue to overwrite the present value of the key regardless of value

*Returned API*
>`storedValue` is the value from storage, after being JSON-parsed.
>
>`setValue` takes a string or number (or function whose return value) which is JSON-serializable, and updates the stored value.
>
>`deleteValue` deletes the entire key from storage.

### usePortal
Simple hook which mounts a div *alongside* the React root, ideal for implementing dialogs or other elements meant to block the entire viewport. Takes an `id` which is set on the resulting element.

**Usage**
`const portal: HTMLDivElement = usePortal(id: string)`

### useTimeout
Another simple hook which enables easy use of timeouts.

**Usage**
`const cancel: () => void = useTimeout(callback: () => void, delay: number)`

*Arguments*
>`callback` is the function which runs when the timeout expires
>
>`delay` is the amount onf milliseconds to wait before expiration

*Returned API*
>`cancel` is the cancellation function which will immediately clear the timeout when run

### useWindowDetails
This hook is meant to easily return details about the browser window. Value changes are currently bound to resize events. We use traditional event listeners instead of a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) because the hook was built to observe the window's *outer* dimentions and position. The highest we can observe with ResizeObserver is `document.body` which will leave us miscalculating due to scrollbars, other window chrome like the address bar, etc.

**Usage**
`const { size: { height: number|undefined, width: number|undefined }, position: { top: number|undefined, left: number|undefined }} = useWindowDetails()`

*Returned API*
>`size` returns the width and height of the window. These are undefined by default, to gracefully handle SSR
>
>`position` returns the top and left offsets of the window. Default to undefined like size.

## Building
Building the project is easy.

>`git clone ...`
>
>`pnpm i`
>
>`pnpm build`

**Bundles are emitted in ESM and CJS formats, for your convenience**
