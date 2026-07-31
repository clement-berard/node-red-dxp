/**
 * Handles adding or removing CSS classes on multiple DOM elements based on the specified action.
 *
 * @param action - The action to perform: `'add'` to add classes, `'remove'` to remove classes.
 * @param selectors - An array of selector strings targeting the elements.
 * @param classes - An array of CSS class names to add or remove.
 *
 * @example
 * // Add a class to multiple elements
 * handleAddRemoveClassesOnSelectors('add', ['#element1', '.element2'], ['highlight']);
 *
 * @example
 * // Remove a class from multiple elements
 * handleAddRemoveClassesOnSelectors('remove', ['#element1', '.element2'], ['hidden']);
 */
export function handleAddRemoveClassesOnSelectors(action: 'add' | 'remove', selectors: string[], classes: string[]) {
  selectors.forEach((selector) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      classes.forEach((cls) => {
        targetElement.classList[action](cls);
      });
    }
  });
}

/**
 * Removes the specified CSS classes from multiple DOM elements.
 *
 * This is a wrapper for `handleAddRemoveClassesOnSelectors` with the action set to `'remove'`.
 *
 * @param selectors - An array of selector strings targeting the elements.
 * @param classesToRemove - An array of CSS class names to remove.
 *
 * @example
 * // Remove the class 'hidden' from multiple elements
 * removeClassesOnSelectors(['#element1', '.element2'], ['hidden']);
 */
export function removeClassesOnSelectors(selectors: string[], classesToRemove: string[]) {
  handleAddRemoveClassesOnSelectors('remove', selectors, classesToRemove);
}

/**
 * Adds the specified CSS classes to multiple DOM elements.
 *
 * This is a wrapper for `handleAddRemoveClassesOnSelectors` with the action set to `'add'`.
 *
 * @param selectors - An array of selector strings targeting the elements.
 * @param classesToAdd - An array of CSS class names to add.
 *
 * @example
 * // Add the class 'highlight' to multiple elements
 * addClassesOnSelectors(['#element1', '.element2'], ['highlight']);
 */
export function addClassesOnSelectors(selectors: string[], classesToAdd: string[]) {
  handleAddRemoveClassesOnSelectors('add', selectors, classesToAdd);
}
