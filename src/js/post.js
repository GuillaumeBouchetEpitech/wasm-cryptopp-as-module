

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


Module.jsStr_to_wasmAllocatedStr = (inJsStr) => {
  const size = Module.lengthBytesUTF8(inJsStr);
  const ptr = Module._malloc(size + 1); // manual allocation
  Module.stringToUTF8(inJsStr, ptr, size + 1);
  return { ptr, size };
}

Module.wasmAllocatedStr_to_jsStr = (inWasmStr) => {
  if (inWasmStr.ptr)
    return Module.UTF8ToString(inWasmStr.ptr);
  return Module.UTF8ToString(inWasmStr);
}

Module.allocate = (inSize) => {
  return {
    ptr: Module._malloc(inSize),
    size: inSize,
  };
}


Module.deallocate = (inWasmData) => {
  if (inWasmData.__destroy__ !== undefined) {
    Module.destroy(inWasmData);
    return;
  }
  if (inWasmData.ptr !== undefined) {
    Module._free(inWasmData.ptr);
    return;
  }
  if (typeof(inWasmData) == 'number') {
    Module._free(inWasmData);
    return;
  }
}

//
//
// DiffieHellmanClientJs

Module.DiffieHellmanClientJs = function() {
  this._wasmInstance = new Module.DiffieHellmanClient();
}

Module.DiffieHellmanClientJs.prototype.dispose = function() {
  Module.deallocate(this._wasmInstance);
  this._wasmInstance = undefined;
}

Module.DiffieHellmanClientJs.prototype.generateKeys = function() {
  this._wasmInstance.generateKeys();
}

Module.DiffieHellmanClientJs.prototype.getPublicKeyAsHexStr = function() {
  const hexWasmStr = this._wasmInstance.getPublicKeyAsHexStrPtr()
  const hexJsStr = Module.wasmAllocatedStr_to_jsStr(hexWasmStr);
  Module.deallocate(hexWasmStr);
  return hexJsStr;
}

Module.DiffieHellmanClientJs.prototype.computeSharedSecretFromHexStr = function(inPubStr) {
  const hexWasmStr = Module.jsStr_to_wasmAllocatedStr(inPubStr);
  this._wasmInstance.computeSharedSecretFromHexStrPtr(hexWasmStr.ptr, hexWasmStr.size);
  Module.deallocate(hexWasmStr);
}

Module.DiffieHellmanClientJs.prototype.getSharedSecretAsHexStr = function() {
  const hexWasmStr = this._wasmInstance.getSharedSecretAsHexStrPtr()
  const hexJsStr = Module.wasmAllocatedStr_to_jsStr(hexWasmStr);
  Module.deallocate(hexWasmStr);
  return hexJsStr;
}

// DiffieHellmanClientJs
//
//

//
//
// AutoSeededRandomPoolJs

Module.AutoSeededRandomPoolJs = function() {
  this._wasmInstance = new Module.AutoSeededRandomPool();
}

Module.AutoSeededRandomPoolJs.prototype.dispose = function() {
  Module.deallocate(this._wasmInstance);
  this._wasmInstance = undefined;
}

Module.AutoSeededRandomPoolJs.prototype.getRandomHexStr = function(inSize) {
  const hexWasmStr = this._wasmInstance.getRandomHexStrPtr(inSize)
  const hexJsStr = Module.wasmAllocatedStr_to_jsStr(hexWasmStr);
  Module.deallocate(hexWasmStr);
  return hexJsStr;
}

// AutoSeededRandomPoolJs
//
//

//
//
// AesSymmetricCipherJs

Module.AesSymmetricCipherJs = function() {
  this._wasmInstance = new Module.AesSymmetricCipher();
}

Module.AesSymmetricCipherJs.prototype.dispose = function() {
  Module.deallocate(this._wasmInstance);
  this._wasmInstance = undefined;
}

Module.AesSymmetricCipherJs.prototype.initializeFromHexStr = function(inKeyStr, inIvStr) {
  const hexWasmStr_key = Module.jsStr_to_wasmAllocatedStr(inKeyStr);
  const hexWasmStr_iv = Module.jsStr_to_wasmAllocatedStr(inIvStr);
  this._wasmInstance.initializeFromHexStrPtr(
    hexWasmStr_key.ptr, hexWasmStr_key.size,
    hexWasmStr_iv.ptr, hexWasmStr_iv.size,
  );
  Module.deallocate(hexWasmStr_key);
  Module.deallocate(hexWasmStr_iv);
}

Module.AesSymmetricCipherJs.prototype.encryptFromHexStrAsHexStr = function(inStr) {
  const hexWasmStr = Module.jsStr_to_wasmAllocatedStr(inStr);
  const encodedRawHexStr = this._wasmInstance.encryptFromHexStrPtrAsHexStrPtr(
    hexWasmStr.ptr,
    hexWasmStr.size,
  );
  const hexJsStr = Module.wasmAllocatedStr_to_jsStr(encodedRawHexStr);
  Module.deallocate(hexWasmStr);
  Module.deallocate(encodedRawHexStr);
  return hexJsStr;
}

// AesSymmetricCipherJs
//
//

//
//
// AesSymmetricDecipherJs

Module.AesSymmetricDecipherJs = function() {
  this._wasmInstance = new Module.AesSymmetricDecipher();
}

Module.AesSymmetricDecipherJs.prototype.dispose = function() {
  Module.deallocate(this._wasmInstance);
  this._wasmInstance = undefined;
}

Module.AesSymmetricDecipherJs.prototype.initializeFromHexStr = function(inKeyStr, inIvStr) {
  const hexWasmStr_key = Module.jsStr_to_wasmAllocatedStr(inKeyStr);
  const hexWasmStr_iv = Module.jsStr_to_wasmAllocatedStr(inIvStr);
  this._wasmInstance.initializeFromHexStrPtr(
    hexWasmStr_key.ptr, hexWasmStr_key.size,
    hexWasmStr_iv.ptr, hexWasmStr_iv.size,
  );
  Module.deallocate(hexWasmStr_key);
  Module.deallocate(hexWasmStr_iv);
}

Module.AesSymmetricDecipherJs.prototype.decryptFromHexStrAsHexStr = function(inStr) {
  const hexWasmStr = Module.jsStr_to_wasmAllocatedStr(inStr);
  const recoveredRawHexStr = this._wasmInstance.decryptFromHexStrPtrAsHexStrPtr(
    hexWasmStr.ptr,
    hexWasmStr.size,
  );
  const hexJsStr = Module.wasmAllocatedStr_to_jsStr(recoveredRawHexStr);
  Module.deallocate(hexWasmStr);
  Module.deallocate(recoveredRawHexStr);
  return hexJsStr;
}

// AesSymmetricDecipherJs
//
//
