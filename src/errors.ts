export function unknownOptionsType(): Error {
	return Error('EventsBatcher: unknown options type');
}

export function unsupportedAccumulatorType(type: string): Error {
	return Error(`EventsBatcher: unsupported accumulator type '${ type }'. 'set' or 'array' expected`);
}

export function nonPositiveTimeout(timeout: number): Error {
	return Error(`EventsBatcher: 'timeout' must be positive. Got timeoutMs=${ timeout }`);
}

export function nonPositiveSize(size: number): Error {
	return Error(`EventsBatcher: 'size' must be positive. Got size=${ size }`);
}

export function nonPositiveDebounce(debounce: number): Error {
	return Error(`EventsBatcher: 'debounce' must be positive. Got debounceMs=${ debounce }`);
}

export function debounceGreaterThanTimeout(debounce: number, timeout: number): Error {
	return Error(`EventsBatcher: 'debounce' must be less than 'timeout'. Got debounceMs=${ debounce }, timeoutMs=${ timeout }`);
}

export function addInCallback(): Error {
	return Error('EventsBatcher: impossible to add event in callback');
}

export function shouldNotBeExecuted(): Error {
	return Error('EventsBatcher: this should not be executed. Check your configuration');
}
