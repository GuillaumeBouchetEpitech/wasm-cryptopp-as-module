
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule } from "@local-worker-framework";

interface TestClientData {

  password?: string;

  derivedKey?: string;

  entropy?: string;
  nonce?: string;
  personalization?: string;
  ivValue?: string;

  privateKeyPem?: string;
  publicKeyPem?: string;

  // dhPublicKey?: string;
  // dhSignedPublicKey?: string;
  // sharedSecret?: string;
};

export interface SecureContext {

  _data: TestClientData;

  prng?: wasmCryptoppJs.HashDrbgRandomGeneratorJs;
  privateRsaKey?: wasmCryptoppJs.RSAPrivateKeyJs;
  publicRsaKey?: wasmCryptoppJs.RSAPublicKeyJs;
};

let idVal = 0;
const _secureContextMap = new Map<string, SecureContext>();

export const createNewSecureContext = (): string => {
  idVal += 1;

  const keyStr = `${idVal}`;

  const wasmModule = CrytpoppWasmModule.get()

  _secureContextMap.set(keyStr, {
    _data: {},
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

