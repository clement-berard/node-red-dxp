// @vitest-environment jsdom
import { snakeCase } from 'es-toolkit';
import $ from 'jquery';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addClassesOnSelectors,
  applyTypedInput,
  getFormValues,
  handleAddRemoveClassesOnSelectors,
  initSelect,
  initTabs,
  isCheckboxChecked,
  isNodeInput,
  jqSelector,
  removeClassesOnSelectors,
  resolveInputKey,
  resolveSelector,
  setFormValues,
  setInputValue,
  setText,
  watchInput,
} from '../dom';

(global as any).$ = (global as any).jQuery = $;
// Node-RED editor jQuery UI plugin, not part of real jquery.
($.fn as any).typedInput = vi.fn().mockReturnThis();

beforeEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('isNodeInput', () => {
  it('detects the $ node id shortcut', () => {
    expect(isNodeInput('$name')).toEqual({
      isNodeIdShortcut: true,
      isNodeConfigIdShortcut: false,
      isFullSelector: false,
      value: true,
    });
  });

  it('detects the $$ node config id shortcut (which also matches the plain $ prefix)', () => {
    expect(isNodeInput('$$config-name')).toEqual({
      isNodeIdShortcut: true,
      isNodeConfigIdShortcut: true,
      isFullSelector: false,
      value: true,
    });
  });

  it('detects a full #node-input-... selector', () => {
    expect(isNodeInput('#node-input-name')).toEqual({
      isNodeIdShortcut: false,
      isNodeConfigIdShortcut: false,
      isFullSelector: true,
      value: true,
    });
  });

  it('detects a full #node-config-input-... selector', () => {
    expect(isNodeInput('#node-config-input-name')).toEqual({
      isNodeIdShortcut: false,
      isNodeConfigIdShortcut: false,
      isFullSelector: true,
      value: true,
    });
  });

  it('returns all-false for a selector that matches nothing', () => {
    expect(isNodeInput('.some-class')).toEqual({
      isNodeIdShortcut: false,
      isNodeConfigIdShortcut: false,
      isFullSelector: false,
      value: false,
    });
  });
});

describe('resolveSelector', () => {
  it('resolves the $$ shortcut to a node-config-input selector', () => {
    expect(resolveSelector('$$config-name')).toBe('#node-config-input-config-name');
  });

  it('resolves the $ shortcut to a node-input selector', () => {
    expect(resolveSelector('$name')).toBe('#node-input-name');
  });

  it('returns an already-resolved selector unchanged', () => {
    expect(resolveSelector('#my-element')).toBe('#my-element');
  });
});

describe('resolveInputKey', () => {
  it('extracts the key from a $ shortcut', () => {
    expect(resolveInputKey('$node-name')).toBe('node-name');
  });

  it('extracts the key from a full selector', () => {
    expect(resolveInputKey('#node-input-custom')).toBe('custom');
  });

  it('keeps the full key even when it contains "-input-" itself', () => {
    expect(resolveInputKey('$$cfg-input-key')).toBe('cfg-input-key');
  });
});

describe('handleAddRemoveClassesOnSelectors / addClassesOnSelectors / removeClassesOnSelectors', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="el1"></div><div id="el2" class="highlight hidden"></div>';
  });

  it('adds classes to all matching elements', () => {
    addClassesOnSelectors(['#el1', '#el2'], ['foo', 'bar']);
    expect(document.querySelector('#el1')?.className).toBe('foo bar');
    expect(document.querySelector('#el2')?.classList.contains('foo')).toBe(true);
  });

  it('removes classes from all matching elements', () => {
    removeClassesOnSelectors(['#el2'], ['hidden']);
    expect(document.querySelector('#el2')?.className).toBe('highlight');
  });

  it('silently skips selectors that match nothing', () => {
    expect(() => handleAddRemoveClassesOnSelectors('add', ['#does-not-exist'], ['foo'])).not.toThrow();
  });
});

describe('initSelect', () => {
  beforeEach(() => {
    document.body.innerHTML = '<select id="node-input-sel"></select>';
  });

  it('populates the select with the given options', () => {
    initSelect('$sel', [
      { value: '1', text: 'One' },
      { value: '2', text: 'Two' },
    ]);

    const options = Array.from(document.querySelectorAll('#node-input-sel option'));
    expect(options.map((o) => [(o as HTMLOptionElement).value, o.textContent])).toEqual([
      ['1', 'One'],
      ['2', 'Two'],
    ]);
  });

  it('prepends an empty option when emptyValue is provided', () => {
    initSelect('$sel', [{ value: '1', text: 'One' }], { emptyValue: 'Select...' });

    const options = Array.from(document.querySelectorAll('#node-input-sel option'));
    expect(options[0].textContent).toBe('Select...');
    expect((options[0] as HTMLOptionElement).value).toBe('');
  });

  it('marks the matching option as selected', () => {
    initSelect(
      '$sel',
      [
        { value: '1', text: 'One' },
        { value: '2', text: 'Two' },
      ],
      { selected: '2' },
    );

    expect((document.querySelector('#node-input-sel') as HTMLSelectElement).value).toBe('2');
  });
});

