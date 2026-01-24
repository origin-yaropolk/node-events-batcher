import { Accumulator, AccumulatorType } from '../src/accumulator';
import * as Errors from '../src/errors';

describe("Accumulator tests", () => {
	test('Invalid initialization test', () => {
		expect(
			() =>  new Accumulator<number>('list' as unknown as AccumulatorType)
		).toThrow(Errors.unsupportedAccumulatorType('list'));
	});

	test("Array based accumulator test", () => {
		const acc = new Accumulator<number>('array');

		acc.add(5);
		acc.add(4);
		acc.add(6);
		acc.add(3);
		acc.add(7);
		acc.add(2);
		acc.add(8);
		acc.add(1);
		acc.add(9);
		acc.add(5);

		const length = acc.length();
		expect(length).toEqual(10);

		const items = acc.get()
		expect(items).toEqual([5, 4, 6, 3, 7, 2, 8, 1, 9, 5]);

		acc.clear()

		const afterCleanLength = acc.length();
		expect(afterCleanLength).toEqual(0);

		const afterCleanItems = acc.get();
		expect(afterCleanItems).toEqual([]);
	});

	test("Set based accumulator test", () => {
		const acc = new Accumulator<number>('set');

		acc.add(5);
		acc.add(4);
		acc.add(6);
		acc.add(3);
		acc.add(7);
		acc.add(2);
		acc.add(8);
		acc.add(1);
		acc.add(9);
		acc.add(5);

		const length = acc.length();
		expect(length).toEqual(9);

		const items = acc.get()
		expect(items).toEqual([5, 4, 6, 3, 7, 2, 8, 1, 9]);

		acc.clear()

		const afterCleanLength = acc.length();
		expect(afterCleanLength).toEqual(0);

		const afterCleanItems = acc.get();
		expect(afterCleanItems).toEqual([]);
	});
})
