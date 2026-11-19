<script lang="ts">
  import Hint from './Hint.svelte';
  import Row from './Row.svelte';
  import TypedInput from './TypedInput.svelte';

  // A whole line for a property that holds a value **and** its type (`<field>` and `<field>Type`): label, typedInput,
  // hint, validation. Written for the settings a node shares with its config node: `inherit` adds the choice "take it
  // from the config node" (a type without value)
  let {
    node,
    field,
    label,
    icon = '',
    valueType = 'str',
    inherit,
    readonly = [],
    extraTypes = true,
    allowEmpty = true,
    hint = '',
    placeholder = '',
  }: {
    /** The `node` prop of the component. */
    node: Record<string, any>;
    /** Property of the value: its type is `<field>Type`. Both must be in `defaults`. */
    field: string;
    label: string;
    icon?: string;
    /** Main type of the value: `str`, `num`, `bool`, `json`... */
    valueType?: string;
    /** Offers a type without value, such as `{ value: 'from_client', label: 'Inherit from client' }`. */
    inherit?: { value: string; label: string };
    /** Types without value, offered first (HTTP methods, for instance). */
    readonly?: string[];
    /** Adds `jsonata`, `msg`, `flow`, `global` and `env` (default). */
    extraTypes?: boolean;
    /** An empty value is valid (the setting is optional). Use `required` in `defaults` to refuse it. */
    allowEmpty?: boolean;
    hint?: string;
    placeholder?: string;
  } = $props();

  // the types are fixed for the life of the component
  // svelte-ignore state_referenced_locally
  const types = [
    ...readonly.map((value) => ({ value, label: value, hasValue: false })),
    ...(inherit ? [{ value: inherit.value, label: inherit.label, hasValue: false }] : []),
    valueType,
    ...(extraTypes ? ['jsonata', 'msg', 'flow', 'global', 'env'] : []),
  ];
</script>

<Row {label} {icon} {field}>
  <TypedInput bind:value={node[field]} bind:type={node[`${field}Type`]} {types} {placeholder} {allowEmpty} />
  {#if hint}<Hint>{hint}</Hint>{/if}
</Row>
