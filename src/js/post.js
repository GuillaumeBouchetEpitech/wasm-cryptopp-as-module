

Module.utf8ToHex = (str) => {
  return Array.from(str).map(c => {
    return c.charCodeAt(0) < 128
    ? c.charCodeAt(0).toString(16)
    : encodeURIComponent(c).replace(/\%/g,'').toLowerCase()
  }).join('');
};

Module.hexToUtf8 = (inHexStr) => {
  let outStr = '';
  for (let ii = 0; ii < inHexStr.length; ii += 2) {
    outStr += String.fromCharCode(parseInt(inHexStr.substr(ii, 2), 16));
  }
  return outStr;
};
