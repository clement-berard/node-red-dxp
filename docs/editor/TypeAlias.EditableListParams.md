[Editor / DOM Helper](dom-helper.md) / EditableListParams

# Type Alias: EditableListParams\<T\>

```ts
type EditableListParams<T> = object;
```

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="type-parameter-t"></a> `T`

</td>
</tr>
</tbody>
</table>

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="property-addbutton"></a> `addButton?`

</td>
<td>

`boolean`

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

<a id="property-additem"></a> `addItem`

</td>
<td>

(`row`, `data`, `index`) => `void`

</td>
<td>

Builds the content of one row. `data` is the item to show, empty for a row added with the button.

</td>
</tr>
<tr>
<td>

<a id="property-items"></a> `items?`

</td>
<td>

`Partial`\<`T`\>[]

</td>
<td>

Rows to display when the editor opens.

</td>
</tr>
<tr>
<td>

<a id="property-removable"></a> `removable?`

</td>
<td>

`boolean`

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

<a id="property-selector"></a> `selector`

</td>
<td>

`string`

</td>
<td>

Selector of the `<ol>` that hosts the list (`$name` resolves to `#node-input-name`).

</td>
</tr>
<tr>
<td>

<a id="property-sortable"></a> `sortable?`

</td>
<td>

`boolean`

</td>
<td>

&hyphen;

</td>
</tr>
</tbody>
</table>
