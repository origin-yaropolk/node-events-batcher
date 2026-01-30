import { Accumulator } from './accumulator';
import { DebounceOptions, defaultOptions, SizeOptions, validateOptions } from './options';
import { createStrategy, Strategy } from './strategy';

export type CallbackType<T> = (accumulator: ReadonlyArray<T>) => void | PromiseLike<void>;
export type ErrorHandler = (error: unknown) => void;

export class EventsBatcher<EventType> {
	private accumulator: Accumulator<EventType>;
	private strategy: Strategy<EventType>;

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
		this.strategy.add(object);
	}

	public flush(): void {
		this.fire();
	}

	private fire(): void {
		const events = this.accumulator.get();

		this.strategy.reset();
		if (events.length === 0) {
			return;
		}

		try {
			const mayBePromise = this.cb(events);

			if (mayBePromise instanceof Promise) {
				mayBePromise.catch(error => {
					try {
						this.handleError(error);
					}
					catch (e) {
						// Rethrow in next tick so it surfaces; throwing here would only
						// reject the .catch() promise and become an unhandled rejection.
						queueMicrotask(() => {
							throw e;
						});
					}
				});
			}
		}
		catch (error) {
			this.handleError(error);
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
