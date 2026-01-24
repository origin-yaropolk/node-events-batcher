import { AccumulatorType } from './accumulator';
import * as Errors from './errors';

export interface CommonOptions {
	accumulatorType: AccumulatorType
	timeoutMs: number | null
}

export type CountOptions = CommonOptions & {
	count: number;
}

export type ShiftOptions = CommonOptions & {
	shiftMs: number;
}

export function isCountOptions(options: unknown): options is CountOptions {
	return options !== null &&
		typeof options === 'object' &&
		'count' in options &&
		options.count !== null &&
		typeof options.count === 'number';
}

export function isShiftOptions(options: unknown): options is ShiftOptions {
	return options !== null &&
		typeof options === 'object' &&
		'shiftMs' in options &&
		options.shiftMs !== null &&
		typeof options.shiftMs === 'number';
}

export function validateOptions(options: CountOptions | ShiftOptions): Error | null {
	const err = validateCommonOptions(options);

	if (err !== null) {
		return err;
	}

	if (isCountOptions(options)) {
		return validateCountOptions(options);
	}

	if (isShiftOptions(options)) {
		return validateShiftOptions(options);
	}

	throw Errors.unknownOptionsType();
}

export function validateCommonOptions(options: CommonOptions): Error | null {
	if (options.accumulatorType !== 'array' && options.accumulatorType !== 'set') {
		return Errors.unsupportedAccumulatorType(options.accumulatorType);
	}

	if (options.timeoutMs !== null && options.timeoutMs <= 0) {
		return Errors.nonPositiveTimeout(options.timeoutMs);
	}

	return null;
}

function validateCountOptions(options: CountOptions): Error | null {
	if (options.count <= 0) {
		return Errors.nonPositiveCount(options.count);
	}

	return null;
}

function validateShiftOptions(options: ShiftOptions): Error | null {
	if (options.shiftMs <= 0) {
		return Errors.nonPositiveShift(options.shiftMs);
	}

	if (options.timeoutMs !== null && options.shiftMs >= options.timeoutMs) {
		return Errors.shiftGreaterThanTimeout(options.shiftMs, options.timeoutMs);
	}

	return null;
}

export const defaultOptions: ShiftOptions = {
	accumulatorType: 'array',
	timeoutMs: 2000,
	shiftMs: 50,
};
