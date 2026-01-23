import { formatTimeRemaining, formatWithStrftime } from '../../src/formatters/timer-formatter';

describe('TimerFormatter', () => {
  describe('formatTimeRemaining', () => {
    describe('with default format', () => {
      it('should format days, hours, minutes, seconds with zero-padding', () => {
        // 2 days, 5 hours, 30 minutes, 45 seconds in ms
        const ms = ((2 * 24 + 5) * 60 + 30) * 60 * 1000 + 45 * 1000;
        const result = formatTimeRemaining(ms);
        expect(result).toBe('2d 05h 30m 45s');
      });

      it('should show zero values (not hide them)', () => {
        // 5 hours, 0 minutes, 30 seconds
        const ms = (5 * 60 * 60 + 0 * 60 + 30) * 1000;
        const result = formatTimeRemaining(ms);
        expect(result).toBe('0d 05h 00m 30s');
      });

      it('should format zero time', () => {
        const result = formatTimeRemaining(0);
        expect(result).toBe('0d 00h 00m 00s');
      });

      it('should format minutes and seconds only', () => {
        // 45 minutes, 30 seconds
        const ms = (45 * 60 + 30) * 1000;
        const result = formatTimeRemaining(ms);
        expect(result).toBe('0d 00h 45m 30s');
      });

      it('should format large values', () => {
        // 100 days
        const ms = 100 * 24 * 60 * 60 * 1000;
        const result = formatTimeRemaining(ms);
        expect(result).toBe('100d 00h 00m 00s');
      });
    });

    describe('with custom strftime format', () => {
      it('should format using %d for days', () => {
        const ms = 5 * 24 * 60 * 60 * 1000; // 5 days
        const result = formatTimeRemaining(ms, '%d days');
        expect(result).toBe('5 days');
      });

      it('should format using %H for hours (zero-padded)', () => {
        const ms = 5 * 60 * 60 * 1000; // 5 hours
        const result = formatTimeRemaining(ms, '%H hours');
        expect(result).toBe('05 hours');
      });

      it('should format using %M for minutes (zero-padded)', () => {
        const ms = 5 * 60 * 1000; // 5 minutes
        const result = formatTimeRemaining(ms, '%M minutes');
        expect(result).toBe('05 minutes');
      });

      it('should format using %S for seconds (zero-padded)', () => {
        const ms = 5 * 1000; // 5 seconds
        const result = formatTimeRemaining(ms, '%S seconds');
        expect(result).toBe('05 seconds');
      });

      it('should format complex strftime pattern', () => {
        // 1 day, 2 hours, 30 minutes, 45 seconds
        const ms = ((1 * 24 + 2) * 60 + 30) * 60 * 1000 + 45 * 1000;
        const result = formatTimeRemaining(ms, '%dd %Hh %Mm %Ss');
        expect(result).toBe('1d 02h 30m 45s');
      });

      it('should handle format with only some units', () => {
        // 1 day, 2 hours, 30 minutes, 45 seconds
        const ms = ((1 * 24 + 2) * 60 + 30) * 60 * 1000 + 45 * 1000;
        const result = formatTimeRemaining(ms, '%H:%M:%S');
        expect(result).toBe('26:30:45');
      });

      it('should handle literal percent sign (%%)', () => {
        const ms = 50 * 1000; // 50 seconds
        const result = formatTimeRemaining(ms, '%S%% complete');
        expect(result).toBe('50% complete');
      });
    });

    describe('when handling edge cases', () => {
      it('should return zero-padded zeros for negative values', () => {
        const result = formatTimeRemaining(-1000);
        expect(result).toBe('0d 00h 00m 00s');
      });

      it('should round down fractional milliseconds', () => {
        const ms = 5500; // 5.5 seconds
        const result = formatTimeRemaining(ms);
        expect(result).toBe('0d 00h 00m 05s');
      });
    });
  });

  describe('formatWithStrftime', () => {
    it('should replace %d with days', () => {
      const result = formatWithStrftime('%d', { days: 5, hours: 0, minutes: 0, seconds: 0 });
      expect(result).toBe('5');
    });

    it('should replace %H with zero-padded hours', () => {
      const result = formatWithStrftime('%H', { days: 0, hours: 5, minutes: 0, seconds: 0 });
      expect(result).toBe('05');
    });

    it('should replace %M with zero-padded minutes', () => {
      const result = formatWithStrftime('%M', { days: 0, hours: 0, minutes: 5, seconds: 0 });
      expect(result).toBe('05');
    });

    it('should replace %S with zero-padded seconds', () => {
      const result = formatWithStrftime('%S', { days: 0, hours: 0, minutes: 0, seconds: 5 });
      expect(result).toBe('05');
    });

    it('should handle total hours with %H when days > 0', () => {
      // When using %H without %d, hours should include days converted to hours
      const result = formatWithStrftime('%H:%M:%S', {
        days: 1,
        hours: 2,
        minutes: 30,
        seconds: 45,
      });
      expect(result).toBe('26:30:45');
    });

    it('should not convert days to hours when %d is present', () => {
      const result = formatWithStrftime('%d days %H:%M:%S', {
        days: 1,
        hours: 2,
        minutes: 30,
        seconds: 45,
      });
      expect(result).toBe('1 days 02:30:45');
    });

    it('should handle %% as literal percent', () => {
      const result = formatWithStrftime('%%', { days: 0, hours: 0, minutes: 0, seconds: 0 });
      expect(result).toBe('%');
    });

    it('should handle unknown format codes as literals', () => {
      const result = formatWithStrftime('%x', { days: 0, hours: 0, minutes: 0, seconds: 0 });
      expect(result).toBe('%x');
    });
  });
});
