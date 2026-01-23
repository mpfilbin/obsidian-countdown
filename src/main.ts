import { Plugin } from 'obsidian';
import { parseConfig } from './parsers/config-parser';
import { renderTimer, renderError, ActiveTimer } from './components/timer-renderer';

export default class CountdownPlugin extends Plugin {
	/** Track active timers for cleanup */
	private activeTimers: ActiveTimer[] = [];

	async onload() {
		// Register the countdown code block processor
		this.registerMarkdownCodeBlockProcessor('countdown', (source, el) => {
			this.processCountdownBlock(source, el);
		});
	}

	onunload() {
		// Clean up all active timers
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
		// Parse and validate the configuration
		const result = parseConfig(source);

		if (!result.valid) {
			renderError(el, result.error);
			return;
		}

		// Render the timer
		const timer = renderTimer(el, result.config);

		// Track the timer for cleanup
		this.activeTimers.push(timer);
	}
}
