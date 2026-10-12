export interface DateRange {
  start: Date; // inclusive
  end: Date; // exclusive
}

const DAY_MS = 86_400_000;

export function getPeriodRanges(
  length = 30,
  now = new Date(),
): { current: DateRange; previous: DateRange } {
  // Start of tomorrow in UTC, so today is fully included.
  const currentEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  // UTC has no DST, so plain millisecond arithmetic is safe.
  const currentStart = new Date(currentEnd.getTime() - length * DAY_MS);

  const previousEnd = currentStart;
  const previousStart = new Date(previousEnd.getTime() - length * DAY_MS);

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
}
