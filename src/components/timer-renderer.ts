import { Notice } from 'obsidian';
import { CountdownConfig } from '../types';
import { formatTimeRemaining } from '../formatters/timer-formatter';

/**
 * Represents an active timer that can be cleaned up
 */
export interface ActiveTimer {
  /** Stop the timer and clean up resources */
  stop: () => void;
}

/**
 * Renders a countdown timer into a container element
 *
 * @param container - The HTML element to render into
 * @param config - The countdown configuration
 * @returns An ActiveTimer that can be used to stop the timer
 */
export function renderTimer(container: HTMLElement, config: CountdownConfig): ActiveTimer {
  container.empty();
  container.addClass('countdown-timer');

  container.createEl('div', {
    cls: 'countdown-timer-title',
    text: config.title,
  });

  const displayEl = container.createEl('div', {
    cls: 'countdown-timer-display',
  });

  const statusEl = container.createEl('div', {
    cls: 'countdown-timer-status',
  });
  statusEl.style.display = 'none';

  // Notification only shown for duration timers, not target date timers
  const isDurationTimer = config.duration !== undefined;

  let targetTime: number;
  if (config.target) {
    targetTime = config.target.getTime();
  } else if (config.duration) {
    targetTime = Date.now() + config.duration;
  } else {
    // Should not happen due to validation, but handle gracefully
    displayEl.setText('Invalid configuration');
    return { stop: () => {} };
  }

  // Prevents multiple notifications when updateDisplay is called repeatedly
  let hasCompleted = false;

  /**
   * Updates the timer display
   */
  function updateDisplay(): void {
    const now = Date.now();
    const remaining = targetTime - now;

    const formatted = formatTimeRemaining(remaining, config.format);
    displayEl.setText(formatted);

    if (remaining <= 0) {
      container.addClass('countdown-timer-expired');
      statusEl.setText('complete');
      statusEl.style.display = '';

      if (!hasCompleted) {
        hasCompleted = true;

        if (isDurationTimer) {
          new Notice(`Timer "${config.title}" has completed!`);
        }
      }
    }
  }

  updateDisplay();

  const intervalId = window.setInterval(updateDisplay, 1000);

  return {
    stop: () => {
      window.clearInterval(intervalId);
    },
  };
}

/**
 * Renders an error message into a container element
 *
 * @param container - The HTML element to render into
 * @param error - The error message to display
 */
export function renderError(container: HTMLElement, error: string): void {
  container.empty();
  container.addClass('countdown-timer-error');
  container.createEl('div', {
    text: `⚠️ Configuration Error: ${error}`,
  });
}
