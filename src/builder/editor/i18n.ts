export function updateI18nAttributes(nodeName = '', htmlContent = '') {
  if (!nodeName || !htmlContent) {
    return htmlContent;
  }
  return htmlContent.replace(/data-i18n="([^"]+)"/g, (match, i18nValue) => {
    const updatedValue = i18nValue.replace(/(\[.*?\])?(node-red:[^;]+|[^;]+)/g, (_, prefix, key) => {
      let res = key;
      if (!key.startsWith('node-red:')) {
        res = `${nodeName}.${key}`;
      }

      return (prefix || '') + res;
    });

    return `data-i18n="${updatedValue}"`;
  });
}
