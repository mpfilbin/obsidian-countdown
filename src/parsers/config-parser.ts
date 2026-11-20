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

  let rawConfig: RawCountdownConfig;
  try {
    // Use JSON_SCHEMA to disable automatic date parsing
    // This ensures all dates are passed as strings to our parseDateTime function
    // which correctly handles timezone vs local time distinctions
    const parsed = yaml.load(trimmed, { schema: yaml.JSON_SCHEMA });
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

  if (!rawConfig.title) {
    return { valid: false, error: 'Configuration error: "title" is required' };
  }

  const title = String(rawConfig.title).trim();
  if (!title) {
    return { valid: false, error: 'Configuration error: "title" cannot be empty' };
  }

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

  const config: CountdownConfig = { title };

  if (hasTarget) {
    // With JSON_SCHEMA, dates are always strings, so we parse them ourselves
    // This allows us to correctly handle timezone vs local time distinctions
    const targetStr = String(rawConfig.target);
    const dateResult = parseDateTime(targetStr);
    if (!dateResult.valid) {
      return { valid: false, error: `Invalid target date: ${dateResult.error}` };
    }
    config.target = dateResult.date;
  }

  if (hasDuration) {
    const durationStr = String(rawConfig.duration);
    const durationResult = parseDuration(durationStr);
    if (!durationResult.valid) {
      return { valid: false, error: `Invalid duration: ${durationResult.error}` };
    }
    config.duration = durationResult.milliseconds;
  }

  const hasStarted = rawConfig.started !== undefined && rawConfig.started !== null;
  if (hasStarted) {
    if (!hasDuration) {
      return {
        valid: false,
        error: 'Configuration error: "started" can only be used with "duration"',
      };
    }
    const startedResult = parseDateTime(String(rawConfig.started));
    if (!startedResult.valid) {
      return { valid: false, error: `Invalid started date: ${startedResult.error}` };
    }
    config.started = startedResult.date;
  }

  if (rawConfig.format !== undefined && rawConfig.format !== null) {
    config.format = String(rawConfig.format);
  }

  return { valid: true, config };
}
