(function initModelUtils(globalScope) {
  function normalizeModels(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map(item => String(item).trim())
        .filter(Boolean);
    }

    return String(value)
      .split('+')
      .map(item => item.trim())
      .filter(Boolean);
  }

  function joinModels(value) {
    return normalizeModels(value).join(' + ');
  }

  function flattenRowText(row, vendors) {
    return vendors
      .flatMap(vendor => normalizeModels(row[vendor]))
      .join(' ');
  }

  const api = {
    flattenRowText,
    joinModels,
    normalizeModels
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.ModelUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
