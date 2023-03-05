

Module.utf8ToHex = (str) => {
  return Array.from(str).map(c => {
    return c.charCodeAt(0) < 128
    ? c.charCodeAt(0).toString(16)
    : encodeURIComponent(c).replace(/\%/g,'').toLowerCase()
  }).join('');
};

Module.hexToUtf8 = (str) => {
  return decodeURIComponent(str.replace(/\s+/g, '').replace(/[0-9a-fA-F]{2}/g, '%$&'));
};