describe('applyTypedInput', () => {
  it('applies typedInput with the resolved type field', () => {
    applyTypedInput({ selector: '$foo', types: ['str', 'num'] });

    expect($.fn.typedInput).toHaveBeenCalledTimes(1);
    expect($.fn.typedInput).toHaveBeenCalledWith({
      types: ['str', 'num'],
      typeField: '#node-input-fooType',
    });
  });
});

describe('watchInput', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="node-input-a" value="a1" />
      <input id="node-input-b" value="b1" />
    `;
  });

  it('calls back with all current values on input', () => {
    const callback = vi.fn();
    watchInput(['$a', '$b'], callback);

    (document.querySelector('#node-input-a') as HTMLInputElement).value = 'a2';
    $('#node-input-a').trigger('input');

    expect(callback).toHaveBeenCalledWith(['a2', 'b1']);
  });

  it('also triggers on additionalEvents', () => {
    const callback = vi.fn();
    watchInput('$a', callback, { additionalEvents: ['change'] });

    $('#node-input-a').trigger('change');

    expect(callback).toHaveBeenCalledWith(['a1']);
  });
});

describe('setInputValue / setText', () => {
  it('sets the value of an input element', () => {
    document.body.innerHTML = '<input id="node-input-name" />';
    setInputValue('$name', 'hello');
    expect((document.querySelector('#node-input-name') as HTMLInputElement).value).toBe('hello');
  });

  it('sets the text content of an element', () => {
    document.body.innerHTML = '<span id="label"></span>';
    setText('#label', 'Updated text');
    expect(document.querySelector('#label')?.textContent).toBe('Updated text');
  });
});

describe('jqSelector', () => {
  it('returns a jQuery-wrapped resolved element', () => {
    document.body.innerHTML = '<input id="node-input-name" />';
    const result = jqSelector('$name');
    const element = document.querySelector('#node-input-name') as HTMLInputElement;
    expect(result.length).toBe(1);
    expect(result.is(element)).toBe(true);
  });
});

describe('isCheckboxChecked', () => {
  it('returns true for a checked checkbox', () => {
    document.body.innerHTML = '<input type="checkbox" id="node-input-flag" checked />';
    expect(isCheckboxChecked('$flag')).toBe(true);
  });

  it('returns false for an unchecked checkbox', () => {
    document.body.innerHTML = '<input type="checkbox" id="node-input-flag" />';
    expect(isCheckboxChecked('$flag')).toBe(false);
  });
});

describe('getFormValues', () => {
  it('extracts text and checkbox values under a prefix', () => {
    document.body.innerHTML = `
      <input type="checkbox" id="node-input-settings-enabled" checked />
      <input type="text" id="node-input-settings-username" value="JohnDoe" />
    `;

    expect(getFormValues('settings')).toEqual({ enabled: true, username: 'JohnDoe' });
  });
});

describe('setFormValues', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="checkbox" id="node-input-settings-enabled" />
      <input type="text" id="node-input-settings-username" />
    `;
  });

  it('sets checkbox and text values from the given object', () => {
    setFormValues('settings', { enabled: true, username: 'JaneDoe' });

    expect((document.querySelector('#node-input-settings-enabled') as HTMLInputElement).checked).toBe(true);
    expect((document.querySelector('#node-input-settings-username') as HTMLInputElement).value).toBe('JaneDoe');
  });

  it('is a no-op when values is falsy', () => {
    expect(() => setFormValues('settings', undefined as any)).not.toThrow();
    expect((document.querySelector('#node-input-settings-username') as HTMLInputElement).value).toBe('');
  });

  it('silently skips keys with no matching element', () => {
    expect(() => setFormValues('settings', { doesNotExist: 'value' })).not.toThrow();
  });
});

describe('initTabs', () => {
  it('creates tabs, adds each label, and activates the initial tab', () => {
    const addTab = vi.fn();
    const activateTab = vi.fn();
    const create = vi.fn(() => ({ addTab, activateTab }));
    (global as any).RED = { tabs: { create } };

    initTabs({ targetId: 'x', tabsLabel: ['Tab One', 'Tab Two'], initialTab: 'Tab One' });

    expect(create).toHaveBeenCalledWith({ id: 'x', onchange: expect.any(Function) });
    expect(addTab).toHaveBeenNthCalledWith(1, { id: `tab-${snakeCase('Tab One')}`, label: 'Tab One' });
    expect(addTab).toHaveBeenNthCalledWith(2, { id: `tab-${snakeCase('Tab Two')}`, label: 'Tab Two' });
    expect(activateTab).toHaveBeenCalledWith(`tab-${snakeCase('Tab One')}`);
  });

  it('hides sibling tab sections and shows the active one on tab change', () => {
    const create = vi.fn((_params: { id: string; onchange: (tab: { id: string }) => void }) => ({
      addTab: vi.fn(),
      activateTab: vi.fn(),
    }));
    (global as any).RED = { tabs: { create } };

    document.body.innerHTML = `
      <div id="tabs-content-x">
        <div id="tab-a"></div>
        <div id="tab-b" class="hidden"></div>
      </div>
    `;

    initTabs({ targetId: 'x', tabsLabel: ['A', 'B'], initialTab: 'A' });

    const onchange = create.mock.calls[0][0].onchange;
    onchange({ id: 'tab-b' });

    expect(document.querySelector('#tab-a')?.classList.contains('hidden')).toBe(true);
    expect(document.querySelector('#tab-b')?.classList.contains('hidden')).toBe(false);
  });
});
