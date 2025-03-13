import '@testing-library/jest-dom';
import * as React from 'react';
import { useRef, useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useActiveElement } from '../src/hooks/use-active-element';

const UI = () => {
  const initFocus = useRef<HTMLButtonElement>(null);
  const { activeElement, previousActiveElement } = useActiveElement();

  useEffect(() => initFocus.current?.focus(), []);

  return (
    <React.Fragment>
      { /* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <button ref={initFocus} type="button" id="default-focus">First</button>
      <button type="button" id="unfocused">Second</button>
      <button type="button" id="never">NotIt</button>
      <p id="current">{activeElement?.id}</p>
      <p id="prev">{previousActiveElement?.id}</p>
    </React.Fragment>
  );
};

describe('useActiveElement', () => {
  const getCurrent = () => document.querySelector('#current');
  const getPrev = () => document.querySelector('#prev');

  test('Hook init returns proper data', () => {
    render(<UI />);

    expect(getCurrent()?.innerHTML).toBe('default-focus');
    expect(getPrev()?.innerHTML).toBe('');
  });

  test('Hook returns proper data on focus change', async () => {
    render(<UI />);

    userEvent.click(document.querySelector('#unfocused') as Element);
    await waitFor(() => {
      expect(getCurrent()?.innerHTML).toBe('unfocused');
      expect(getPrev()?.innerHTML).toBe('default-focus');
    });
  });
});
