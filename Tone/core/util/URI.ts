const isURIComponentEncoded = (uriComponent: string): boolean =>
	decodeURIComponent(uriComponent) !== uriComponent;

/**
 * Encodes via `encodeURIComponent` only if the given string is not encoded.
 * If the given string is already encoded, it will be returned as is.
 *
 * Note that this will not encode a partially encoded string such as `'%20 '`.
 *
 * @param uriComponent The URI component to encode
 */
export const encodeUnencodedURIComponent = (uriComponent: string): string => {
	return isURIComponentEncoded(uriComponent) ? uriComponent : encodeURIComponent(uriComponent);
};
