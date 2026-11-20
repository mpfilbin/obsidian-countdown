import { MarkdownRenderChild } from 'obsidian';
import { CountdownConfig } from '../types';
import { renderTimer, ActiveTimer, TimerActions } from './timer-renderer';

/**
 * Ties a rendered countdown to the lifecycle of its code block.
 *
 * Obsidian unloads render children when a block is re-rendered or removed
 * (view mode switch, note edit, note closed, plugin disabled), so the timer
 * is stopped exactly when its DOM goes away.
 */
export class CountdownRenderChild extends MarkdownRenderChild {
  private timer: ActiveTimer | null = null;

  constructor(
    containerEl: HTMLElement,
    private readonly config: CountdownConfig,
    private readonly actions?: TimerActions
  ) {
    super(containerEl);
  }

  onload(): void {
    this.timer = renderTimer(this.containerEl, this.config, this.actions);
  }

  onunload(): void {
    this.timer?.stop();
    this.timer = null;
  }
}
