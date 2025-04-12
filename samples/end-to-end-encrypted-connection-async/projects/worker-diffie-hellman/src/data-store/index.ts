
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule } from "@local-worker-framework";

export interface SecureContext {
  autoSeededRandomPool: wasmCryptoppJs.AutoSeededRandomPoolJs,
  diffieHellmanClient: wasmCryptoppJs.EllipticCurveDiffieHellmanClientJs;
  aesSymmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;
  publicKey?: string;
  sharedSecret?: string;
};

let idVal = 0;
const _secureContextMap = new Map<string, SecureContext>();

export const createNewSecureContext = (): string => {
  idVal += 1;

  const keyStr = `${idVal}`;

  const wasmModule = CrytpoppWasmModule.get()

  _secureContextMap.set(keyStr, {
    autoSeededRandomPool: new wasmModule.AutoSeededRandomPoolJs(),
    diffieHellmanClient: new wasmModule.EllipticCurveDiffieHellmanClientJs(),
    aesSymmetricCipher: new wasmModule.AesSymmetricCipherJs(),
  });

  return keyStr;
};

export const getSecureContext = (keyStr: string): SecureContext => {
  const value = _secureContextMap.get(keyStr);
  if (!value) {
    throw new Error(`secure context not found: "${keyStr}"`);
  }
  return value;
};

