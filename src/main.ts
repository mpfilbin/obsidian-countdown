import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { parseConfig } from './parsers/config-parser';
import { updateStartedInBlock } from './block-state';
import { renderError, TimerActions } from './components/timer-renderer';
import { CountdownRenderChild } from './components/countdown-render-child';
import { CountdownSettingTab } from './components/settings-tab';

export default class CountdownPlugin extends Plugin {
  async onload() {
    this.addSettingTab(new CountdownSettingTab(this.app, this));

    this.registerMarkdownCodeBlockProcessor('countdown', (source, el, ctx) => {
      this.processCountdownBlock(source, el, ctx);
    });
  }

  /**
   * Processes a countdown code block
   *
   * @param source - The YAML content inside the code block
   * @param el - The container element to render into
   * @param ctx - Post-processor context used to register the timer's lifecycle
   */
  private processCountdownBlock(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): void {
    const result = parseConfig(source);

    if (!result.valid) {
      renderError(el, result.error);
      return;
    }

    // Duration timers persist their start time in the block so re-renders don't restart them
    const actions: TimerActions | undefined =
      result.config.duration !== undefined
        ? {
            onStart: (startedAt) => updateStartedInBlock(this.app, ctx, el, source, startedAt),
            onReset: () => updateStartedInBlock(this.app, ctx, el, source, null),
          }
        : undefined;

    // The render child stops the timer when Obsidian tears this block down
    ctx.addChild(new CountdownRenderChild(el, result.config, actions));
  }
}
