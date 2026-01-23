import { parseDuration } from '../../src/parsers/duration-parser';

describe('DurationParser', () => {
  describe('when parsing valid durations', () => {
    describe('with single units', () => {
      it('should parse seconds (30s)', () => {
        const result = parseDuration('30s');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(30 * 1000);
        }
      });

      it('should parse minutes (30m)', () => {
        const result = parseDuration('30m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(30 * 60 * 1000);
        }
      });

      it('should parse hours (2h)', () => {
        const result = parseDuration('2h');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(2 * 60 * 60 * 1000);
        }
      });

      it('should parse days (5d)', () => {
        const result = parseDuration('5d');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(5 * 24 * 60 * 60 * 1000);
        }
      });
    });

    describe('with combined units', () => {
      it('should parse hours and minutes (1h30m)', () => {
        const result = parseDuration('1h30m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe((1 * 60 + 30) * 60 * 1000);
        }
      });

      it('should parse days and hours (2d5h)', () => {
        const result = parseDuration('2d5h');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe((2 * 24 + 5) * 60 * 60 * 1000);
        }
      });

      it('should parse days, hours, and minutes (1d2h30m)', () => {
        const result = parseDuration('1d2h30m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(((1 * 24 + 2) * 60 + 30) * 60 * 1000);
        }
      });

      it('should parse all units (1d2h30m45s)', () => {
        const result = parseDuration('1d2h30m45s');
        expect(result.valid).toBe(true);
        if (result.valid) {
          const expected = (((1 * 24 + 2) * 60 + 30) * 60 + 45) * 1000;
          expect(result.milliseconds).toBe(expected);
        }
      });

      it('should parse minutes and seconds (5m30s)', () => {
        const result = parseDuration('5m30s');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe((5 * 60 + 30) * 1000);
        }
      });
    });

    describe('with whitespace', () => {
      it('should handle leading whitespace', () => {
        const result = parseDuration('  30m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(30 * 60 * 1000);
        }
      });

      it('should handle trailing whitespace', () => {
        const result = parseDuration('30m  ');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(30 * 60 * 1000);
        }
      });

      it('should handle whitespace between units', () => {
        const result = parseDuration('1h 30m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe((1 * 60 + 30) * 60 * 1000);
        }
      });
    });

    describe('with zero values', () => {
      it('should parse zero minutes (0m)', () => {
        const result = parseDuration('0m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(0);
        }
      });

      it('should parse mixed zero and non-zero (0h30m)', () => {
        const result = parseDuration('0h30m');
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.milliseconds).toBe(30 * 60 * 1000);
        }
      });
    });
  });

  describe('when parsing invalid durations', () => {
    it('should return error for empty string', () => {
      const result = parseDuration('');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('empty');
      }
    });

    it('should return error for whitespace only', () => {
      const result = parseDuration('   ');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('empty');
      }
    });

    it('should return error for invalid format (no unit)', () => {
      const result = parseDuration('30');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should return error for invalid unit', () => {
      const result = parseDuration('30x');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should return error for negative values', () => {
      const result = parseDuration('-30m');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should return error for decimal values', () => {
      const result = parseDuration('1.5h');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should return error for random text', () => {
      const result = parseDuration('hello');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Invalid');
      }
    });

    it('should return error for units in wrong order', () => {
      const result = parseDuration('30m1h');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('order');
      }
    });

    it('should return error for duplicate units', () => {
      const result = parseDuration('1h2h');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('duplicate');
      }
    });
  });
});
