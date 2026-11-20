import { MarkdownRenderChild } from 'obsidian';
import { CountdownConfig } from '../types';
import { renderTimer, ActiveTimer } from './timer-renderer';

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
    private readonly config: CountdownConfig
  ) {
    super(containerEl);
  }

  onload(): void {
    this.timer = renderTimer(this.containerEl, this.config);
  }

  onunload(): void {
    this.timer?.stop();
    this.timer = null;
  }
}
