import { AccumulatorType } from './accumulator';
import * as Errors from './errors';

export interface BaseOptions {
	accumulatorType: AccumulatorType
	timeoutMs: number | null
}

export type SizeOptions = BaseOptions & {
	size: number;
}

export type DebounceOptions = BaseOptions & {
	debounceMs: number;
}

export function isSizeOptions(options: unknown): options is SizeOptions {
	return options !== null &&
		typeof options === 'object' &&
		'count' in options &&
		options.count !== null &&
		typeof options.count === 'number';
}

export function isDebounceOptions(options: unknown): options is DebounceOptions {
	return options !== null &&
		typeof options === 'object' &&
		'debounceMs' in options &&
		options.debounceMs !== null &&
		typeof options.debounceMs === 'number';
}

export function validateOptions(options: SizeOptions | DebounceOptions): Error | null {
	const err = validateBaseOptions(options);

	if (err !== null) {
		return err;
	}

	if (isSizeOptions(options)) {
		return validateSizeOptions(options);
	}

	if (isDebounceOptions(options)) {
		return validateDebounceOptions(options);
	}

	throw Errors.unknownOptionsType();
}

export function validateBaseOptions(options: BaseOptions): Error | null {
	if (options.accumulatorType !== 'array' && options.accumulatorType !== 'set') {
		return Errors.unsupportedAccumulatorType(options.accumulatorType);
	}

	if (options.timeoutMs !== null && options.timeoutMs <= 0) {
		return Errors.nonPositiveTimeout(options.timeoutMs);
	}

	return null;
}

function validateSizeOptions(options: SizeOptions): Error | null {
	if (options.size <= 0) {
		return Errors.nonPositiveSize(options.size);
	}

	return null;
}

function validateDebounceOptions(options: DebounceOptions): Error | null {
	if (options.debounceMs <= 0) {
		return Errors.nonPositiveDebounce(options.debounceMs);
	}

	if (options.timeoutMs !== null && options.debounceMs >= options.timeoutMs) {
		return Errors.debounceGreaterThanTimeout(options.debounceMs, options.timeoutMs);
	}

	return null;
}

export const defaultOptions: DebounceOptions = {
	accumulatorType: 'array',
	timeoutMs: 2000,
	debounceMs: 50,
};
