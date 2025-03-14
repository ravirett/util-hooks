import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocalStorage } from '../src/hooks/use-local-storage';

interface TestWrapperProps {
  newValue?: string | (() => string);
  initialValue?: string | (() => string) | null;
  saveInitial?: boolean;
}

describe('Session Storage hook basic functionality', () => {
  const TestWrapper: React.FC<TestWrapperProps> = ({ newValue, initialValue, saveInitial = false }) => {
    const [storedValue, setValue, clearValue] = useLocalStorage('storedValue', initialValue, saveInitial);

    return (
      <div>
        <input type="submit" data-testid="submitButton" onClick={() => setValue(newValue)} />
        <input type="submit" data-testid="clearButton" onClick={() => clearValue()} />
        <div
          data-testid="sessionValue"
        >
          {storedValue}
        </div>
      </div>
    );
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  test('Initial value set, static value', () => {
    render(<TestWrapper initialValue="storedValue" />);
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('storedValue');
  });

  test('Initial value set, function value', () => {
    const value = ' from function'
    render(<TestWrapper initialValue={() => 'storedValue' + value} />);
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('storedValue' + value);
  });

  test('Initial value is corrupted and cannot be parsed', () => {
    const origError = console.error;
    console.error = jest.fn();
    window.localStorage.setItem('storedValue', '[corruptedValue');
    render(<TestWrapper />);
    expect(console.error).toHaveBeenCalledWith(expect.any(SyntaxError));
    console.error = origError;
  })

  test('Set value, static value', async () => {
    render(<TestWrapper newValue="newValue" />);
    const submitButton = screen.getByTestId('submitButton');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('newValue');
    });
  });

  test('Set value, function value', async () => {
    const value = ' from function'
    render(<TestWrapper newValue={() => 'newValue' + value} />);
    const submitButton = screen.getByTestId('submitButton');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('newValue' + value);
    });
  });

  test('Set value handles thrown errors', async () => {
    const origError = console.error;
    console.error = jest.fn();
    const error = new Error('test error');

    render(<TestWrapper newValue={() => { throw error }} />);
    const submitButton = screen.getByTestId('submitButton');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(error);
    });
    console.error = origError;
  });

  describe('Quota exceeded error handling', () => {
    let origError: typeof console.error;
    let origWarn: typeof console.warn;
    let originalSetItem: typeof window.localStorage.setItem;

    beforeEach(() => {
      origError = console.error;
      origWarn = console.warn;
      console.error = jest.fn();
      console.warn = jest.fn();
      originalSetItem = window.localStorage.setItem;
    });

    afterEach(() => {
      console.error = origError;
      console.warn = origWarn;
      window.localStorage.setItem = originalSetItem;
    });

    test('Handles Chrome quota exceeded error (code 22)', async () => {
      // Mock Chrome's quota exceeded error
      const mockError = new DOMException('Quota exceeded', 'QuotaExceededError');
      Object.defineProperty(mockError, 'code', { value: 22 });

      window.localStorage.setItem = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      render(<TestWrapper newValue="valueExceedingQuota" />);
      userEvent.click(screen.getByTestId('submitButton'));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith('localStorage quota exceeded');
      });
    });

    test('Handles Safari quota exceeded error (QuotaExceededError)', async () => {
      // Mock Safari's quota exceeded error
      const mockError = new DOMException('Quota exceeded', 'QuotaExceededError');

      window.localStorage.setItem = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      render(<TestWrapper newValue="valueExceedingQuota" />);
      userEvent.click(screen.getByTestId('submitButton'));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith('localStorage quota exceeded');
      });
    });

    test('Handles Firefox quota exceeded error (NS_ERROR_DOM_QUOTA_REACHED)', async () => {
      // Mock Firefox's alternate quota exceeded error
      const mockError = new DOMException('Quota exceeded', 'NS_ERROR_DOM_QUOTA_REACHED');

      window.localStorage.setItem = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      render(<TestWrapper newValue="valueExceedingQuota" />);
      userEvent.click(screen.getByTestId('submitButton'));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith('localStorage quota exceeded');
      });
    });
  });

  test('clearValue', async () => {
    render(<TestWrapper initialValue="storedValue" />);
    const clearButton = screen.getByTestId('clearButton');
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('storedValue');
    userEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('');
    });
  });

  test('override with saveInitial', () => {
    window.localStorage.setItem('storedValue', 'oldValue');
    render(<TestWrapper newValue="newValue" initialValue="storedValue" saveInitial />);
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('storedValue');
    expect(JSON.parse(window.localStorage.getItem('storedValue') as string)).toBe('storedValue');
  });

  test('omission of saveInitial does not overwrite the existing key value', () => {
    window.localStorage.setItem('storedValue', JSON.stringify('oldValue'));
    render(<TestWrapper newValue="newValue" />);
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('oldValue');
    expect(JSON.parse(window.localStorage.getItem('storedValue') as string)).toBe('oldValue');
  });

  test('saveInitial does not overwrite stored value if supplied default is null', () => {
    window.localStorage.setItem('storedValue', JSON.stringify('oldValue'));
    render(<TestWrapper saveInitial initialValue={null} />);
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('oldValue');
    expect(JSON.parse(window.localStorage.getItem('storedValue') as string)).toBe('oldValue');
  });

  test('saveInitial does not overwrite stored value if supplied default is undefined', () => {
    window.localStorage.setItem('storedValue', JSON.stringify('oldValue'));
    render(<TestWrapper saveInitial />);
    expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('oldValue');
    expect(JSON.parse(window.localStorage.getItem('storedValue') as string)).toBe('oldValue');
  });

  test('Proper storage event on document will trigger updates', async () => {
    render(<TestWrapper initialValue="storedValue" />);

    // JSDOM makes it high impossible to use an ACTUAL StorageEvent, so we must
    // create a custom event that has the necessary properties the hook expects
    const customEvent = new CustomEvent('storage');

    // Add the properties the hook is checking for
    Object.defineProperties(customEvent, {
      key: { value: 'storedValue' },
      newValue: { value: JSON.stringify('eventValue') },
      oldValue: { value: null },
      storageArea: { value: window.localStorage },
      url: { value: window.location.href }
    });

    window.dispatchEvent(customEvent);

    await waitFor(() => {
      expect(screen.getByTestId(/sessionValue/i)).toHaveTextContent('eventValue');
    });
  });
});
