/**
 * Configuration for a countdown timer parsed from YAML
 */
export interface CountdownConfig {
  /** Required title/label for the timer */
  title: string;
  /** Target date/time (mutually exclusive with duration) */
  target?: Date;
  /** Duration in milliseconds (mutually exclusive with target) */
  duration?: number;
  /** Optional strftime format string */
  format?: string;
}

/**
 * Raw YAML configuration before parsing
 * Note: js-yaml may parse dates as Date objects, so target can be string or Date
 */
export interface RawCountdownConfig {
  title?: string;
  target?: string | Date;
  duration?: string;
  format?: string;
}

/**
 * Result of configuration validation
 */
export type ConfigValidationResult =
  | { valid: true; config: CountdownConfig }
  | { valid: false; error: string };

/**
 * Result of duration parsing
 */
export type DurationParseResult =
  | { valid: true; milliseconds: number }
  | { valid: false; error: string };

/**
 * Result of date/time parsing
 */
export type DateTimeParseResult = { valid: true; date: Date } | { valid: false; error: string };
