import { parseDateTime } from '../../src/parsers/datetime-parser';

describe('DateTimeParser', () => {
	describe('when parsing ISO 8601 formats', () => {
		it('should parse full ISO 8601 datetime (2026-12-25T00:00:00)', () => {
			const result = parseDateTime('2026-12-25T00:00:00');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11); // December is 11
				expect(result.date.getDate()).toBe(25);
				expect(result.date.getHours()).toBe(0);
				expect(result.date.getMinutes()).toBe(0);
				expect(result.date.getSeconds()).toBe(0);
			}
		});

		it('should parse ISO 8601 with timezone offset (2026-12-25T10:30:00+05:00)', () => {
			const result = parseDateTime('2026-12-25T10:30:00+05:00');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date instanceof Date).toBe(true);
			}
		});

		it('should parse ISO 8601 with Z timezone (2026-12-25T10:30:00Z)', () => {
			const result = parseDateTime('2026-12-25T10:30:00Z');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date instanceof Date).toBe(true);
			}
		});

		it('should parse ISO 8601 date only (2026-12-25)', () => {
			const result = parseDateTime('2026-12-25');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
			}
		});

		it('should parse ISO 8601 with milliseconds (2026-12-25T10:30:00.123Z)', () => {
			const result = parseDateTime('2026-12-25T10:30:00.123Z');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date instanceof Date).toBe(true);
			}
		});
	});

	describe('when parsing natural language formats', () => {
		it('should parse "December 25, 2026"', () => {
			const result = parseDateTime('December 25, 2026');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
			}
		});

		it('should parse "Dec 25, 2026"', () => {
			const result = parseDateTime('Dec 25, 2026');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
			}
		});

		it('should parse "25 December 2026"', () => {
			const result = parseDateTime('25 December 2026');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
			}
		});

		it('should parse "December 25, 2026 at 10:30"', () => {
			const result = parseDateTime('December 25, 2026 at 10:30');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
				expect(result.date.getHours()).toBe(10);
				expect(result.date.getMinutes()).toBe(30);
			}
		});

		it('should parse "December 25, 2026 10:30 PM"', () => {
			const result = parseDateTime('December 25, 2026 10:30 PM');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
				expect(result.date.getHours()).toBe(22);
				expect(result.date.getMinutes()).toBe(30);
			}
		});

		it('should parse "12/25/2026"', () => {
			const result = parseDateTime('12/25/2026');
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.date.getFullYear()).toBe(2026);
				expect(result.date.getMonth()).toBe(11);
				expect(result.date.getDate()).toBe(25);
			}
		});
	});

	describe('when handling whitespace', () => {
		it('should handle leading whitespace', () => {
			const result = parseDateTime('  2026-12-25');
			expect(result.valid).toBe(true);
		});

		it('should handle trailing whitespace', () => {
			const result = parseDateTime('2026-12-25  ');
			expect(result.valid).toBe(true);
		});
	});

	describe('when parsing invalid dates', () => {
		it('should return error for empty string', () => {
			const result = parseDateTime('');
			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.error).toContain('empty');
			}
		});

		it('should return error for whitespace only', () => {
			const result = parseDateTime('   ');
			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.error).toContain('empty');
			}
		});

		it('should return error for random text', () => {
			const result = parseDateTime('not a date');
			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.error).toContain('Invalid');
			}
		});

		it('should return error for invalid ISO format', () => {
			const result = parseDateTime('2026-13-45');
			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.error).toContain('Invalid');
			}
		});

		it('should return error for partial date', () => {
			const result = parseDateTime('2026-12');
			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.error).toContain('Invalid');
			}
		});
	});
});
