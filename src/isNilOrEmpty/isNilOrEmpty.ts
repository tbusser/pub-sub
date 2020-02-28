/**
 * Checks if the provided value is null or undefined (nil) or if it is an
 * empty string.
 *
 * @param value The value to check
 *
 * @returns Returns true when the provided value is nil or an empty string.
 */
export function isNilOrEmpty(value?: string): boolean {
	return (
		value === undefined ||
		value === null ||
		(typeof value === 'string' && value.trim() === '')
	);
}
