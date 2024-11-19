export function resolveSelector(inSelector: string) {
  if (inSelector.startsWith('$$')) {
    return `#node-config-input-${inSelector.replace('$$', '')}`;
  }

  if (inSelector.startsWith('$')) {
    return `#node-input-${inSelector.replace('$', '')}`;
  }

  return inSelector;
}

function isNodeInput(selector: string) {
  const isShortcut = selector.startsWith('$$') || selector.startsWith('$');
  const isFullSelector = selector.startsWith('#node-config-input') || selector.startsWith('#node-input');

  return isShortcut || isFullSelector;
}
