import { renderTimer, renderError } from '../../src/components/timer-renderer';
import { CountdownConfig } from '../../src/types';

// Mock window.setInterval and window.clearInterval
const mockIntervalId = 12345;
(global as unknown as { window: typeof globalThis }).window = {
  ...global,
  setInterval: jest.fn(() => mockIntervalId),
  clearInterval: jest.fn(),
} as unknown as typeof globalThis;

/**
 * Creates a mock HTMLElement that mimics Obsidian's extended HTMLElement
 */
function createMockContainer(): HTMLElement & {
  children: Array<{ cls: string; text: string }>;
  classes: string[];
} {
  const children: Array<{ cls: string; text: string }> = [];
  const classes: string[] = [];

  const container = {
    children,
    classes,
    empty: jest.fn(() => {
      children.length = 0;
    }),
    addClass: jest.fn((cls: string) => {
      classes.push(cls);
    }),
    createEl: jest.fn((tag: string, options?: { cls?: string; text?: string }) => {
      const child = {
        cls: options?.cls || '',
        text: options?.text || '',
        style: { display: '' },
        setText: jest.fn((text: string) => {
          child.text = text;
        }),
      };
      children.push(child);
      return child;
    }),
  };

  return container as unknown as HTMLElement & {
    children: Array<{ cls: string; text: string }>;
    classes: string[];
  };
}

describe('TimerRenderer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('renderTimer', () => {
    describe('title rendering', () => {
      it('should render the title from the config', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'My Countdown',
          target: new Date('2025-12-31T00:00:00Z'),
        };

        renderTimer(container, config);

        // Find the title element
        const titleElement = container.children.find(
          (child) => child.cls === 'countdown-timer-title'
        );
        expect(titleElement).toBeDefined();
        expect(titleElement?.text).toBe('My Countdown');
      });

      it('should render the title before the display', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'Test Timer',
          duration: 60000, // 1 minute
        };

        renderTimer(container, config);

        // Title should be the first child element
        expect(container.children[0]?.cls).toBe('countdown-timer-title');
        expect(container.children[0]?.text).toBe('Test Timer');
      });
    });

    describe('display rendering', () => {
      it('should render the countdown display element', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'Test',
          target: new Date('2025-12-31T00:00:00Z'),
        };

        renderTimer(container, config);

        const displayElement = container.children.find(
          (child) => child.cls === 'countdown-timer-display'
        );
        expect(displayElement).toBeDefined();
      });

      it('should render the status element', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'Test',
          target: new Date('2025-12-31T00:00:00Z'),
        };

        renderTimer(container, config);

        const statusElement = container.children.find(
          (child) => child.cls === 'countdown-timer-status'
        );
        expect(statusElement).toBeDefined();
      });
    });

    describe('cleanup', () => {
      it('should return an ActiveTimer with a stop function', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'Test',
          target: new Date('2025-12-31T00:00:00Z'),
        };

        const timer = renderTimer(container, config);

        expect(timer).toHaveProperty('stop');
        expect(typeof timer.stop).toBe('function');
      });
    });
  });

  describe('renderError', () => {
    it('should render an error message', () => {
      const container = createMockContainer();

      renderError(container, 'Something went wrong');

      expect(container.classes).toContain('countdown-timer-error');
      expect(container.children.length).toBe(1);
      expect(container.children[0].text).toContain('Something went wrong');
    });
  });
});
