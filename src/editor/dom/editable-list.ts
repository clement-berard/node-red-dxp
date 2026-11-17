import { jqSelector } from './selectors';

export type EditableListParams<T> = {
  /** Selector of the `<ol>` that hosts the list (`$name` resolves to `#node-input-name`). */
  selector: string;
  /** Rows to display when the editor opens. */
  items?: Partial<T>[];
  /** Builds the content of one row. `data` is the item to show, empty for a row added with the button. */
  addItem: (row: JQuery, data: Partial<T>, index: number) => void;
  addButton?: boolean;
  removable?: boolean;
  sortable?: boolean;
};

/**
 * Turns an `<ol>` into a Node-RED `editableList` (rows that can be added, removed and sorted).
 *
 * The widget sizes its box once, for an empty list: the helper makes it follow the height of its rows
 * when they are added or removed.
 *
 * @param params - See {@link EditableListParams}.
 *
 * @example
 * ```typescript
 * // pug: +dxpFormRowEditableList({ id: 'rules', label: 'Rules' })
 * initEditableList<Rule>({
 *   selector: '$rules-container',
 *   items: this.rules,
 *   addItem: (row, rule) => {
 *     $('<input type="text">').appendTo(row).val(rule.name ?? '');
 *   },
 * });
 * ```
 */
export function initEditableList<T = any>(params: EditableListParams<T>) {
  const { selector, items = [], addItem, addButton = true, removable = true, sortable = true } = params;
  const list = jqSelector(selector);
  const fitHeight = () => {
    setTimeout(() => list.parent().css({ height: 'auto' }), 0);
  };

  list.editableList({
    addButton,
    removable,
    sortable,
    scrollOnAdd: false,
    addItem: (row: JQuery, index: number, data: Partial<T>) => {
      addItem(row, data, index);
      fitHeight();
    },
    removeItem: fitHeight,
  });

  for (const item of items) {
    list.editableList('addItem', item);
  }
}

/**
 * Reads the rows of an `editableList`, in their displayed order.
 *
 * @param selector - Selector of the `<ol>` given to {@link initEditableList}.
 * @param readItem - Turns one row into an item.
 * @returns The items, one per row.
 *
 * @example
 * ```typescript
 * this.rules = getEditableListItems<Rule>('$rules-container', (row) => ({ name: row.find('input').val() as string }));
 * ```
 */
export function getEditableListItems<T = any>(selector: string, readItem: (row: JQuery) => T): T[] {
  const result: T[] = [];
  jqSelector(selector)
    .editableList('items')
    .each(function () {
      result.push(readItem($(this)));
    });
  return result;
}
