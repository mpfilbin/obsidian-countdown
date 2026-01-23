import yaml from 'js-yaml';
import { ConfigValidationResult, CountdownConfig, RawCountdownConfig } from '../types';
import { parseDuration } from './duration-parser';
import { parseDateTime } from './datetime-parser';

/**
 * Parses and validates a YAML configuration string for a countdown timer
 *
 * @param input - The YAML configuration string
 * @returns ConfigValidationResult with either a valid config or an error
 */
export function parseConfig(input: string): ConfigValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, error: 'Configuration cannot be empty' };
  }

  // Parse YAML
  let rawConfig: RawCountdownConfig;
  try {
    const parsed = yaml.load(trimmed);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'Invalid YAML: configuration must be an object' };
    }
    rawConfig = parsed as RawCountdownConfig;
  } catch (e) {
    return {
      valid: false,
      error: `Invalid YAML syntax: ${e instanceof Error ? e.message : 'unknown error'}`,
    };
  }

  // Validate required title field
  if (!rawConfig.title) {
    return { valid: false, error: 'Configuration error: "title" is required' };
  }

  const title = String(rawConfig.title).trim();
  if (!title) {
    return { valid: false, error: 'Configuration error: "title" cannot be empty' };
  }

  // Validate target/duration mutual exclusivity
  const hasTarget = rawConfig.target !== undefined && rawConfig.target !== null;
  const hasDuration = rawConfig.duration !== undefined && rawConfig.duration !== null;

  if (!hasTarget && !hasDuration) {
    return {
      valid: false,
      error: 'Configuration error: either "target" or "duration" is required',
    };
  }

  if (hasTarget && hasDuration) {
    return {
      valid: false,
      error:
        'Configuration error: "target" and "duration" are mutually exclusive (provide one or the other, not both)',
    };
  }

  // Build the config object
  const config: CountdownConfig = { title };

  // Parse target date if provided
  if (hasTarget) {
    // Handle case where YAML already parsed the value as a Date
    if (rawConfig.target instanceof Date) {
      if (isNaN(rawConfig.target.getTime())) {
        return { valid: false, error: 'Invalid target date: date values out of range' };
      }
      config.target = rawConfig.target;
    } else {
      const targetStr = String(rawConfig.target);
      const dateResult = parseDateTime(targetStr);
      if (!dateResult.valid) {
        return { valid: false, error: `Invalid target date: ${dateResult.error}` };
      }
      config.target = dateResult.date;
    }
  }

  // Parse duration if provided
  if (hasDuration) {
    const durationStr = String(rawConfig.duration);
    const durationResult = parseDuration(durationStr);
    if (!durationResult.valid) {
      return { valid: false, error: `Invalid duration: ${durationResult.error}` };
    }
    config.duration = durationResult.milliseconds;
  }

  // Parse optional format
  if (rawConfig.format !== undefined && rawConfig.format !== null) {
    config.format = String(rawConfig.format);
  }

  return { valid: true, config };
}
