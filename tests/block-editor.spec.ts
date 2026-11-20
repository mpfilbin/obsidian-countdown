import { setStartedInBlock } from '../src/block-editor';

const ISO = '2026-11-20T12:00:00.000Z';

function note(body: string[], eol = '\n'): string {
  return ['# Note', '```countdown', ...body, '```', 'after'].join(eol);
}

describe('setStartedInBlock', () => {
  it('appends started after the last content line', () => {
    const content = note(['title: Pomodoro', 'duration: 25m']);
    const out = setStartedInBlock(content, 1, 4, 'title: Pomodoro\nduration: 25m', ISO);
    expect(out).toBe(note(['title: Pomodoro', 'duration: 25m', `started: ${ISO}`]));
  });

  it('replaces an existing started line', () => {
    const body = ['title: T', 'started: 2020-01-01T00:00:00Z', 'duration: 5m'];
    const out = setStartedInBlock(note(body), 1, 5, body.join('\n'), ISO);
    expect(out).toBe(note(['title: T', 'duration: 5m', `started: ${ISO}`]));
  });

  it('removes started when passed null', () => {
    const body = ['title: T', 'duration: 5m', `started: ${ISO}`];
    const out = setStartedInBlock(note(body), 1, 5, body.join('\n'), null);
    expect(out).toBe(note(['title: T', 'duration: 5m']));
  });

  it('keeps trailing blank lines after the inserted line', () => {
    const body = ['title: T', 'duration: 5m', ''];
    const out = setStartedInBlock(note(body), 1, 5, 'title: T\nduration: 5m', ISO);
    expect(out).toBe(note(['title: T', 'duration: 5m', `started: ${ISO}`, '']));
  });

  it('preserves CRLF line endings', () => {
    const body = ['title: T', 'duration: 5m'];
    const out = setStartedInBlock(note(body, '\r\n'), 1, 4, body.join('\n'), ISO);
    expect(out).toBe(note(['title: T', 'duration: 5m', `started: ${ISO}`], '\r\n'));
  });

  it('works with tilde fences and longer fences', () => {
    const content = ['~~~~countdown', 'title: T', 'duration: 5m', '~~~~'].join('\n');
    const out = setStartedInBlock(content, 0, 3, 'title: T\nduration: 5m', ISO);
    expect(out).toContain(`started: ${ISO}`);
  });

  it('returns null when the opening line is not a countdown fence', () => {
    const content = note(['title: T', 'duration: 5m']);
    expect(setStartedInBlock(content, 0, 4, 'title: T\nduration: 5m', ISO)).toBeNull();
  });

  it('returns null when the block body no longer matches what was rendered', () => {
    const content = note(['title: Edited', 'duration: 5m']);
    expect(setStartedInBlock(content, 1, 4, 'title: T\nduration: 5m', ISO)).toBeNull();
  });

  it('returns null for out-of-range or inverted line numbers', () => {
    const content = note(['title: T', 'duration: 5m']);
    expect(setStartedInBlock(content, 99, 100, 'x', ISO)).toBeNull();
    expect(setStartedInBlock(content, 1, 1, 'x', ISO)).toBeNull();
    expect(setStartedInBlock(content, 1, 99, 'x', ISO)).toBeNull();
  });

  it('returns null for a block nested in a quote', () => {
    const content = ['> ```countdown', '> title: T', '> duration: 5m', '> ```'].join('\n');
    expect(setStartedInBlock(content, 0, 3, 'title: T\nduration: 5m', ISO)).toBeNull();
  });
});
