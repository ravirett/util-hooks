import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { usePortal } from '../src/hooks/use-portal';

let portal: HTMLElement;
const Subject = ({ id }: { id: string }) => {
  portal = usePortal(id);
  return (
    <div id="portal-mount" />
  )
}

describe('usePortal hook', () => {
  it('should create a new element inside of the target element', () => {
    render(<Subject id="test-portal" />);

    expect(portal).toBeDefined();
    expect(portal).toBeInstanceOf(HTMLElement);

    expect(document.querySelector('#test-portal')?.outerHTML).toBe('<div id="test-portal">' + portal.outerHTML + '</div>');
  });
});

