import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseRfc3339, isValidRfc3339 } from '../src/index.js';

// The suite deliberately covers the awkward cases the implementation actually
// handles: space vs T separators, fractional seconds, offset preservation,
// invalid leap-style days, malformed offsets, and non-string input.

test('basic valid timestamp with Z', () => {
  const r = parseRfc3339('2023-10-05T14:30:00Z');
  assert.notEqual(r, null);
  assert.equal(r.iso, '2023-10-05T14:30:00Z');
  assert.equal(r.offset, 'Z');
});

test('space separator is accepted and normalized to T', () => {
  const r = parseRfc3339('2023-10-05 14:30:00Z');
  assert.notEqual(r, null);
  assert.equal(r.iso, '2023-10-05T14:30:00Z');
});

test('positive numeric offset is preserved', () => {
  const r = parseRfc3339('2023-10-05T14:30:00+05:30');
  assert.notEqual(r, null);
  assert.equal(r.offset, '+05:30');
  assert.equal(r.iso, '2023-10-05T14:30:00+05:30');
});

test('negative offset is preserved', () => {
  const r = parseRfc3339('2023-10-05T14:30:00-08:00');
  assert.notEqual(r, null);
  assert.equal(r.offset, '-08:00');
});

test('fractional seconds are preserved verbatim', () => {
  const r = parseRfc3339('2023-10-05T14:30:00.123456Z');
  assert.notEqual(r, null);
  assert.equal(r.iso, '2023-10-05T14:30:00.123456Z');
});

test('single digit fractional second is allowed', () => {
  const r = parseRfc3339('2023-10-05T14:30:00.5Z');
  assert.notEqual(r, null);
  assert.equal(r.iso, '2023-10-05T14:30:00.5Z');
});

test('invalid month 00 is rejected', () => {
  assert.equal(isValidRfc3339('2023-00-05T14:30:00Z'), false);
});

test('invalid month 13 is rejected', () => {
  assert.equal(isValidRfc3339('2023-13-05T14:30:00Z'), false);
});

test('day 31 of a 30-day month is rejected via Date semantics', () => {
  // April has 30 days. The regex accepts "31" as a syntactic day, but Date
  // rolls it into May; we detect that mismatch and reject.
  assert.equal(isValidRfc3339('2023-04-31T14:30:00Z'), false);
});

test('day 00 is rejected', () => {
  assert.equal(isValidRfc3339('2023-10-00T14:30:00Z'), false);
});

test('malformed offset without colon is rejected', () => {
  assert.equal(isValidRfc3339('2023-10-05T14:30:00+0530'), false);
});

test('missing seconds field is rejected', () => {
  assert.equal(isValidRfc3339('2023-10-05T14:30Z'), false);
});

test('lowercase z offset is rejected (RFC 3339 requires uppercase Z)', () => {
  assert.equal(isValidRfc3339('2023-10-05T14:30:00z'), false);
});

test('hour 24 is rejected', () => {
  assert.equal(isValidRfc3339('2023-10-05T24:00:00Z'), false);
});

test('minute 60 is rejected', () => {
  assert.equal(isValidRfc3339('2023-10-05T14:60:00Z'), false);
});

test('date-only string is rejected', () => {
  assert.equal(isValidRfc3339('2023-10-05'), false);
});

test('non-string input is rejected', () => {
  assert.equal(isValidRfc3339(12345), false);
  assert.equal(isValidRfc3339(null), false);
  assert.equal(isValidRfc3339(undefined), false);
});

test('isValidRfc3339 true for valid and parse returns matching date epoch', () => {
  const r = parseRfc3339('2023-10-05T14:30:00Z');
  assert.equal(isValidRfc3339('2023-10-05T14:30:00Z'), true);
  assert.equal(r.date.getTime(), Date.parse('2023-10-05T14:30:00Z'));
});
