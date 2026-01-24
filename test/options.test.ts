import { CommonOptions, defaultOptions, validateCommonOptions, validateOptions } from '../src/options';
import * as Errors from '../src/errors';

describe('Options tests', () => {
	describe('Valdation tests', () => {
		test('Validate default options', () => {
			const got = validateOptions(defaultOptions);

			expect(got).toBeNull();
		});

		test('Validate common options', () => {
			var got = validateCommonOptions({
				accumulatorType: 'array',
				timeoutMs: null
			});

			expect(got).toBeNull();

			got = validateCommonOptions({
				accumulatorType: 'set',
				timeoutMs: 500
			});

			expect(got).toBeNull();

			got = validateCommonOptions({
				accumulatorType: 'list',
				timeoutMs: 500
			} as unknown as CommonOptions);

			expect(got).toEqual(Errors.unsupportedAccumulatorType('list'));

			got = validateCommonOptions({
				accumulatorType: 'set',
				timeoutMs: -15
			});

			expect(got).toEqual(Errors.nonPositiveTimeout(-15));
		});

		test('Validate count options', () => {
			var got = validateOptions({
				accumulatorType: 'set',
				timeoutMs: null,
				count: 10
			});

			expect(got).toBeNull();

			var got = validateOptions({
				accumulatorType: 'set',
				timeoutMs: null,
				count: -10
			});

			expect(got).toEqual(Errors.nonPositiveCount(-10));
		});

		test('Validate shift options', () => {
			var got = validateOptions({
				accumulatorType: 'array',
				timeoutMs: 2000,
				shiftMs: 50
			});

			expect(got).toBeNull();

			got = validateOptions({
				accumulatorType: 'array',
				timeoutMs: 2000,
				shiftMs: -50
			});

			expect(got).toEqual(Errors.nonPositiveShift(-50));

			got = validateOptions({
				accumulatorType: 'array',
				timeoutMs: 100,
				shiftMs: 500
			});

			expect(got).toEqual(Errors.shiftGreaterThanTimeout(500, 100));
		});
	})
});
