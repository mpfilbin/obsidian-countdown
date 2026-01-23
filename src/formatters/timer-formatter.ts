/**
 * Time components broken down into units
 */
export interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Converts milliseconds to time components
 */
function msToComponents(ms: number): TimeComponents {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return { days, hours, minutes, seconds };
}

/**
 * Pads a number with leading zeros
 */
function pad(num: number, width: number = 2): string {
  return num.toString().padStart(width, '0');
}

/**
 * Formats time remaining in milliseconds to a human-readable string
 *
 * @param ms - Time remaining in milliseconds
 * @param format - Optional strftime-style format string
 * @returns Formatted time string or "complete" if expired
 */
export function formatTimeRemaining(ms: number, format?: string): string {
  // Treat negative values as zero (timer complete)
  const effectiveMs = Math.max(0, ms);
  const components = msToComponents(effectiveMs);

  if (format) {
    return formatWithStrftime(format, components);
  }

  // Default format: "0d 00h 00m 00s" (zero-padded for consistent width)
  return `${components.days}d ${pad(components.hours)}h ${pad(components.minutes)}m ${pad(components.seconds)}s`;
}

/**
 * Formats time components using strftime-style format codes
 *
 * Supported codes:
 * - %d - days (not zero-padded)
 * - %H - hours (zero-padded to 2 digits, includes days if %d not in format)
 * - %M - minutes (zero-padded to 2 digits)
 * - %S - seconds (zero-padded to 2 digits)
 * - %% - literal percent sign
 *
 * @param format - strftime-style format string
 * @param components - Time components
 * @returns Formatted string
 */
export function formatWithStrftime(format: string, components: TimeComponents): string {
  const { days, hours, minutes, seconds } = components;

  // Check if %d is in the format to determine how to handle hours
  const hasDaysFormat = format.includes('%d');

  // Calculate total hours (including days) if %d is not in format
  const displayHours = hasDaysFormat ? hours : days * 24 + hours;

  let result = format;

  // Process format codes
  // We need to be careful about the order to avoid replacing %% incorrectly
  // First, temporarily replace %% with a placeholder
  const percentPlaceholder = '\x00PERCENT\x00';
  result = result.replace(/%%/g, percentPlaceholder);

  // Replace format codes
  result = result.replace(/%d/g, days.toString());
  result = result.replace(/%H/g, pad(displayHours));
  result = result.replace(/%M/g, pad(minutes));
  result = result.replace(/%S/g, pad(seconds));

  // Restore literal percent signs
  result = result.replace(new RegExp(percentPlaceholder, 'g'), '%');

  return result;
}
