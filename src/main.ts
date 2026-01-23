import { Plugin } from 'obsidian';
import { parseConfig } from './parsers/config-parser';
import { renderTimer, renderError, ActiveTimer } from './components/timer-renderer';

export default class CountdownPlugin extends Plugin {
  private activeTimers: ActiveTimer[] = [];

  async onload() {
    this.registerMarkdownCodeBlockProcessor('countdown', (source, el) => {
      this.processCountdownBlock(source, el);
    });
  }

  onunload() {
    for (const timer of this.activeTimers) {
      timer.stop();
    }
    this.activeTimers = [];
  }

  /**
   * Processes a countdown code block
   *
   * @param source - The YAML content inside the code block
   * @param el - The container element to render into
   */
  private processCountdownBlock(source: string, el: HTMLElement): void {
    const result = parseConfig(source);

    if (!result.valid) {
      renderError(el, result.error);
      return;
    }

    const timer = renderTimer(el, result.config);

    // Track for cleanup when plugin unloads
    this.activeTimers.push(timer);
  }
}
