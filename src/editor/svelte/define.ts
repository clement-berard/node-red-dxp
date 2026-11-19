import { mount, unmount } from 'svelte';

export { typedFieldDefaults } from './fields';

type NodeProps = Record<string, any>;

/** Config exported by a `<node>.svelte` file (usually re-exported from a typed `.ts` file next to it). */
export type SvelteNodeConfig<TProps extends Record<string, any> = NodeProps> = {
  /** Palette and editor options: `category`, `color`, `icon`, `inputs`, `outputs`, `paletteLabel`... */
  definition?: Record<string, unknown>;
  /** Node-RED `defaults`: the properties saved with the node. */
  defaults: Record<string, { value: unknown; required?: boolean; validate?: (this: TProps, value: any) => boolean }>;
  label?: (this: TProps) => string | undefined;
  outputLabels?: (this: TProps, index: number) => string | undefined;
  /** Last chance to adjust the values (e.g. `outputs`) before they are copied to the node. */
  onsave?: (values: TProps) => void;
};

type SvelteNodeModule = {
  /** The component rendering the form. It receives the node properties as a reactive `node` prop. */
  default: unknown;
  /** Palette and editor options: `category`, `color`, `icon`, `inputs`, `outputs`, `paletteLabel`... */
  definition?: Record<string, unknown>;
  /** Node-RED `defaults`: the properties saved with the node. */
  defaults: Record<string, unknown>;
  label?: (this: NodeProps) => string | undefined;
  outputLabels?: (this: NodeProps, index: number) => string | undefined;
  /** Last chance to adjust the values (e.g. `outputs`) before they are copied to the node. */
  onsave?: (values: NodeProps) => void;
};

type DefineSvelteNodeParams = {
  /** Node type: prefix of its keys in the locale files. */
  name: string;
  /** DOM id of the empty mount point emitted in the node template. */
  identifier: string;
  /** `Root.svelte` of dxp, passed in so that esbuild compiles it with the rest. */
  root: unknown;
  module: SvelteNodeModule;
};

/**
 * Turns the exports of a `<node>.svelte` file into a Node-RED editor definition: the component is mounted in
 * `oneditprepare`, its state is copied back to the node in `oneditsave` and discarded in `oneditcancel`.
 */
export function defineSvelteNode({ name, identifier, root, module }: DefineSvelteNodeParams) {
  const { definition, defaults, label, outputLabels, onsave } = module;
  const keys = Object.keys(defaults);
  // `credentials` of the definition: Node-RED stores them apart from the other properties
  const credentialDefs = ((definition as any)?.credentials ?? {}) as Record<string, { type?: string }>;
  let instance: { snapshot: () => NodeProps } | undefined;

  function destroy() {
    if (instance) {
      unmount(instance as any);
      instance = undefined;
    }
  }

  return {
    inputs: 1,
    outputs: 1,
    ...definition,
    defaults,
    label,
    outputLabels,
    oneditprepare(this: NodeProps) {
      const target = document.getElementById(identifier);
      if (!target) {
        return;
      }
      // the component works on a copy: nothing reaches the node until `oneditsave`
      // properties missing on nodes saved by an older version fall back to their default
      const initial = JSON.parse(
        JSON.stringify(Object.fromEntries(keys.map((key) => [key, this[key] ?? (defaults[key] as any)?.value]))),
      );
      // credentials are edited in `node.credentials`: a stored password shows as `__PWRD__`, which means unchanged
      initial.credentials = Object.fromEntries(
        Object.entries(credentialDefs).map(([cred, { type }]) => {
          const stored = this.credentials ?? {};
          return [cred, stored[cred] ?? (type === 'password' && stored[`has_${cred}`] ? '__PWRD__' : '')];
        }),
      );
      // `this._` is the Node-RED translator of the node; the keys of a node live under its name in the locales
      const translate = (key: string, fallback: string) =>
        this._ ? this._(`${name}.${key}`, { defaultValue: fallback }) : fallback;
      instance = mount(root as any, {
        target,
        props: { component: module.default, initial, translate, defaults },
      }) as any;
    },
    oneditsave(this: NodeProps) {
      if (!instance) {
        return;
      }
      const values = instance.snapshot();
      onsave?.(values);
      for (const key of keys) {
        if (key in values) {
          this[key] = values[key];
        }
      }
      for (const [cred, { type }] of Object.entries(credentialDefs)) {
        this.credentials = this.credentials ?? {};
        const value = values.credentials?.[cred] ?? '';
        if (type === 'password') {
          if (value === '__PWRD__') continue;
          this.credentials[`has_${cred}`] = value !== '';
        }
        this.credentials[cred] = value;
      }
      destroy();
    },
    oneditcancel() {
      destroy();
    },
  };
}
