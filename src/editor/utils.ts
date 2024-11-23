/**
 * Checks if a given selector is a node input selector.
 *
 * @param selector - The selector string to check.
 * @returns True if the selector is a node input selector, false otherwise.
 */
export function isNodeInput(selector: string) {
  const isNodeIdShortcut = selector.startsWith('$');
  const isNodeConfigIdShortcut = selector.startsWith('$$');
  const isFullSelector = selector.startsWith('#node-config-input') || selector.startsWith('#node-input');

  return {
    isNodeIdShortcut,
    isNodeConfigIdShortcut,
    isFullSelector,
    value: isNodeIdShortcut || isNodeConfigIdShortcut || isFullSelector,
  };
}

/**
 * Resolves a given selector to a specific format based on its prefix.
 *
 * @param inSelector - The input selector string to resolve.
 * @returns The resolved selector string.
 */
export function resolveSelector(inSelector: string) {
  const computed = isNodeInput(inSelector);
  if (computed.isNodeConfigIdShortcut) {
    return `#node-config-input-${inSelector.replace('$$', '')}`;
  }

  if (computed.isNodeIdShortcut) {
    return `#node-input-${inSelector.replace('$', '')}`;
  }

  return inSelector;
}
