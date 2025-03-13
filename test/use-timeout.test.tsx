import { useTimeout } from '../src/hooks/use-timeout';
import { renderHook } from '@testing-library/react';

describe('useTimeout hook', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Should set up a timeout with the given delay', () => {
    const cb = jest.fn();
    renderHook(() => useTimeout(cb, 1000));

    expect(cb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(900);
    expect(cb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(101);
    expect(cb).toHaveBeenCalled();
  });

  it('Should clear the timeout when the returned function is called', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useTimeout(cb, 1000));

    expect(cb).not.toHaveBeenCalled();
    result.current();

    jest.advanceTimersByTime(1001);
    expect(cb).not.toHaveBeenCalled();
  });
});