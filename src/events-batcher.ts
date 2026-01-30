import { Accumulator } from './accumulator';
import { DebounceOptions, defaultOptions, SizeOptions, validateOptions } from './options';
import { createStrategy, Strategy } from './strategy';
import * as Errors from './errors';

export type CallbackType<T> = (accumulator: ReadonlyArray<T>) => void | PromiseLike<void>;
export type ErrorHandler = (error: unknown) => void;

export class EventsBatcher<EventType> {
	private accumulator: Accumulator<EventType>;
	private strategy: Strategy<EventType>;
	private flushing: boolean = false;

	constructor(
		private readonly cb: CallbackType<EventType>,
		private readonly errorHandler: ErrorHandler | null = null,
		private readonly options: SizeOptions | DebounceOptions = defaultOptions) {
		const err = validateOptions(options);

		if (err !== null) {
			throw err;
		}

		this.accumulator = new Accumulator<EventType>(this.options.accumulatorType);
		this.strategy = createStrategy<EventType>(options, this.accumulator, this.fire.bind(this));
	}

	public add(object: EventType): void {
		if (this.flushing) {
			throw Errors.addInCallback()
		}

		this.strategy.add(object);
	}

	public flush(): void {
		this.fire();
	}

	private fire(): void {
		this.flushing = true;
		const events = this.accumulator.get();

		if (events.length === 0) {
			this.strategy.reset();
			return;
		}

		try {
			const mayBePromise = this.cb(events);

			if (mayBePromise instanceof Promise) {
				mayBePromise.catch(error => {
					this.handleError(error);
				});
			}
		}
		catch (error) {
			this.handleError(error);
		}
		finally {
			this.strategy.reset();
			this.flushing = false;
		}
	}

	private handleError(error: unknown): void {
		if (this.errorHandler !== null) {
			this.errorHandler(error);
		}
		else {
			throw error;
		}
	}
}
