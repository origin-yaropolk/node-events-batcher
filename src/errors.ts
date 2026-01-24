export function unknownOptionsType(): Error {
	return Error('EventsBatcher: unknown options type');
}

export function unsupportedAccumulatorType(type: string): Error {
	return Error(`EventsBatcher: unsupported accumulator type '${ type }'. 'set' or 'array' expected`);
}

export function nonPositiveTimeout(timeout: number): Error {
	return Error(`EventsBatcher: 'timeout' must be positive. Got timeoutMs=${ timeout }`);
}

export function nonPositiveCount(count: number): Error {
	return Error(`EventsBatcher: 'count' must be positive. Got count=${ count }`);
}

export function nonPositiveShift(shift: number): Error {
	return Error(`EventsBatcher: 'shift' must be positive. Got shiftMs=${ shift }`);
}

export function shiftGreaterThanTimeout(shift: number, timeout: number): Error {
	return Error(`EventsBatcher: 'shift' must be less than 'timeout'. Got shiftMs=${ shift }, timeoutMs=${ timeout }}`);
}

export function shouldNotBeExecuted(): Error {
	return Error('EventsBatcher: this should not be executed. Check your configuration');
}
