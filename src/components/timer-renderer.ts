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
 * Persistence hooks for duration timers. Each resolves true on success.
 * Supplying them enables the Start/Reset button.
 */
export interface TimerActions {
  /** Persist the moment the timer was started */
  onStart: (startedAt: Date) => Promise<boolean>;
  /** Clear the persisted start time */
  onReset: () => Promise<boolean>;
}

/**
 * Renders a countdown timer into a container element
 *
 * Duration timers with `actions` wait for the user to press Start and then
 * count down from the persisted start time, so re-rendering the block never
 * restarts them. Without `actions` a duration timer starts when rendered.
 *
 * @param container - The HTML element to render into
 * @param config - The countdown configuration
 * @param actions - Optional hooks for persisting start/reset of duration timers
 * @returns An ActiveTimer that can be used to stop the timer
 */
export function renderTimer(
  container: HTMLElement,
  config: CountdownConfig,
  actions?: TimerActions
): ActiveTimer {
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

  if (config.target) {
    const formattedDate = config.target.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    container.createEl('div', {
      cls: 'countdown-timer-target',
      text: formattedDate,
    });
  }

  const duration = config.duration;
  const isDurationTimer = duration !== undefined;

  if (!config.target && !isDurationTimer) {
    // Should not happen due to validation, but handle gracefully
    displayEl.setText('Invalid configuration');
    return { stop: () => {} };
  }

  const usesButton = actions !== undefined && isDurationTimer;
  let startedAt: Date | undefined = config.started;
  if (isDurationTimer && !startedAt && !usesButton) {
    startedAt = new Date();
  }

  let intervalId: number | undefined;
  let stopped = false;
  let busy = false;
  // Notify only for a completion observed while running, never for a timer
  // that had already finished when the note was opened
  let notifyOnComplete = false;

  function remainingMs(): number {
    if (config.target) return config.target.getTime() - Date.now();
    if (duration !== undefined && startedAt) return startedAt.getTime() + duration - Date.now();
    return duration ?? 0;
  }

  function stopTicking(): void {
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  /**
   * Updates the timer display
   */
  function updateDisplay(): void {
    const remaining = remainingMs();
    displayEl.setText(formatTimeRemaining(remaining, config.format));

    if (remaining <= 0) {
      container.addClass('countdown-timer-expired');
      statusEl.setText('complete');
      statusEl.style.display = '';
      stopTicking();

      if (notifyOnComplete) {
        notifyOnComplete = false;
        new Notice(`Timer "${config.title}" has completed!`);
      }
    }
  }

  function startTicking(): void {
    if (stopped) return;
    stopTicking();
    notifyOnComplete = isDurationTimer && remainingMs() > 0;
    updateDisplay();
    if (remainingMs() > 0) {
      intervalId = window.setInterval(updateDisplay, 1000);
    }
  }

  let buttonEl: HTMLButtonElement | undefined;

  function syncButton(): void {
    buttonEl?.setText(startedAt ? 'Reset' : 'Start');
  }

  function showIdle(): void {
    container.removeClass('countdown-timer-expired');
    statusEl.style.display = 'none';
    displayEl.setText(formatTimeRemaining(duration ?? 0, config.format));
    syncButton();
  }

  async function onButtonClick(): Promise<void> {
    if (busy || stopped || !actions) return;
    busy = true;
    try {
      if (startedAt) {
        if (await actions.onReset()) {
          if (stopped) return;
          stopTicking();
          startedAt = undefined;
          notifyOnComplete = false;
          showIdle();
        }
      } else {
        const now = new Date();
        if (await actions.onStart(now)) {
          if (stopped) return;
          startedAt = now;
          syncButton();
          startTicking();
        }
      }
    } finally {
      busy = false;
    }
  }

  if (usesButton) {
    buttonEl = container.createEl('button', { cls: 'countdown-timer-button' });
    buttonEl.addEventListener('click', () => {
      void onButtonClick();
    });
  }

  if (usesButton && !startedAt) {
    showIdle();
  } else {
    syncButton();
    startTicking();
  }

  return {
    stop: () => {
      stopped = true;
      stopTicking();
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
