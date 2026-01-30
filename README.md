# node-events-batcher

Universal events batcher for NodeJS. Collects events and flushes them in batches via configurable strategies (size-based or time-based) with array or set accumulation.

## Install

> [!NOTE] 
> It's highly recommended to use with [volta.sh](https://volta.sh).

```bash
npm install node-events-batcher
```

## Quick start

```ts
import { EventsBatcher } from 'node-events-batcher';

const batcher = new EventsBatcher<string>(
  (events) => {
    console.log('Flushed:', events);
  },
  (err) => console.error(err),
  { size: 5, accumulatorType: 'array', timeoutMs: 5000 }
);

batcher.add('a');
batcher.add('b');
batcher.add('c');
batcher.add('d');
batcher.add('e'); // callback runs with ['a','b','c','d','e']

batcher.flush(); // flush any remaining events manually
```

## API

### `EventsBatcher<EventType>`

**Constructor**

```ts
new EventsBatcher<EventType>(
  callback: (events: ReadonlyArray<EventType>) => void | Promise<void>,
  errorHandler?: ((error: unknown) => void) | null,
  options?: SizeOptions | DebounceOptions
)
```

- **callback** — Called with the batched events when a flush occurs. May return a Promise; rejections are passed to `errorHandler`.
- **errorHandler** — Optional. If provided, callback errors are passed here; otherwise they are rethrown.
- **options** — Flush strategy and accumulator. Defaults to `{ accumulatorType: 'array', timeoutMs: 2000, debounceMs: 50 }` (debounce strategy).

**Methods**

- **`add(event: EventType): void`** — Add an event. May trigger a flush depending on the strategy.
- **`flush(): void`** — Flush all accumulated events immediately.

### Options

Two strategy types:

| Option | Type | Description |
|--------|------|-------------|
| **Size strategy** | `SizeOptions` | Flush when the batch reaches `size` events. |
| **Debounce strategy** | `DebounceOptions` | Flush after `debounceMs` ms of no new events. |

**Common options**

| Option | Type | Description |
|--------|------|-------------|
| `accumulatorType` | `'array'` \| `'set'` | `'array'` — order preserved, duplicates allowed. `'set'` — unique events only, order not guaranteed. |
| `timeoutMs` | `number` \| `null` | Max wait (ms) before flushing; `null` disables. |

**Size strategy** (`SizeOptions`)

| Option | Type | Description |
|--------|------|-------------|
| `size` | `number` | Flush when batch size reaches this value. |

**Debounce strategy** (`DebounceOptions`)

| Option | Type | Description |
|--------|------|-------------|
| `debounceMs` | `number` | Flush after this many ms without a new event. Must be &lt; `timeoutMs` when `timeoutMs` is set. |

### Examples

**Size-based batching (e.g. send when 10 items):**

```ts
const batcher = new EventsBatcher<Payload>(
  sendToServer,
  null,
  {
    size: 10,
    accumulatorType: 'array',
    timeoutMs: 3000,
  }
);
```

**Time-based debounce (e.g. persist after 100 ms idle):**

```ts
const batcher = new EventsBatcher<WindowId>(
  persistWindowState,
  console.error,
  {
    debounceMs: 100,
    timeoutMs: 2000,
    accumulatorType: 'set',
  }
);
```

**Exports**

```ts
import { EventsBatcher } from 'node-events-batcher';
import type { SizeOptions, DebounceOptions } from 'node-events-batcher';
```

## Example app

The `example/` folder contains an Electron app that uses the batcher to persist window state when windows are closed. Run it from the repo root:

```bash
cd example && pnpm install && pnpm start
```

## License

MIT
