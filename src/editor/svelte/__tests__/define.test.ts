// @vitest-environment jsdom
import { mount, unmount } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineSvelteNode } from '../define';

vi.mock('svelte', () => ({
  mount: vi.fn(),
  unmount: vi.fn(),
}));

const root = { name: 'Root' };
const component = { name: 'Component' };

function setup(moduleOverrides: Record<string, unknown> = {}) {
  document.body.innerHTML = '<div id="pkg-my-node"></div>';
  const snapshot = vi.fn();
  vi.mocked(mount).mockReturnValue({ snapshot } as any);
  const def = defineSvelteNode({
    name: 'my-node',
    identifier: 'pkg-my-node',
    root,
    module: {
      default: component,
      defaults: { name: { value: 'default name' }, count: { value: '3' } },
      ...moduleOverrides,
    },
  }) as any;
  return { def, snapshot };
}

describe('defineSvelteNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gives one input and one output by default, overridable by the definition', () => {
    expect(setup().def).toMatchObject({ inputs: 1, outputs: 1 });
    expect(setup({ definition: { category: 'config', inputs: 0, outputs: 0 } }).def).toMatchObject({
      category: 'config',
      inputs: 0,
      outputs: 0,
    });
  });

  it('exposes defaults, label and outputLabels as given', () => {
    const label = () => 'my label';
    const outputLabels = () => 'out';
    const { def } = setup({ label, outputLabels });

    expect(def.defaults).toEqual({ name: { value: 'default name' }, count: { value: '3' } });
    expect(def.label).toBe(label);
    expect(def.outputLabels).toBe(outputLabels);
  });

  describe('oneditprepare', () => {
    it('mounts the root on the mount point with a copy of the saved properties', () => {
      const { def } = setup();
      const node = { name: 'saved', count: '5', other: 'ignored' };

      def.oneditprepare.call(node);

      expect(mount).toHaveBeenCalledWith(
        root,
        expect.objectContaining({
          target: document.getElementById('pkg-my-node'),
          props: expect.objectContaining({
            component,
            initial: expect.objectContaining({ name: 'saved', count: '5' }),
          }),
        }),
      );
      const { initial } = vi.mocked(mount).mock.calls[0][1].props as any;
      expect(initial).not.toHaveProperty('other');
      expect(initial).not.toBe(node);
    });

    it('falls back to the default of a property missing on an older saved node', () => {
      const { def } = setup();

      def.oneditprepare.call({ name: 'saved' });

      expect((vi.mocked(mount).mock.calls[0][1].props as any).initial.count).toBe('3');
    });

    it('does nothing when the mount point is missing', () => {
      const { def } = setup();
      document.body.innerHTML = '';

      def.oneditprepare.call({});

      expect(mount).not.toHaveBeenCalled();
    });

    it('translates with the translator of the node, under the name of the node', () => {
      const { def } = setup();
      const translator = vi.fn().mockReturnValue('translated');

      def.oneditprepare.call({ _: translator });
      const { translate } = vi.mocked(mount).mock.calls[0][1].props as any;

      expect(translate('category', 'Category')).toBe('translated');
      expect(translator).toHaveBeenCalledWith('my-node.category', { defaultValue: 'Category' });
    });

    it('returns the fallback when the node has no translator', () => {
      const { def } = setup();

      def.oneditprepare.call({});
      const { translate } = vi.mocked(mount).mock.calls[0][1].props as any;

      expect(translate('category', 'Category')).toBe('Category');
    });
  });

  describe('oneditsave', () => {
    it('copies the declared properties to the node, after onsave, then unmounts', () => {
      const onsave = vi.fn((values: any) => {
        values.outputs = 2;
      });
      const { def, snapshot } = setup({
        onsave,
        defaults: { name: { value: '' }, outputs: { value: 1 } },
      });
      const node: any = {};
      def.oneditprepare.call(node);
      snapshot.mockReturnValue({ name: 'edited', outputs: 1, notDeclared: 'x' });

      def.oneditsave.call(node);

      expect(onsave).toHaveBeenCalled();
      expect(node).toEqual({ name: 'edited', outputs: 2 });
      expect(unmount).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the editor was never mounted', () => {
      const { def } = setup();

      expect(() => def.oneditsave.call({})).not.toThrow();
      expect(unmount).not.toHaveBeenCalled();
    });
  });

  describe('oneditcancel', () => {
    it('unmounts without touching the node', () => {
      const { def } = setup();
      const node: any = { name: 'saved' };
      def.oneditprepare.call(node);

      def.oneditcancel();

      expect(unmount).toHaveBeenCalledTimes(1);
      expect(node).toEqual({ name: 'saved' });
    });
  });

  describe('credentials', () => {
    const definition = { credentials: { user: { type: 'text' }, password: { type: 'password' } } };

    function prepare(node: any) {
      const { def, snapshot } = setup({ definition });
      def.oneditprepare.call(node);
      return { def, snapshot, initial: (vi.mocked(mount).mock.calls[0][1].props as any).initial };
    }

    it('shows a stored password as the placeholder and a stored text as is', () => {
      const { initial } = prepare({ credentials: { user: 'alice', has_password: true } });

      expect(initial.credentials).toEqual({ user: 'alice', password: '__PWRD__' });
    });

    it('starts empty when nothing is stored', () => {
      const { initial } = prepare({});

      expect(initial.credentials).toEqual({ user: '', password: '' });
    });

    it('saves the edited credentials and flags the password', () => {
      const { def, snapshot } = prepare({ credentials: {} });
      const node: any = { credentials: {} };
      snapshot.mockReturnValue({ credentials: { user: 'bob', password: 'secret' } });

      def.oneditsave.call(node);

      expect(node.credentials).toEqual({ user: 'bob', password: 'secret', has_password: true });
    });

    it('keeps a stored password that was not edited', () => {
      const { def, snapshot } = prepare({ credentials: { has_password: true } });
      const node: any = { credentials: { has_password: true } };
      snapshot.mockReturnValue({ credentials: { user: 'bob', password: '__PWRD__' } });

      def.oneditsave.call(node);

      expect(node.credentials).toEqual({ user: 'bob', has_password: true });
    });

    it('flags an emptied password as removed', () => {
      const { def, snapshot } = prepare({ credentials: { has_password: true } });
      const node: any = { credentials: { has_password: true } };
      snapshot.mockReturnValue({ credentials: { user: '', password: '' } });

      def.oneditsave.call(node);

      expect(node.credentials.has_password).toBe(false);
    });
  });
});
