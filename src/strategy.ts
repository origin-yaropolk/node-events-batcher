import { Accumulator } from './accumulator';
import * as Errors from './errors';
import { CommonOptions, CountOptions, isCountOptions, isShiftOptions, ShiftOptions } from './options';

export interface Strategy<EventType> {
	reset(): void;
	add(event: EventType): void;
}

export function NewStrategy<EventType>(options: CommonOptions, accumulator: Accumulator<EventType>, fire: ()=> void): Strategy<EventType> {
	if (isShiftOptions(options)) {
		return new ShiftStrategy(options, accumulator, fire);
	}

	if (isCountOptions(options)) {
		return new CountStrategy(options, accumulator, fire);
	}

	throw Errors.shouldNotBeExecuted();
}

export class ShiftStrategy<EventType> implements Strategy<EventType> {
	private shiftTimeout: NodeJS.Timeout | null = null;
	private timeout: NodeJS.Timeout | null = null;

	constructor(
		private readonly options: ShiftOptions,
		private readonly accumulator: Accumulator<EventType>,
		private readonly fire: ()=> void) {}

	reset(): void {
		if (this.shiftTimeout) {
			clearTimeout(this.shiftTimeout);
			this.shiftTimeout = null;
		}

		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		this.accumulator.clear();
	}

	add(event: EventType): void {
		this.accumulator.add(event);

		if (this.shiftTimeout !== null) {
			this.shiftTimeout.refresh();
			return;
		}

		if (this.timeout === null && this.options.timeoutMs !== null) {
			this.timeout = setTimeout(this.fire, this.options.timeoutMs);
		}

		this.shiftTimeout = setTimeout(this.fire, this.options.shiftMs);
	}
}

export class CountStrategy<EventType> implements Strategy<EventType> {
	private timeout: NodeJS.Timeout | null = null;

	constructor(
		private readonly options: CountOptions,
		private readonly accumulator: Accumulator<EventType>,
		private readonly fire: () => void) {}

	reset(): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		this.accumulator.clear();
	}

	add(event: EventType): void {
		this.accumulator.add(event);

		if (this.accumulator.length() >= this.options.count) {
			this.fire();
			return;
		}

		if (this.timeout === null && this.options.timeoutMs !== null) {
			this.timeout = setTimeout(this.fire, this.options.timeoutMs);
		}
	}
}
