// @vitest-environment jsdom
import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Root from '../Root.svelte';
import IpField from './fixtures/IpField.svelte';

const defaults = { ip: { value: '', required: true, validate: (value: string) => /^\d+(\.\d+){3}$/.test(value) } };
let instance: Record<string, any> | undefined;
let prop: ReturnType<typeof vi.fn>;
let selector: string | undefined;

function render(ip: string) {
  instance = mount(Root as any, {
    target: document.body,
    props: { component: IpField, initial: { ip }, translate: (_key: string, fallback: string) => fallback, defaults },
  });
  flushSync();
}

function type(value: string) {
  const input = document.querySelector('input') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
}

beforeEach(() => {
  prop = vi.fn();
  (globalThis as any).jQuery = vi.fn((value: string) => {
    selector = value;
    return { prop };
  });
});

afterEach(() => {
  if (instance) unmount(instance);
  instance = undefined;
  document.body.innerHTML = '';
  delete (globalThis as any).jQuery;
});

describe('Root', () => {
  it('should disable the Add/Update buttons of both dialogs while a property is invalid', () => {
    render('fdsafds');

    expect(selector).toBe('#node-dialog-ok, #node-config-dialog-ok');
    expect(prop).toHaveBeenLastCalledWith('disabled', true);
  });

  it('should disable them for an empty required property', () => {
    render('');

    expect(prop).toHaveBeenLastCalledWith('disabled', true);
  });

  it('should enable them once the property is valid, and disable them again when it breaks', () => {
    render('fdsafds');

    type('10.0.0.19');
    expect(prop).toHaveBeenLastCalledWith('disabled', false);

    type('10.0.0');
    expect(prop).toHaveBeenLastCalledWith('disabled', true);
  });

  it('should not fail outside of Node-RED, without jQuery', () => {
    delete (globalThis as any).jQuery;

    expect(() => render('fdsafds')).not.toThrow();
  });
});
