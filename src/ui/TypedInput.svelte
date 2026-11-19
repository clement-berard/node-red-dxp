<script lang="ts">
  import type { EditorWidgetTypedInputOptions } from 'node-red';
  import { untrack } from 'svelte';

  // Node-RED `typedInput` widget (jQuery) as a component: `value` and `type` stay in sync both ways.
  // Every other prop is an option of the widget (`types`, `typeField`, `validate`, `autoComplete`, `width`...)
  let {
    value = $bindable(),
    type = $bindable(),
    types = ['msg', 'flow', 'global', 'str', 'json', 'jsonata', 'env'],
    allowEmpty = false,
    ...options
  }: {
    value?: string;
    type?: string;
    /** An empty value is valid whatever the type (Node-RED refuses an empty `json`, `msg`...). */
    allowEmpty?: boolean
  } & Omit<EditorWidgetTypedInputOptions, 'default'> = $props();

  // `$` is reserved by svelte: reach jQuery through the global object
  const jq = (globalThis as any).jQuery;
  let input: HTMLInputElement;

  // the widget validates per type: wrap each validator of this instance so that an empty value passes
  function acceptEmpty(field: any) {
    const widget = field.typedInput('instance');
    for (const [name, definition] of Object.entries<any>(widget.typeMap)) {
      const validate = definition.validate;
      if (typeof validate === 'function') {
        widget.typeMap[name] = { ...definition, validate: (v: string, o: object) => v === '' || validate(v, o) };
      }
    }
    widget.validate();
  }

  $effect(() => {
    const field = jq(input);
    untrack(() => {
      // a type that the widget does not offer would break its layout: use the first allowed one instead
      const allowed = types.map((item: any) => (typeof item === 'string' ? item : item.value));
      if (!allowed.includes(type)) type = allowed[0];
      field.typedInput({ ...options, types, default: type });
      field.typedInput('value', value ?? '');
      if (allowEmpty) acceptEmpty(field);
    });
    const sync = () => {
      value = field.typedInput('value');
      type = field.typedInput('type');
    };
    field.on('change typedinputtypechange', sync);
    return () => {
      field.off('change typedinputtypechange', sync);
      field.typedInput('destroy');
    };
  });

  $effect(() => {
    const field = jq(input);
    if (value !== undefined && field.typedInput('value') !== value) field.typedInput('value', value);
    if (type !== undefined && field.typedInput('type') !== type) field.typedInput('type', type);
  });
</script>

<input bind:this={input} type="text" style="width: 100%" />
