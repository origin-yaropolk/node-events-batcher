import { Accumulator } from './accumulator';
import * as Errors from './errors';
import { BaseOptions, DebounceOptions, isDebounceOptions, isSizeOptions, SizeOptions } from './options';

export interface Strategy<EventType> {
	reset(): void;
	add(event: EventType): void;
}

export function createStrategy<EventType>(options: BaseOptions, accumulator: Accumulator<EventType>, fire: ()=> void): Strategy<EventType> {
	if (isSizeOptions(options)) {
		return new SizeStrategy(options, accumulator, fire);
	}

	if (isDebounceOptions(options)) {
		return new DebounceStrategy(options, accumulator, fire);
	}

	throw Errors.shouldNotBeExecuted();
}

export class DebounceStrategy<EventType> implements Strategy<EventType> {
	private debounceTimeout: NodeJS.Timeout | null = null;
	private timeout: NodeJS.Timeout | null = null;

	constructor(
		private readonly options: DebounceOptions,
		private readonly accumulator: Accumulator<EventType>,
		private readonly fire: () => void) {}

	reset(): void {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = null;
		}

		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		this.accumulator.clear();
	}

	add(event: EventType): void {
		this.accumulator.add(event);

		if (this.debounceTimeout !== null) {
			this.debounceTimeout.refresh();
			return;
		}

		if (this.timeout === null && this.options.timeoutMs !== null) {
			this.timeout = setTimeout(this.fire, this.options.timeoutMs);
		}

		this.debounceTimeout = setTimeout(this.fire, this.options.debounceMs);
	}
}

export class SizeStrategy<EventType> implements Strategy<EventType> {
	private timeout: NodeJS.Timeout | null = null;

	constructor(
		private readonly options: SizeOptions,
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

		if (this.accumulator.length() >= this.options.size) {
			this.fire();
			return;
		}

		if (this.timeout === null && this.options.timeoutMs !== null) {
			this.timeout = setTimeout(this.fire, this.options.timeoutMs);
		}
	}
}
