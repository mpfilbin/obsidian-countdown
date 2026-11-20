const OPENING_FENCE = /^\s*(`{3,}|~{3,})\s*countdown\b/;
const STARTED_LINE = /^\s*started\s*:/;

/**
 * Sets or removes the `started:` line inside a countdown code block.
 *
 * Pure text transformation so it can be applied atomically via `vault.process`.
 * Returns null (leaving the caller to abort) when the lines at the given
 * range are not the expected block, e.g. because the note changed since it
 * was rendered or the block is nested inside a quote/callout.
 *
 * @param content - Full text of the note
 * @param lineStart - 0-based line of the opening fence
 * @param lineEnd - 0-based line of the closing fence
 * @param source - Block body as given to the code block processor
 * @param startedIso - ISO timestamp to write, or null to remove the line
 */
export function setStartedInBlock(
  content: string,
  lineStart: number,
  lineEnd: number,
  source: string,
  startedIso: string | null
): string | null {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);

  const opening = lines[lineStart];
  if (opening === undefined || !OPENING_FENCE.test(opening) || lineEnd <= lineStart) {
    return null;
  }
  if (lines[lineEnd] === undefined) {
    return null;
  }

  const body = lines.slice(lineStart + 1, lineEnd);
  if (body.join('\n').trim() !== source.trim()) {
    return null;
  }

  const kept = body.filter((line) => !STARTED_LINE.test(line));

  if (startedIso !== null) {
    let lastContent = -1;
    kept.forEach((line, i) => {
      if (line.trim() !== '') lastContent = i;
    });
    kept.splice(lastContent + 1, 0, `started: ${startedIso}`);
  }

  return [...lines.slice(0, lineStart + 1), ...kept, ...lines.slice(lineEnd)].join(eol);
}
