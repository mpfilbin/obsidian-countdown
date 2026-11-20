import { App, MarkdownPostProcessorContext, Notice, TFile } from 'obsidian';
import { setStartedInBlock } from './block-editor';

/**
 * Persists (or clears) a duration timer's start time in its code block.
 *
 * @returns true if the note was updated, false if it could not be (a Notice explains)
 */
export async function updateStartedInBlock(
  app: App,
  ctx: MarkdownPostProcessorContext,
  el: HTMLElement,
  source: string,
  started: Date | null
): Promise<boolean> {
  const info = ctx.getSectionInfo(el);
  const file = app.vault.getAbstractFileByPath(ctx.sourcePath);

  if (!info || !(file instanceof TFile)) {
    new Notice('Countdown: could not locate this timer in the note.');
    return false;
  }

  let updated = false;
  try {
    await app.vault.process(file, (data) => {
      const next = setStartedInBlock(
        data,
        info.lineStart,
        info.lineEnd,
        source,
        started ? started.toISOString() : null
      );
      if (next === null) return data;
      updated = true;
      return next;
    });
  } catch {
    updated = false;
  }

  if (!updated) {
    new Notice('Countdown: could not update the timer. Try reopening the note.');
  }
  return updated;
}
