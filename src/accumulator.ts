import * as Errors from './errors';

export type AccumulatorType = 'array' | 'set';

export class Accumulator<T> {
	private addWrapper: (value: T) => void;
	private clearWrapper: () => void;
	private lengthWrapper: () => number;
	private getWrapper: () => ReadonlyArray<T>;

	constructor(type: AccumulatorType) {
		if (type === 'array') {
			const accumulator = new Array<T>();

			this.addWrapper = function(value: T): void {
				accumulator.push(value);
			};

			this.clearWrapper = function(): void {
				accumulator.splice(0, accumulator.length);
			};

			this.lengthWrapper = function(): number {
				return accumulator.length;
			};

			this.getWrapper = function(): ReadonlyArray<T> {
				return Array.from(accumulator);
			};

			return;
		}

		if (type === 'set') {
			const accumulator = new Set<T>();

			this.addWrapper = function(value: T): void {
				accumulator.add(value);
			};

			this.clearWrapper = function(): void {
				accumulator.clear();
			};

			this.lengthWrapper = function(): number {
				return accumulator.size;
			};

			this.getWrapper = function(): ReadonlyArray<T> {
				return Array.from(accumulator.values());
			};

			return;
		}

		throw Errors.unsupportedAccumulatorType(type);
	}

	add(value: T): void {
		this.addWrapper(value);
	}

	clear(): void {
		this.clearWrapper();
	}

	length(): number {
		return this.lengthWrapper();
	}

	get(): ReadonlyArray<T> {
		return this.getWrapper();
	}
}
