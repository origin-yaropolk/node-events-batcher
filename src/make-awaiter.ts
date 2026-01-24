export function makeAwaiter<T = void>(): [(value: T | PromiseLike<T>) => void, Promise<T>, (reason?: unknown) => void] {
	let resolver: ((value: T | PromiseLike<T>) => void) | null = null;
	let rejecter: ((reason?: unknown) => void) | null = null;

	const awaiter = new Promise<T>((resolve, reject) => {
		resolver = resolve;
		rejecter = reject;
	});

	if (resolver && rejecter) {
		return [resolver, awaiter, rejecter];
	}

	throw Error('MakeAwaiter: should not be executed');
}
