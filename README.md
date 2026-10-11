# RFC 3339 Timestamp Validator

A small, zero-dependency TypeScript/JavaScript (ESM) library that validates RFC 3339
timestamps and returns a normalized form with the original timezone offset preserved.

## Usage

```js
import { parseRfc3339, isValidRfc3339 } from './src/index.js';

const info = parseRfc3339('2023-10-05 14:30:00.123+05:30');
// { iso: '2023-10-05T14:30:00.123+05:30', offset: '+05:30', date: Date }

isValidRfc3339('2023-13-05T14:30:00Z'); // false
```

## Why

`new Date(str)` and `Date.parse` accept many non-RFC-3339 forms (month 13 silently
coerced, space or T interchangeable without a single rule, fractional seconds of any
length). This library applies a strict RFC 3339 grammar so malformed offsets, partial
fractional seconds, and truncated fields are rejected rather than repaired. The trade-off
is strictness: inputs that other parsers accept (lowercase `z`, `+0530` without a colon)
are rejected here.

## Edge cases you will hit

- A space between date and time is accepted and normalized to `T`; the original offset is
  preserved verbatim and is not converted to UTC.
- Day-of-month values like `31` in a 30-day month are rejected, even though they are
  syntactically valid, because they do not represent a real date.
- Fractional seconds of any non-zero length are accepted and preserved as written.

## API

- `parseRfc3339(value: string): { iso: string, offset: string, date: Date } | null`
- `isValidRfc3339(value: string): boolean`

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

