// @vitest-environment jsdom
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Button from '../ui/Button.svelte';

const label = createRawSnippet(() => ({ render: () => '<span>Pair</span>' }));
let instance: Record<string, any> | undefined;

function render(props: Record<string, unknown> = {}) {
  instance = mount(Button as any, { target: document.body, props: { children: label, ...props } });
  flushSync();
  return document.querySelector('button') as HTMLButtonElement;
}

afterEach(() => {
  if (instance) unmount(instance);
  instance = undefined;
  document.body.innerHTML = '';
});

describe('Button', () => {
  it('should render a button with its label, idle by default', () => {
    const button = render();

    expect(button.type).toBe('button');
    expect(button.textContent).toContain('Pair');
    expect(button.classList.contains('dxp-button-idle')).toBe(true);
    expect(button.disabled).toBe(false);
    expect(button.querySelector('i')).toBeNull();
  });

  it('should show the icon given in idle state', () => {
    expect(render({ icon: 'link' }).querySelector('i')?.className).toContain('fa-link');
  });

  it.each([
    ['loading', 'fa-spin'],
    ['success', 'fa-check'],
    ['error', 'fa-exclamation-triangle'],
  ])('should show the icon of the %s state instead of the given one', (state, icon) => {
    const button = render({ state, icon: 'link' });

    expect(button.classList.contains(`dxp-button-${state}`)).toBe(true);
    expect(button.querySelector('i')?.className).toContain(icon);
    expect(button.querySelector('i')?.className).not.toContain('fa-link');
  });

  it('should block the click and flag itself busy while loading', () => {
    const onclick = vi.fn();
    const button = render({ state: 'loading', onclick });

    button.click();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(onclick).not.toHaveBeenCalled();
  });

  it('should call onclick when idle, success or error', () => {
    const onclick = vi.fn();
    const button = render({ onclick });

    button.click();

    expect(onclick).toHaveBeenCalledOnce();
  });

  it('should not call onclick when disabled', () => {
    const onclick = vi.fn();
    const button = render({ disabled: true, onclick });

    button.click();

    expect(button.disabled).toBe(true);
    expect(onclick).not.toHaveBeenCalled();
  });

  it('should add the primary class only when asked', () => {
    expect(render().classList.contains('dxp-button-primary')).toBe(false);
    document.body.innerHTML = '';
    expect(render({ primary: true }).classList.contains('dxp-button-primary')).toBe(true);
  });
});
