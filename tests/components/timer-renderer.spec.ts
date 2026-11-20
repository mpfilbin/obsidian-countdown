import { renderTimer, renderError, TimerActions } from '../../src/components/timer-renderer';
import { CountdownConfig } from '../../src/types';
import { Notice } from 'obsidian';

jest.mock('obsidian', () => {
  const actual = jest.requireActual('../__mocks__/obsidian');
  return { ...actual, Notice: jest.fn() };
});

// Mock window.setInterval and window.clearInterval
const mockIntervalId = 12345;
const mockSetInterval = jest.fn<number, [() => void, number?]>(() => mockIntervalId);
const mockClearInterval = jest.fn();
(global as unknown as { window: typeof globalThis }).window = {
  ...global,
  setInterval: mockSetInterval,
  clearInterval: mockClearInterval,
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
    removeClass: jest.fn((cls: string) => {
      const i = classes.indexOf(cls);
      if (i >= 0) classes.splice(i, 1);
    }),
    createEl: jest.fn((tag: string, options?: { cls?: string; text?: string }) => {
      const child = {
        cls: options?.cls || '',
        text: options?.text || '',
        style: { display: '' },
        handlers: {} as Record<string, () => void>,
        addEventListener: jest.fn((evt: string, cb: () => void) => {
          child.handlers[evt] = cb;
        }),
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
    jest.clearAllMocks();
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

    describe('target date display', () => {
      it('should render the target date element when target is provided', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'New Year Countdown',
          target: new Date('2025-12-31T00:00:00Z'),
        };

        renderTimer(container, config);

        const targetDateElement = container.children.find(
          (child) => child.cls === 'countdown-timer-target'
        );
        expect(targetDateElement).toBeDefined();
      });

      it('should display the target date in a readable format', () => {
        const container = createMockContainer();
        // Use midday to avoid timezone edge cases
        const config: CountdownConfig = {
          title: 'New Year Countdown',
          target: new Date('2025-12-31T12:00:00Z'),
        };

        renderTimer(container, config);

        const targetDateElement = container.children.find(
          (child) => child.cls === 'countdown-timer-target'
        );
        // Should contain the date in some readable format (month name and year)
        expect(targetDateElement?.text).toContain('December');
        expect(targetDateElement?.text).toContain('2025');
      });

      it('should not render target date element for duration timers', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'Quick Timer',
          duration: 60000, // 1 minute
        };

        renderTimer(container, config);

        const targetDateElement = container.children.find(
          (child) => child.cls === 'countdown-timer-target'
        );
        expect(targetDateElement).toBeUndefined();
      });

      it('should render the target date after the status element', () => {
        const container = createMockContainer();
        const config: CountdownConfig = {
          title: 'Test Timer',
          target: new Date('2025-12-31T00:00:00Z'),
        };

        renderTimer(container, config);

        // Order should be: title, display, status, target
        const classes = container.children.map((child) => child.cls);
        const statusIndex = classes.indexOf('countdown-timer-status');
        const targetIndex = classes.indexOf('countdown-timer-target');
        expect(targetIndex).toBeGreaterThan(statusIndex);
      });
    });
  });

  describe('duration timers with persistence', () => {
    type Child = { cls: string; text: string; handlers: Record<string, () => void> };
    const find = (c: HTMLElement, cls: string): Child =>
      (c as unknown as { children: Child[] }).children.find((x) => x.cls === cls) as Child;
    const flush = () => Promise.resolve().then(() => Promise.resolve());

    function makeActions(ok = true): TimerActions {
      return {
        onStart: jest.fn(() => Promise.resolve(ok)),
        onReset: jest.fn(() => Promise.resolve(ok)),
      };
    }

    it('shows the full duration, a Start button and no interval until started', () => {
      const container = createMockContainer();
      renderTimer(container, { title: 'T', duration: 60000 }, makeActions());

      expect(find(container, 'countdown-timer-display').text).toBe('0d 00h 01m 00s');
      expect(find(container, 'countdown-timer-button').text).toBe('Start');
      expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it('persists the start time, begins ticking and switches to Reset on click', async () => {
      const container = createMockContainer();
      const actions = makeActions();
      renderTimer(container, { title: 'T', duration: 60000 }, actions);

      find(container, 'countdown-timer-button').handlers.click?.();
      await flush();

      expect(actions.onStart).toHaveBeenCalledWith(new Date('2025-01-01T12:00:00Z'));
      expect(mockSetInterval).toHaveBeenCalledTimes(1);
      expect(find(container, 'countdown-timer-button').text).toBe('Reset');
    });

    it('does not start if persisting fails', async () => {
      const container = createMockContainer();
      renderTimer(container, { title: 'T', duration: 60000 }, makeActions(false));

      find(container, 'countdown-timer-button').handlers.click?.();
      await flush();

      expect(mockSetInterval).not.toHaveBeenCalled();
      expect(find(container, 'countdown-timer-button').text).toBe('Start');
    });

    it('resumes from the persisted start time instead of restarting', () => {
      const container = createMockContainer();
      const started = new Date('2025-01-01T11:59:00Z'); // 60s ago
      renderTimer(container, { title: 'T', duration: 90000, started }, makeActions());

      expect(find(container, 'countdown-timer-display').text).toBe('0d 00h 00m 30s');
      expect(find(container, 'countdown-timer-button').text).toBe('Reset');
      expect(mockSetInterval).toHaveBeenCalledTimes(1);
    });

    it('renders an already-finished timer as complete without a Notice or interval', () => {
      const container = createMockContainer();
      const started = new Date('2025-01-01T10:00:00Z');
      renderTimer(container, { title: 'T', duration: 60000, started }, makeActions());

      expect(find(container, 'countdown-timer-status').text).toBe('complete');
      expect(Notice).not.toHaveBeenCalled();
      expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it('notifies once and stops ticking when a running timer completes', () => {
      const container = createMockContainer();
      const started = new Date('2025-01-01T11:59:30Z');
      renderTimer(container, { title: 'T', duration: 60000, started }, makeActions());
      const tick = mockSetInterval.mock.calls[0]?.[0] as () => void;

      jest.setSystemTime(new Date('2025-01-01T12:00:31Z'));
      tick();
      tick();

      expect(Notice).toHaveBeenCalledTimes(1);
      expect(mockClearInterval).toHaveBeenCalled();
    });

    it('resets back to the idle state and clears the persisted start', async () => {
      const container = createMockContainer();
      const actions = makeActions();
      const started = new Date('2025-01-01T10:00:00Z');
      renderTimer(container, { title: 'T', duration: 60000, started }, actions);

      find(container, 'countdown-timer-button').handlers.click?.();
      await flush();

      expect(actions.onReset).toHaveBeenCalled();
      expect(find(container, 'countdown-timer-button').text).toBe('Start');
      expect(find(container, 'countdown-timer-display').text).toBe('0d 00h 01m 00s');
      expect(find(container, 'countdown-timer-status').style.display).toBe('none');
    });

    it('does not start ticking if unloaded while the start was being persisted', async () => {
      const container = createMockContainer();
      const timer = renderTimer(container, { title: 'T', duration: 60000 }, makeActions());

      find(container, 'countdown-timer-button').handlers.click?.();
      timer.stop();
      await flush();

      expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it('ignores a second click while the first is still pending', async () => {
      const container = createMockContainer();
      const actions = makeActions();
      renderTimer(container, { title: 'T', duration: 60000 }, actions);
      const btn = find(container, 'countdown-timer-button');

      btn.handlers.click?.();
      btn.handlers.click?.();
      await flush();

      expect(actions.onStart).toHaveBeenCalledTimes(1);
    });

    it('has no button for target timers and still starts immediately without actions', () => {
      const target = createMockContainer();
      renderTimer(target, { title: 'T', target: new Date('2026-01-01T00:00:00Z') }, makeActions());
      expect(find(target, 'countdown-timer-button')).toBeUndefined();

      mockSetInterval.mockClear();
      const legacy = createMockContainer();
      renderTimer(legacy, { title: 'T', duration: 60000 });
      expect(find(legacy, 'countdown-timer-button')).toBeUndefined();
      expect(mockSetInterval).toHaveBeenCalledTimes(1);
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
