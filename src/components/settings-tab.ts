import { App, PluginSettingTab, Setting } from 'obsidian';
import CountdownPlugin from '../main';

interface Example {
  title: string;
  description: string;
  code: string;
}

const EXAMPLES: Example[] = [
  {
    title: 'Count down to a date',
    description: 'Basic countdown to a specific date using ISO 8601 format.',
    code: `\`\`\`countdown
title: New Year Countdown
target: 2026-01-01
\`\`\``,
  },
  {
    title: 'Natural language date',
    description: 'Use natural language for the target date.',
    code: `\`\`\`countdown
title: Project Deadline
target: March 15, 2026
\`\`\``,
  },
  {
    title: 'Date with time',
    description: 'Include a specific time in your countdown.',
    code: `\`\`\`countdown
title: Meeting Starts
target: December 25, 2026 at 10:30
\`\`\``,
  },
  {
    title: 'Duration timer',
    description:
      'Count down from a duration instead of to a date. Press Start to begin; the start time is saved in the block. Shows a notification when complete.',
    code: `\`\`\`countdown
title: Pomodoro
duration: 25m
\`\`\``,
  },
  {
    title: 'Complex duration',
    description: 'Combine days, hours, minutes, and seconds.',
    code: `\`\`\`countdown
title: Long Timer
duration: 2d5h30m45s
\`\`\``,
  },
  {
    title: 'Custom format',
    description:
      'Use strftime-style format codes: %d (days), %H (hours), %M (minutes), %S (seconds).',
    code: `\`\`\`countdown
title: Conference Countdown
target: 2026-06-01T09:00:00
format: "%d days %H:%M:%S"
\`\`\``,
  },
  {
    title: 'Minutes and seconds only',
    description: 'Minimal format for short timers.',
    code: `\`\`\`countdown
title: Quick Timer
duration: 5m30s
format: "%M:%S"
\`\`\``,
  },
];

export class CountdownSettingTab extends PluginSettingTab {
  plugin: CountdownPlugin;

  constructor(app: App, plugin: CountdownPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h1', { text: 'Countdown Timer' });

    containerEl.createEl('p', {
      text: 'Create countdown timers in your notes using countdown code blocks with YAML configuration.',
    });

    containerEl.createEl('h2', { text: 'Examples' });

    containerEl.createEl('p', {
      text: 'Copy any of these examples into your notes to get started:',
    });

    for (const example of EXAMPLES) {
      new Setting(containerEl).setName(example.title).setDesc(example.description);

      const codeEl = containerEl.createEl('pre', { cls: 'countdown-example-code' });
      codeEl.createEl('code', { text: example.code });
    }

    containerEl.createEl('h2', { text: 'Configuration Reference' });

    const table = containerEl.createEl('table', { cls: 'countdown-settings-table' });

    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    headerRow.createEl('th', { text: 'Option' });
    headerRow.createEl('th', { text: 'Required' });
    headerRow.createEl('th', { text: 'Description' });

    const tbody = table.createEl('tbody');

    const options = [
      { name: 'title', required: 'Yes', desc: 'Display title for the countdown' },
      {
        name: 'target',
        required: 'Either target or duration',
        desc: 'Target date/time to count down to',
      },
      {
        name: 'duration',
        required: 'Either target or duration',
        desc: 'Duration to count down (e.g., 1h30m)',
      },
      {
        name: 'started',
        required: 'No',
        desc: 'Start time of a duration timer (written by the Start button)',
      },
      { name: 'format', required: 'No', desc: 'Custom strftime-style format string' },
    ];

    for (const opt of options) {
      const row = tbody.createEl('tr');
      row.createEl('td', { text: opt.name, cls: 'countdown-option-name' });
      row.createEl('td', { text: opt.required });
      row.createEl('td', { text: opt.desc });
    }

    containerEl.createEl('h3', { text: 'Format Codes' });

    const formatTable = containerEl.createEl('table', { cls: 'countdown-settings-table' });

    const formatThead = formatTable.createEl('thead');
    const formatHeaderRow = formatThead.createEl('tr');
    formatHeaderRow.createEl('th', { text: 'Code' });
    formatHeaderRow.createEl('th', { text: 'Description' });

    const formatTbody = formatTable.createEl('tbody');

    const formatCodes = [
      { code: '%d', desc: 'Days (not zero-padded)' },
      { code: '%H', desc: 'Hours (zero-padded to 2 digits)' },
      { code: '%M', desc: 'Minutes (zero-padded to 2 digits)' },
      { code: '%S', desc: 'Seconds (zero-padded to 2 digits)' },
      { code: '%%', desc: 'Literal percent sign' },
    ];

    for (const fmt of formatCodes) {
      const row = formatTbody.createEl('tr');
      row.createEl('td', { text: fmt.code, cls: 'countdown-option-name' });
      row.createEl('td', { text: fmt.desc });
    }

    containerEl.createEl('p', {
      text: 'Note: If %d is not in the format, hours will include total hours (days × 24 + hours).',
      cls: 'countdown-settings-note',
    });
  }
}
