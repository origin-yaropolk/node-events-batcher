import { EventsBatcher } from '../src/events-batcher';
import { makeAwaiter } from '../src/make-awaiter';

function equalWithError(value: number, target: number, errorInPercents: number): boolean {
	return Math.abs(target - value) < (target * (errorInPercents / 100.0));
}

function sleep(ms: number): Promise<void> { 
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe("EventsBatcher tests", () => {
	test("Batch size based strategy with array test", async() => {
		const [batchSizeResultResolver, batchSizeResultAwaiter] = makeAwaiter<ReadonlyArray<number>>();
		const [timeoutResultResolver, timeoutResultAwaiter] = makeAwaiter<ReadonlyArray<number>>();
		var timeoutedStart: Date = new Date();
		var timeoutedEnd: Date = new Date();

		const cb = (acc: ReadonlyArray<number>): void => {
			if (acc.length === 6) {
				return batchSizeResultResolver(acc);
			}

			timeoutedEnd = new Date();
			timeoutResultResolver(acc);
		};

		const batcher = new EventsBatcher(cb, null, {
			accumulatorType: 'array',
			timeoutMs: 2000,
			count: 6,
		});

		const _ = new Promise(() => {
			batcher.add(3);
			batcher.add(1);
			batcher.add(5);
			batcher.add(2);
			batcher.add(4);
			batcher.add(3);

			timeoutedStart = new Date();
			batcher.add(1);
			batcher.add(2);
		});

		const got = await batchSizeResultAwaiter;

		expect(got.length).toEqual(6);
		expect(got).toEqual([3, 1, 5, 2, 4, 3]);

		const timeoutedResult = await timeoutResultAwaiter;

		expect(timeoutedResult.length).toEqual(2);
		expect(timeoutedResult).toEqual([1, 2]);

		const duration = timeoutedEnd.getTime() - timeoutedStart.getTime();

		const isDurationAcceptable = equalWithError(duration, 2000, 1);

		expect(isDurationAcceptable).toBeTruthy();
	});

	test("Batch size based strategy with set test", async() => {
		const [batchSizeResultResolver, batchSizeResultAwaiter] = makeAwaiter<ReadonlyArray<number>>();

		const cb = (acc: ReadonlyArray<number>): void => {
			batchSizeResultResolver(acc);
		};

		const batcher = new EventsBatcher(cb, null, {
			accumulatorType: 'set',
			timeoutMs: 2000,
			count: 6,
		});

		const _ = new Promise(() => {
			batcher.add(3);
			batcher.add(1);
			batcher.add(5);
			batcher.add(2);
			batcher.add(4);
			batcher.add(3);
			batcher.add(1);
			batcher.add(2);
			batcher.add(6);
		});

		const got = await batchSizeResultAwaiter;

		expect(got.length).toEqual(6);
		expect(got).toEqual([3, 1, 5, 2, 4, 6]);

		await sleep(3000);
	});

	test("Shift based strategy with array - shifting test", async() => {
		const [resultResolver, resultAwaiter] = makeAwaiter<ReadonlyArray<number>>();
		var end = new Date();

		const cb = async(acc: ReadonlyArray<number>): Promise<void> => {
			resultResolver(acc);
			end = new Date();
		};

		const batcher = new EventsBatcher(cb, null, {
			accumulatorType: 'array',
			timeoutMs: null,
			shiftMs: 50,
		});
		var added = 0;

		const begin = new Date()

		for (var i =  0; i < 10; i++) {
			batcher.add(i);
			added++;

			// skip last waiting
			if (i !== 9) { 
				await sleep(45);
			}
		}

		const items = await resultAwaiter;

		const duration = end.getTime() - begin.getTime();

		expect(duration).toBeGreaterThan(450);
		expect(duration).toBeLessThan(550);

		expect(items).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	test("Shift based strategy with array - two batches test", async() => {
		const result = new Array<ReadonlyArray<number>>();

		const cb = async(acc: ReadonlyArray<number>): Promise<void> => {
			result.push(acc);
		};

		const batcher = new EventsBatcher(cb, null, {
			accumulatorType: 'array',
			timeoutMs: null,
			shiftMs: 50,
		});

		{
			batcher.add(1);
			batcher.add(2);
			batcher.add(3);

			await sleep(51);

			batcher.add(4);
			batcher.add(5);
			batcher.add(6);
		}

		await sleep(100);

		expect(result).toEqual([[1, 2, 3], [4, 5 ,6]]);
	});

	test("Shift based strategy with array - close shift and timeout test", async() => {
		const [resultResolver, resultAwaiter] = makeAwaiter<ReadonlyArray<number>>();

		const cb = async(acc: ReadonlyArray<number>): Promise<void> => {
			await sleep(100);
			resultResolver(acc);
		};

		const batcher = new EventsBatcher(cb, null, {
			accumulatorType: 'array',
			timeoutMs: 500,
			shiftMs: 499,
		});

		const _ = new Promise(() => {
			batcher.add(3);
			batcher.add(1);
		});

		const got = await resultAwaiter;

		expect(got).toEqual([3, 1]);

		await sleep(1000);
	});

	test("Error handling test", async() => {
		const [resultResolver, resultAwaiter] = makeAwaiter<unknown>();

		const cb = (_: ReadonlyArray<number>): void => {
			throw Error("Error in callback");
		};

		const errorHandler = (error: unknown): void => {
			resultResolver(error);
		};

		const batcher = new EventsBatcher(cb, errorHandler);

		batcher.add(1);

		const result = await resultAwaiter;

		expect(result).toEqual(Error("Error in callback"));
	});

	test("Async error handling test", async() => {
		const [resultResolver, resultAwaiter] = makeAwaiter<unknown>();

		const cb = async(_: ReadonlyArray<number>): Promise<void> => {
			await sleep(100);
			throw Error("Error in callback");
		};

		const errorHandler = (error: unknown): void => {
			resultResolver(error);
		};

		const batcher = new EventsBatcher(cb, errorHandler);

		batcher.add(1);

		const result = await resultAwaiter;

		expect(result).toEqual(Error("Error in callback"));
	});

	test("Flush test", async() => {
		const [firstBatchResolver, firstBatchAwaiter] = makeAwaiter<ReadonlyArray<number>>();
		var firstBatchResolved = false;
		const [secondBatchResolver, secondBatchAwaiter] = makeAwaiter<ReadonlyArray<number>>();
		var secondBatchResolved = false;

		const cb = async(acc: ReadonlyArray<number>): Promise<void> => {
			if (firstBatchResolved !== true) {
				firstBatchResolved = true;
				firstBatchResolver(acc);
				return;
			}

			if (secondBatchResolved !== true) {
				secondBatchResolved = true;
				secondBatchResolver(acc);
				return;
			}
		};

		const batcher = new EventsBatcher(cb, null, {
			accumulatorType: 'array',
			count: 5,
			timeoutMs: null
		});

		batcher.add(1);
		batcher.add(2);
		batcher.add(3);

		batcher.flush();

		var result = await firstBatchAwaiter;

		expect(result).toEqual([1, 2, 3]);

		batcher.add(2);
		batcher.add(3);
		batcher.add(4);
		batcher.add(5);
		batcher.add(6);

		result = await secondBatchAwaiter;

		expect(result).toEqual([2, 3, 4, 5, 6]);
	});
})
