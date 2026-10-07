/**
 * RFC 3339 timestamp validation and normalization.
 *
 * The standard library's `Date` parser accepts many non-RFC-3339 forms and silently
 * coerces invalid input to a NaN or adjusted Date. This module uses a strict regular
 * expression so that malformed offsets, partial fractional seconds, or truncated
 * dates are rejected instead of silently repaired.
 */

// RFC 3339 permits a space OR 'T' between date and time. Permitting both keeps the
// validator lenient on the one axis RFC 3339 itself allows variation on, while
// staying strict on everything else.
const RFC3339 = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(T| )([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-][0-2][0-9]:[0-5][0-9])$/;

/**
 * @typedef {Object} TimestampInfo
 * @property {string} iso       A normalized ISO 8601 representation of the input.
 * @property {string} offset    The original timezone offset (e.g. "+05:30" or "Z").
 * @property {Date}   date      A Date corresponding to the timestamp.
 */

/**
 * Validate and normalize an RFC 3339 timestamp.
 *
 * The returned `iso` is normalized only cosmetically: a space separator becomes 'T',
 * the original offset is preserved verbatim, and the case of 'Z' is preserved as 'Z'.
 * No attempt is made to canonicalize fractional-second precision or offset form.
 *
 * @param {string} value
 * @returns {TimestampInfo|null} `null` when `value` is not a syntactically valid
 *   RFC 3339 timestamp, otherwise an info object.
 */
export function parseRfc3339(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(RFC3339);
  if (!m) return null;

  const [, year, month, day, , hh, mm, ss, frac, offset] = m;

  const normalized = `${year}-${month}-${day}T${hh}:${mm}:${ss}${frac || ''}${offset}`;

  // `Date` understands the normalized form directly. If `Date` rejects it (e.g. day
  // is valid syntactically but out of range for the month), we reject too.
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  // Reject syntactically valid but non-existent days (e.g. April 31) that `Date`
  // silently rolls over into the next month.
  const parsedMonth = date.getUTCMonth() + 1;
  if (parsedMonth !== Number(month)) return null;

  return { iso: normalized, offset, date };
}

/**
 * Return true when `value` is a syntactically valid RFC 3339 timestamp.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidRfc3339(value) {
  return parseRfc3339(value) !== null;
}
