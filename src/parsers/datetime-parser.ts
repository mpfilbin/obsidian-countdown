import { DateTimeParseResult } from '../types';

/**
 * Month name mappings for natural language parsing
 */
const MONTHS: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

/**
 * Parses a date/time string in ISO 8601 or natural language format
 *
 * Supported formats:
 * - ISO 8601: 2026-12-25, 2026-12-25T10:30:00, 2026-12-25T10:30:00Z, 2026-12-25T10:30:00+05:00
 * - Natural: December 25, 2026, Dec 25, 2026, 25 December 2026
 * - With time: December 25, 2026 at 10:30, December 25, 2026 10:30 PM
 * - US format: 12/25/2026
 *
 * @param input - The date/time string to parse
 * @returns DateTimeParseResult with either a Date or an error
 */
export function parseDateTime(input: string): DateTimeParseResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, error: 'Date/time cannot be empty' };
  }

  // ISO 8601 takes priority as the most unambiguous format
  const isoResult = tryParseISO8601(trimmed);
  if (isoResult) {
    return isoResult;
  }

  const naturalResult = tryParseNaturalLanguage(trimmed);
  if (naturalResult) {
    return naturalResult;
  }

  const usResult = tryParseUSFormat(trimmed);
  if (usResult) {
    return usResult;
  }

  return { valid: false, error: 'Invalid date/time format' };
}

/**
 * Attempts to parse ISO 8601 format
 */
function tryParseISO8601(input: string): DateTimeParseResult | null {
  // Date-only pattern (parse as local time, not UTC)
  const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dateOnlyMatch = dateOnlyPattern.exec(input);
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1] ?? '0', 10);
    const month = parseInt(dateOnlyMatch[2] ?? '0', 10) - 1; // 0-indexed
    const day = parseInt(dateOnlyMatch[3] ?? '0', 10);
    const date = new Date(year, month, day, 0, 0, 0);
    if (isValidDate(date) && date.getDate() === day && date.getMonth() === month) {
      return { valid: true, date };
    }
    return { valid: false, error: 'Invalid date/time: date values out of range' };
  }

  const isoPatterns = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  ];

  for (const pattern of isoPatterns) {
    if (pattern.test(input)) {
      const date = new Date(input);
      if (isValidDate(date)) {
        return { valid: true, date };
      }
      return { valid: false, error: 'Invalid date/time: date values out of range' };
    }
  }

  return null;
}

/**
 * Attempts to parse natural language date formats
 */
function tryParseNaturalLanguage(input: string): DateTimeParseResult | null {
  // Pattern: "December 25, 2026" or "Dec 25, 2026"
  const monthFirstPattern =
    /^(\w+)\s+(\d{1,2}),?\s+(\d{4})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i;
  const monthFirstMatch = monthFirstPattern.exec(input);
  if (monthFirstMatch) {
    return parseMonthFirst(monthFirstMatch);
  }

  // Pattern: "25 December 2026"
  const dayFirstPattern = /^(\d{1,2})\s+(\w+)\s+(\d{4})$/i;
  const dayFirstMatch = dayFirstPattern.exec(input);
  if (dayFirstMatch) {
    return parseDayFirst(dayFirstMatch);
  }

  return null;
}

/**
 * Parse "December 25, 2026" style dates
 */
function parseMonthFirst(match: RegExpExecArray): DateTimeParseResult {
  const monthStr = match[1]?.toLowerCase() ?? '';
  const day = parseInt(match[2] ?? '0', 10);
  const year = parseInt(match[3] ?? '0', 10);
  const hours = match[4] ? parseInt(match[4], 10) : 0;
  const minutes = match[5] ? parseInt(match[5], 10) : 0;
  const ampm = match[6]?.toUpperCase();

  const month = MONTHS[monthStr];
  if (month === undefined) {
    return { valid: false, error: `Invalid month: "${match[1]}"` };
  }

  let adjustedHours = hours;
  if (ampm === 'PM' && hours < 12) {
    adjustedHours = hours + 12;
  } else if (ampm === 'AM' && hours === 12) {
    adjustedHours = 0;
  }

  const date = new Date(year, month, day, adjustedHours, minutes, 0);
  if (isValidDate(date) && date.getDate() === day) {
    return { valid: true, date };
  }

  return { valid: false, error: 'Invalid date/time: date values out of range' };
}

/**
 * Parse "25 December 2026" style dates
 */
function parseDayFirst(match: RegExpExecArray): DateTimeParseResult {
  const day = parseInt(match[1] ?? '0', 10);
  const monthStr = match[2]?.toLowerCase() ?? '';
  const year = parseInt(match[3] ?? '0', 10);

  const month = MONTHS[monthStr];
  if (month === undefined) {
    return { valid: false, error: `Invalid month: "${match[2]}"` };
  }

  const date = new Date(year, month, day, 0, 0, 0);
  if (isValidDate(date) && date.getDate() === day) {
    return { valid: true, date };
  }

  return { valid: false, error: 'Invalid date/time: date values out of range' };
}

/**
 * Attempts to parse US format (MM/DD/YYYY)
 */
function tryParseUSFormat(input: string): DateTimeParseResult | null {
  const usPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = usPattern.exec(input);

  if (match) {
    const month = parseInt(match[1] ?? '0', 10) - 1; // 0-indexed
    const day = parseInt(match[2] ?? '0', 10);
    const year = parseInt(match[3] ?? '0', 10);

    const date = new Date(year, month, day, 0, 0, 0);
    if (isValidDate(date) && date.getDate() === day && date.getMonth() === month) {
      return { valid: true, date };
    }

    return { valid: false, error: 'Invalid date/time: date values out of range' };
  }

  return null;
}

/**
 * Checks if a Date object represents a valid date
 */
function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}
