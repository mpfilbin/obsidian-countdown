import { CountdownRenderChild } from '../../src/components/countdown-render-child';
import { renderTimer } from '../../src/components/timer-renderer';
import { CountdownConfig } from '../../src/types';

jest.mock('../../src/components/timer-renderer');

const config: CountdownConfig = { title: 'Test', duration: 60000 };

describe('CountdownRenderChild', () => {
  const container = {} as HTMLElement;
  const stop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (renderTimer as jest.Mock).mockReturnValue({ stop });
  });

  it('renders the timer when loaded, not when constructed', () => {
    const child = new CountdownRenderChild(container, config);
    expect(renderTimer).not.toHaveBeenCalled();

    child.onload();
    expect(renderTimer).toHaveBeenCalledWith(container, config, undefined);
  });

  it('passes persistence actions through to the renderer', () => {
    const actions = { onStart: jest.fn(), onReset: jest.fn() };
    new CountdownRenderChild(container, config, actions).onload();
    expect(renderTimer).toHaveBeenCalledWith(container, config, actions);
  });

  it('stops the timer when unloaded', () => {
    const child = new CountdownRenderChild(container, config);
    child.onload();
    child.onunload();

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('does not stop twice if unloaded repeatedly', () => {
    const child = new CountdownRenderChild(container, config);
    child.onload();
    child.onunload();
    child.onunload();

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('tolerates unload before load', () => {
    const child = new CountdownRenderChild(container, config);
    expect(() => child.onunload()).not.toThrow();
  });
});
