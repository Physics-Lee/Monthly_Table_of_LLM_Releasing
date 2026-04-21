(function initModelUtils(globalScope) {
  function normalizeModels(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (item && typeof item === 'object') return String(item.name || '').trim();
          return String(item).trim();
        })
        .filter(Boolean);
    }

    if (typeof value === 'object') {
      return normalizeModels([value]);
    }

    return String(value)
      .split('+')
      .map(item => item.trim())
      .filter(Boolean);
  }

  function normalizeModelEntries(value, links = {}) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (item && typeof item === 'object') {
            const name = String(item.name || '').trim();
            if (!name) return null;
            const url = item.url || links[name] || null;
            return url ? { name, url } : { name };
          }

          const name = String(item).trim();
          if (!name) return null;
          const url = links[name] || null;
          return url ? { name, url } : { name };
        })
        .filter(Boolean);
    }

    if (typeof value === 'object') {
      return normalizeModelEntries([value], links);
    }

    return normalizeModels(value).map(name => {
      const url = links[name] || null;
      return url ? { name, url } : { name };
    });
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
    normalizeModelEntries,
    normalizeModels
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.ModelUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
