import { DurationParseResult } from '../types';

/**
 * Unit multipliers in milliseconds
 */
const UNIT_MS: Record<string, number> = {
	s: 1000,
	m: 60 * 1000,
	h: 60 * 60 * 1000,
	d: 24 * 60 * 60 * 1000,
};

/**
 * Unit order for validation (must be in descending order: d > h > m > s)
 */
const UNIT_ORDER = ['d', 'h', 'm', 's'];

/**
 * Parses a duration string in the format: "30m", "1h30m", "2d5h30m45s"
 * Supports: d (days), h (hours), m (minutes), s (seconds)
 *
 * @param input - The duration string to parse
 * @returns DurationParseResult with either milliseconds or an error
 */
export function parseDuration(input: string): DurationParseResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { valid: false, error: 'Duration cannot be empty' };
	}

	// Remove spaces between units for easier parsing
	const normalized = trimmed.replace(/\s+/g, '');

	// Match all number+unit pairs
	const pattern = /^(\d+[dhms])+$/;
	if (!pattern.test(normalized)) {
		return { valid: false, error: 'Invalid duration format. Use format like "30m", "1h30m", or "2d5h30m45s"' };
	}

	// Extract all units and their values
	const unitPattern = /(\d+)([dhms])/g;
	const units: Array<{ value: number; unit: string; index: number }> = [];
	let match;

	while ((match = unitPattern.exec(normalized)) !== null) {
		units.push({
			value: parseInt(match[1] ?? '0', 10),
			unit: match[2] ?? '',
			index: UNIT_ORDER.indexOf(match[2] ?? ''),
		});
	}

	// Check for duplicate units
	const seenUnits = new Set<string>();
	for (const { unit } of units) {
		if (seenUnits.has(unit)) {
			return { valid: false, error: `Invalid duration: duplicate unit "${unit}"` };
		}
		seenUnits.add(unit);
	}

	// Check unit order (must be descending: d before h before m before s)
	for (let i = 1; i < units.length; i++) {
		const prev = units[i - 1];
		const curr = units[i];
		if (prev && curr && prev.index >= curr.index) {
			return { valid: false, error: 'Invalid duration: units must be in order (d, h, m, s)' };
		}
	}

	// Calculate total milliseconds
	let totalMs = 0;
	for (const { value, unit } of units) {
		const multiplier = UNIT_MS[unit];
		if (multiplier !== undefined) {
			totalMs += value * multiplier;
		}
	}

	return { valid: true, milliseconds: totalMs };
}
