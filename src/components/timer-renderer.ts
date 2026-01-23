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
  // Clear any existing content
  container.empty();
  container.addClass('countdown-timer');

  // Create display element
  const displayEl = container.createEl('div', {
    cls: 'countdown-timer-display',
  });

  // Create status element (hidden initially, shown when complete)
  const statusEl = container.createEl('div', {
    cls: 'countdown-timer-status',
  });
  statusEl.style.display = 'none';

  // Track if this is a duration timer (for notification on complete)
  const isDurationTimer = config.duration !== undefined;

  // Calculate the target time
  let targetTime: number;
  if (config.target) {
    targetTime = config.target.getTime();
  } else if (config.duration) {
    // Duration timer starts from now
    targetTime = Date.now() + config.duration;
  } else {
    // Should not happen due to validation, but handle gracefully
    displayEl.setText('Invalid configuration');
    return { stop: () => {} };
  }

  // Track if timer has completed (to avoid multiple notifications)
  let hasCompleted = false;

  /**
   * Updates the timer display
   */
  function updateDisplay(): void {
    const now = Date.now();
    const remaining = targetTime - now;

    // Format and display the time (formatTimeRemaining handles negative values)
    const formatted = formatTimeRemaining(remaining, config.format);
    displayEl.setText(formatted);

    if (remaining <= 0) {
      // Timer has expired - show status and add expired class
      container.addClass('countdown-timer-expired');
      statusEl.setText('complete');
      statusEl.style.display = '';

      if (!hasCompleted) {
        hasCompleted = true;

        // Show notification only for duration timers
        if (isDurationTimer) {
          new Notice(`Timer "${config.title}" has completed!`);
        }
      }
    }
  }

  // Initial update
  updateDisplay();

  // Set up interval for live updates (every second)
  const intervalId = window.setInterval(updateDisplay, 1000);

  // Return cleanup function
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
