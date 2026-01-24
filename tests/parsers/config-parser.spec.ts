import { parseConfig } from '../../src/parsers/config-parser';

describe('ConfigParser', () => {
  describe('when parsing valid configurations', () => {
    describe('with target date', () => {
      it('should parse config with ISO 8601 target', () => {
        const yaml = `
title: "Project Deadline"
target: "2026-12-25T17:00:00"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('Project Deadline');
          expect(result.config.target).toBeInstanceOf(Date);
          expect(result.config.duration).toBeUndefined();
        }
      });

      it('should parse config with natural language target', () => {
        const yaml = `
title: "Birthday"
target: "December 25, 2026"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('Birthday');
          expect(result.config.target).toBeInstanceOf(Date);
        }
      });

      it('should parse config with optional format', () => {
        const yaml = `
title: "New Year"
target: "2027-01-01T00:00:00"
format: "%dd %Hh %Mm"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('New Year');
          expect(result.config.format).toBe('%dd %Hh %Mm');
        }
      });
    });

    describe('with duration', () => {
      it('should parse config with simple duration', () => {
        const yaml = `
title: "Pomodoro Timer"
duration: "25m"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('Pomodoro Timer');
          expect(result.config.duration).toBe(25 * 60 * 1000);
          expect(result.config.target).toBeUndefined();
        }
      });

      it('should parse config with complex duration', () => {
        const yaml = `
title: "Long Break"
duration: "1h30m"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('Long Break');
          expect(result.config.duration).toBe((60 + 30) * 60 * 1000);
        }
      });

      it('should parse config with duration and format', () => {
        const yaml = `
title: "Focus Time"
duration: "45m"
format: "%Mm %Ss"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('Focus Time');
          expect(result.config.duration).toBe(45 * 60 * 1000);
          expect(result.config.format).toBe('%Mm %Ss');
        }
      });
    });

    describe('with whitespace handling', () => {
      it('should handle extra whitespace in YAML', () => {
        const yaml = `

title:   "Spaced Title"
target:    "2026-12-25"

`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('Spaced Title');
        }
      });

      it('should handle unquoted string values', () => {
        const yaml = `
title: My Timer
target: 2026-12-25
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.config.title).toBe('My Timer');
        }
      });

      it('should parse unquoted ISO date as local time (not UTC)', () => {
        // With yaml.JSON_SCHEMA, js-yaml leaves dates as strings; parseConfig/parseDateTime
        // should interpret this unquoted ISO date as a local-time midnight value.
        const yaml = `
title: My Timer
target: 2026-03-20
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          // The date should be March 20 at midnight LOCAL time
          expect(result.config.target?.getFullYear()).toBe(2026);
          expect(result.config.target?.getMonth()).toBe(2); // March is 2
          expect(result.config.target?.getDate()).toBe(20);
          expect(result.config.target?.getHours()).toBe(0);
          expect(result.config.target?.getMinutes()).toBe(0);
        }
      });

      it('should parse unquoted ISO datetime as local time (not UTC)', () => {
        const yaml = `
title: My Timer
target: 2026-03-20T14:30:00
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          // The date should be March 20 at 14:30 LOCAL time
          expect(result.config.target?.getFullYear()).toBe(2026);
          expect(result.config.target?.getMonth()).toBe(2); // March is 2
          expect(result.config.target?.getDate()).toBe(20);
          expect(result.config.target?.getHours()).toBe(14);
          expect(result.config.target?.getMinutes()).toBe(30);
        }
      });

      it('should respect Z timezone in unquoted ISO datetime', () => {
        const yaml = `
title: My Timer
target: 2026-03-20T08:46:00Z
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          // 08:46 UTC should be stored as UTC, displayed in local time
          // The Date object should represent 08:46 UTC
          expect(result.config.target?.getUTCFullYear()).toBe(2026);
          expect(result.config.target?.getUTCMonth()).toBe(2); // March is 2
          expect(result.config.target?.getUTCDate()).toBe(20);
          expect(result.config.target?.getUTCHours()).toBe(8);
          expect(result.config.target?.getUTCMinutes()).toBe(46);
        }
      });

      it('should respect timezone offset in unquoted ISO datetime', () => {
        const yaml = `
title: My Timer
target: 2026-03-20T10:30:00+05:00
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(true);
        if (result.valid) {
          // 10:30 at +05:00 is 05:30 UTC
          expect(result.config.target?.getUTCHours()).toBe(5);
          expect(result.config.target?.getUTCMinutes()).toBe(30);
        }
      });
    });
  });

  describe('when parsing invalid configurations', () => {
    describe('with missing required fields', () => {
      it('should return error when title is missing', () => {
        const yaml = `
target: "2026-12-25"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error).toContain('title');
          expect(result.error.toLowerCase()).toContain('required');
        }
      });

      it('should return error when both target and duration are missing', () => {
        const yaml = `
title: "Empty Timer"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error).toContain('target');
          expect(result.error).toContain('duration');
        }
      });
    });

    describe('with mutually exclusive fields', () => {
      it('should return error when both target and duration are provided', () => {
        const yaml = `
title: "Invalid Timer"
target: "2026-12-25"
duration: "30m"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error).toContain('target');
          expect(result.error).toContain('duration');
          expect(result.error.toLowerCase()).toContain('mutually exclusive');
        }
      });
    });

    describe('with invalid values', () => {
      it('should return error for invalid target date format', () => {
        const yaml = `
title: "Bad Date"
target: "not-a-date"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error.toLowerCase()).toContain('invalid');
        }
      });

      it('should return error for invalid duration format', () => {
        const yaml = `
title: "Bad Duration"
duration: "invalid"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error.toLowerCase()).toContain('invalid');
        }
      });

      it('should return error for empty title', () => {
        const yaml = `
title: ""
target: "2026-12-25"
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error).toContain('title');
        }
      });
    });

    describe('with invalid YAML syntax', () => {
      it('should return error for malformed YAML', () => {
        const yaml = `
title: "Test
target: broken
`;
        const result = parseConfig(yaml);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error.toLowerCase()).toContain('invalid');
        }
      });

      it('should return error for empty input', () => {
        const result = parseConfig('');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error.toLowerCase()).toContain('empty');
        }
      });

      it('should return error for whitespace only input', () => {
        const result = parseConfig('   \n   ');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.error.toLowerCase()).toContain('empty');
        }
      });
    });
  });
});
