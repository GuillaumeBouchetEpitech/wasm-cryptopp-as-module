
import wasmCryptoppJs from "*";
import { CrytpoppWasmModule } from "@local-framework";
import { DeriveRsaKeys } from "../../../../_common"

const _workerMessageOnce = async (inWorker: Worker) => {
  return new Promise<any>((resolve, reject) => {
    const _callback = (message: any) => {

      inWorker.removeEventListener('message', _callback);
      resolve(message.data);
    }
    try {
      inWorker.addEventListener('message', _callback);
    } catch (err) {
      try {
        inWorker.removeEventListener('message', _callback);
      } catch (ignored) {}

      reject(err);
    }
  });
};

const _requestWorkerOnce = async <T, R>(inWorker: Worker, inMsg: T): Promise<{success: boolean, response: R}> => {
  inWorker.postMessage(inMsg);
  return await _workerMessageOnce(inWorker);
}

const makeInitializeRequest = async (inWorker: Worker) =>
  _requestWorkerOnce<DeriveRsaKeys.IMsgInitialize_request, DeriveRsaKeys.IMsgInitialize_response>(inWorker, {
    type: DeriveRsaKeys.StrategiesTypes.initialize
  });

const makeCreateSecureContextRequest = async (inWorker: Worker) =>
  _requestWorkerOnce<DeriveRsaKeys.IMsgCreateSecureContext_request, DeriveRsaKeys.IMsgCreateSecureContext_response>(inWorker, {
    type: DeriveRsaKeys.StrategiesTypes.create_secure_context
  });

const makeDeriveRsaKeysRequest = async (inWorker: Worker, id: string, password: string, keySize: number) =>
  _requestWorkerOnce<DeriveRsaKeys.IMsgDeriveRsaKeys_request, DeriveRsaKeys.IMsgDeriveRsaKeys_response>(inWorker, {
    type: DeriveRsaKeys.StrategiesTypes.derive_rsa_keys, id, password, keySize
  });

//
//
//

type ErrorResponse = {
  success: boolean;
  response: {
    error: string;
  }
};

const isErrorResponse = (inValue: any): inValue is ErrorResponse => {
  return (
    typeof(inValue) === 'object' &&
    inValue.success === false &&
    typeof(inValue.response) === 'object'
  )
}

//
//
//

export class DeriveRsaKeysWorker {

  private _workerInstance?: Worker;
  private _secureContextId?: string;
  private _privateKeyPem?: string;
  private _publicKeyPem?: string;

  constructor() {
  }

  async initialize(): Promise<void> {
    if (this._workerInstance) {
      return;
    }
    {
      this._workerInstance = new Worker("./dist/worker-derive-rsa-key.js");
      const message = await makeInitializeRequest(this._workerInstance);
      console.log('message.success', message.success);
      console.log('message.response', message.response);
    }

    {
      const message = await makeCreateSecureContextRequest(this._workerInstance);
      console.log('message.success', message.success);
      console.log('message.response', message.response);
      this._secureContextId = message.response.id;
    }
  }

  async dispose() {
    if (!this._workerInstance) {
      return;
    }
    this._workerInstance.terminate();
    this._workerInstance = undefined;
    this._secureContextId = undefined;
    this._privateKeyPem = undefined;
    this._publicKeyPem = undefined;
  }

  async deriveRsaKeys(password: string, keySize: number): Promise<number> {

    if (!this._workerInstance) {
      throw new Error("worker not initialized");
    }
    if (!this._secureContextId) {
      throw new Error("secure context not initialized");
    }

    const message = await makeDeriveRsaKeysRequest(this._workerInstance, this._secureContextId, password, keySize);
    if (isErrorResponse(message)) {
      throw new Error(message.response.error);
    }

    this._privateKeyPem = message.response.privateKeyPem;
    this._publicKeyPem = message.response.publicKeyPem;

    return message.response.elapsedTime;
  }

  makeRsaKeyPair(): RsaKeyPair {
    if (!this._privateKeyPem) {
      throw new Error(`no public key derived`);
    }
    if (!this._publicKeyPem) {
      throw new Error(`no public key derived`);
    }

    return new RsaKeyPair(this._privateKeyPem, this._publicKeyPem);
  }

  get privateKeyPem(): string | undefined {
    return this._privateKeyPem;
  }
  get publicKeyPem(): string | undefined {
    return this._publicKeyPem;
  }

};

//
//
//

export class RsaKeyPair {

  private _privateKey: wasmCryptoppJs.RSAPrivateKeyJs;
  private _publicKey: wasmCryptoppJs.RSAPublicKeyJs;
  private _prng: wasmCryptoppJs.AutoSeededRandomPoolJs;

  constructor(privateKeyPem: string, publicKeyPem: string) {

    const wasmModule = CrytpoppWasmModule.get();

    this._prng = new wasmModule.AutoSeededRandomPoolJs();
    this._privateKey = new wasmModule.RSAPrivateKeyJs();
    this._publicKey = new wasmModule.RSAPublicKeyJs();

    this._privateKey.loadFromPemString(privateKeyPem);
    this._publicKey.loadFromPemString(publicKeyPem);
  }

  signPayloadToHexStr(payload: string): string {
    const wasmModule = CrytpoppWasmModule.get();
    const hexPayload = wasmModule.utf8ToHex(payload);
    return this._privateKey.signFromHexStrToHexStrUsingAutoSeeded(this._prng, hexPayload);
  }

  verifyHexStrPayloadToStr(signedHexStrPayload: string): string {
    const wasmModule = CrytpoppWasmModule.get();
    const verifiedHexPayload = this._publicKey.verifyFromHexStrToHexStr(signedHexStrPayload);
    return wasmModule.hexToUtf8(verifiedHexPayload);
  }

};
