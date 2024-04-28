
import {
  StrategiesTypes,
  IMsgInitialize_request,
  IMsgInitialize_response,
  IMsgCreateSecureContext_request,
  IMsgCreateSecureContext_response,
  IMsgGenerateDiffieHellmanKey_request,
  IMsgGenerateDiffieHellmanKey_response,
  IMsgComputeDiffieHellmanSharedSecret_request,
  IMsgComputeDiffieHellmanSharedSecret_response,
} from "../../../../_common"

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
  _requestWorkerOnce<IMsgInitialize_request, IMsgInitialize_response>(inWorker, {
    type: StrategiesTypes.initialize
  });

const makeCreateSecureContextRequest = async (inWorker: Worker) =>
  _requestWorkerOnce<IMsgCreateSecureContext_request, IMsgCreateSecureContext_response>(inWorker, {
    type: StrategiesTypes.create_secure_context
  });

const makeGenerateDiffieHellmanKeyRequest = async (inWorker: Worker, id: string) =>
  _requestWorkerOnce<IMsgGenerateDiffieHellmanKey_request, IMsgGenerateDiffieHellmanKey_response>(inWorker, {
    type: StrategiesTypes.generate_diffie_hellman_keys, id
  });

const makeComputeDiffieHellmanSharedSecretRequest = async (inWorker: Worker, id: string, publicKey: string) =>
  _requestWorkerOnce<IMsgComputeDiffieHellmanSharedSecret_request, IMsgComputeDiffieHellmanSharedSecret_response>(inWorker, {
    type: StrategiesTypes.compute_diffie_hellman_shared_secret, id, publicKey
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

export class DiffieHellmanWorker {

  private _workerInstance?: Worker;
  private _secureContextId?: string;
  private _publicKey?: string;
  private _sharedSecret?: string;

  constructor() {
  }

  async initialize(): Promise<void> {
    if (this._workerInstance) {
      return;
    }
    {
      this._workerInstance = new Worker("./dist/worker-diffie-hellman.js");
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
    this._publicKey = undefined;
    this._sharedSecret = undefined;
  }

  async generateDiffieHellmanKeys(): Promise<void> {

    if (!this._workerInstance) {
      throw new Error("worker not initialized");
    }
    if (!this._secureContextId) {
      throw new Error("secure context not initialized");
    }

    const message = await makeGenerateDiffieHellmanKeyRequest(this._workerInstance, this._secureContextId);
    if (isErrorResponse(message)) {
      throw new Error(message.response.error);
    }

    this._publicKey = message.response.publicKey;
  }

  async computeDiffieHellmanSharedSecret(publicKey: string): Promise<void> {

    if (!this._workerInstance) {
      throw new Error("worker not initialized");
    }
    if (!this._secureContextId) {
      throw new Error("secure context not initialized");
    }

    const message = await makeComputeDiffieHellmanSharedSecretRequest(this._workerInstance, this._secureContextId, publicKey);
    if (isErrorResponse(message)) {
      throw new Error(message.response.error);
    }

    this._sharedSecret = message.response.sharedSecret;
  }

  get publicKey(): string | undefined {
    return this._publicKey;
  }
  get sharedSecret(): string | undefined {
    return this._sharedSecret;
  }

};
