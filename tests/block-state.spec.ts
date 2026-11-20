import { Notice, TFile } from 'obsidian';
import { updateStartedInBlock } from '../src/block-state';

jest.mock('obsidian', () => {
  const actual = jest.requireActual('../tests/__mocks__/obsidian');
  return { ...actual, Notice: jest.fn() };
});

const content = ['```countdown', 'title: T', 'duration: 5m', '```'].join('\n');
const source = 'title: T\nduration: 5m';

function setup(opts: { info?: boolean; file?: boolean; data?: string; throws?: boolean } = {}) {
  const file = new TFile();
  let stored = opts.data ?? content;
  const app = {
    vault: {
      getAbstractFileByPath: jest.fn(() => (opts.file === false ? null : file)),
      process: jest.fn(async (_f: TFile, fn: (d: string) => string) => {
        if (opts.throws) throw new Error('boom');
        stored = fn(stored);
        return stored;
      }),
    },
  };
  const ctx = {
    sourcePath: 'a.md',
    getSectionInfo: jest.fn(() =>
      opts.info === false
        ? null
        : { text: stored, lineStart: 0, lineEnd: stored.split('\n').lastIndexOf('```') }
    ),
  };
  return { app, ctx, read: () => stored };
}

describe('updateStartedInBlock', () => {
  beforeEach(() => jest.clearAllMocks());

  it('writes the started line and reports success', async () => {
    const { app, ctx, read } = setup();
    const ok = await updateStartedInBlock(
      app as never,
      ctx as never,
      {} as HTMLElement,
      source,
      new Date('2026-11-20T12:00:00Z')
    );
    expect(ok).toBe(true);
    expect(read()).toContain('started: 2026-11-20T12:00:00.000Z');
    expect(Notice).not.toHaveBeenCalled();
  });

  it('removes the line when started is null', async () => {
    const withStarted = content.replace(
      'duration: 5m',
      'duration: 5m\nstarted: 2026-11-20T12:00:00.000Z'
    );
    const { app, ctx, read } = setup({ data: withStarted });
    const ok = await updateStartedInBlock(
      app as never,
      ctx as never,
      {} as HTMLElement,
      source + '\nstarted: 2026-11-20T12:00:00.000Z',
      null
    );
    expect(ok).toBe(true);
    expect(read()).toBe(content);
  });

  it.each([
    ['section info is missing', { info: false }],
    ['the file cannot be found', { file: false }],
  ])('notifies and returns false when %s', async (_n, opts) => {
    const { app, ctx } = setup(opts);
    const ok = await updateStartedInBlock(
      app as never,
      ctx as never,
      {} as HTMLElement,
      source,
      new Date()
    );
    expect(ok).toBe(false);
    expect(Notice).toHaveBeenCalledTimes(1);
  });

  it('leaves the note untouched and notifies when the block changed', async () => {
    const { app, ctx, read } = setup();
    const ok = await updateStartedInBlock(
      app as never,
      ctx as never,
      {} as HTMLElement,
      'stale',
      new Date()
    );
    expect(ok).toBe(false);
    expect(read()).toBe(content);
    expect(Notice).toHaveBeenCalledTimes(1);
  });

  it('returns false when the vault write throws', async () => {
    const { app, ctx } = setup({ throws: true });
    const ok = await updateStartedInBlock(
      app as never,
      ctx as never,
      {} as HTMLElement,
      source,
      new Date()
    );
    expect(ok).toBe(false);
    expect(Notice).toHaveBeenCalledTimes(1);
  });
});
