import { Accumulator } from './accumulator';
import { CountOptions, defaultOptions, ShiftOptions, validateOptions } from './options';
import { NewStrategy, Strategy } from './strategy';

export type CallbackType<T> = (accummulator: ReadonlyArray<T>) => void | PromiseLike<void>;
export type ErrorHandler = (error: unknown) => void;

export class EventsBatcher<EventType> {
	private accumulator: Accumulator<EventType>;
	private strategy: Strategy<EventType>;

	constructor(
		private readonly cb: CallbackType<EventType>,
		private readonly errorHandler: ErrorHandler | null = null,
		private readonly options: CountOptions | ShiftOptions = defaultOptions) {
		const err = validateOptions(options);

		if (err !== null) {
			throw err;
		}

		this.accumulator = new Accumulator<EventType>(this.options.accumulatorType);
		this.strategy = NewStrategy<EventType>(options, this.accumulator, this.fire.bind(this));
	}

	public add(object: EventType): void {
		this.strategy.add(object);
	}

	public flush(): void {
		this.fire();
	}

	private fire(): void {
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
