import { BaseOptions, defaultOptions, validateBaseOptions, validateOptions } from '../src/options';
import * as Errors from '../src/errors';

describe('Options tests', () => {
	describe('Validation tests', () => {
		test('Validate default options', () => {
			const got = validateOptions(defaultOptions);

			expect(got).toBeNull();
		});

		test('Validate base options', () => {
			var got = validateBaseOptions({
				accumulatorType: 'array',
				timeoutMs: null
			});

			expect(got).toBeNull();

			got = validateBaseOptions({
				accumulatorType: 'set',
				timeoutMs: 500
			});

			expect(got).toBeNull();

			got = validateBaseOptions({
				accumulatorType: 'list',
				timeoutMs: 500
			} as unknown as BaseOptions);

			expect(got).toEqual(Errors.unsupportedAccumulatorType('list'));

			got = validateBaseOptions({
				accumulatorType: 'set',
				timeoutMs: -15
			});

			expect(got).toEqual(Errors.nonPositiveTimeout(-15));
		});

		test('Validate size options', () => {
			var got = validateOptions({
				accumulatorType: 'set',
				timeoutMs: null,
				size: 10
			});

			expect(got).toBeNull();

			var got = validateOptions({
				accumulatorType: 'set',
				timeoutMs: null,
				size: -10
			});

			expect(got).toEqual(Errors.nonPositiveSize(-10));
		});

		test('Validate debounce options', () => {
			var got = validateOptions({
				accumulatorType: 'array',
				timeoutMs: 2000,
				debounceMs: 50
			});

			expect(got).toBeNull();

			got = validateOptions({
				accumulatorType: 'array',
				timeoutMs: 2000,
				debounceMs: -50
			});

			expect(got).toEqual(Errors.nonPositiveDebounce(-50));

			got = validateOptions({
				accumulatorType: 'array',
				timeoutMs: 100,
				debounceMs: 500
			});

			expect(got).toEqual(Errors.debounceGreaterThanTimeout(500, 100));
		});
	})
});
