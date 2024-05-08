
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule } from "@local-framework";

import { ICommunication, onReceiveCallback } from "./internals/FakeWebSocket";

import { DiffieHellmanWorker } from "./internals/workers/DiffieHellmanWorker";
import { DeriveRsaKeysWorker, RsaKeyPair } from "./internals/workers/DeriveRsaKeysWorker";

import { EncryptedCommunicationState, isMessage, isSecurityRequestPayload, isSecurityResponsePayload, MessageTypes, SecurityPayload } from "./internals/Messaging";

import { printHexadecimalStrings } from "./internals/printHexadecimalStrings";

//
//
//

export type onLogCallback = (inLogMsg: string, inLogHeader?: string) => void;

//
//
//

//
//
//

export class AsyncSecureClient {

  private _wasDeleted = false;

  private _password: string;

  private readonly _communication: ICommunication;
  private _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
  private _onReceiveCallbacks: onReceiveCallback[] = [];
  private _onLogging: onLogCallback;

  private _diffieHellmanWorker: DiffieHellmanWorker | undefined;
  private _deriveRsaKeysWorker: DeriveRsaKeysWorker | undefined;
  private _rsaKeyPair: RsaKeyPair | undefined;

  private _aesSymmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;

  constructor(password: string, inCommunication: ICommunication, inOnLogging: onLogCallback) {

    this._password = password;

    this._communication = inCommunication;
    this._onLogging = inOnLogging;

    const wasmModule = CrytpoppWasmModule.get();

    this._aesSymmetricCipher = new wasmModule.AesSymmetricCipherJs();

    this._communication.onReceive(async (inMsg: string) => {
      await this._processReceivedClientMessage(inMsg);
    });
  }

  async initialize(): Promise<void> {
    this._diffieHellmanWorker = new DiffieHellmanWorker();
    this._deriveRsaKeysWorker = new DeriveRsaKeysWorker();

    await Promise.all([
      this._diffieHellmanWorker.initialize(),
      this._deriveRsaKeysWorker.initialize(),
    ]);
  }

  delete() {
    this._aesSymmetricCipher.delete();
    this._diffieHellmanWorker?.dispose();
    this._deriveRsaKeysWorker?.dispose();
    this._wasDeleted = true;
  }

  //region Make Secure

  async makeSecure(): Promise<void> {
    if (this._wasDeleted) {
      throw new Error("was deleted");
    }
    if (!this._diffieHellmanWorker) {
      throw new Error("worker (workerObtainCipherKey) not initialized");
    }
    if (!this._deriveRsaKeysWorker) {
      throw new Error("worker (deriveRsaKeysWorker) not initialized");
    }

    this._log("now securing the connection");
    this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

    // both can be inside a Promise.all([...])
    // -> but since it would mess up the logs of this demo...
    await this._generateDiffieHellmanKeys();
    await this._deriveRsaKeys();

    if (!this._diffieHellmanWorker.publicKey) {
      throw new Error("no public key generated");
    }
    if (!this._deriveRsaKeysWorker.ivValue) {
      throw new Error("no iv value generated");
    }
    // this._ivValue = getRandomHexStr(16);

    this._log(`message.response.ivValue`);
    printHexadecimalStrings(this._log.bind(this), this._deriveRsaKeysWorker.ivValue, 32);

    if (!this._rsaKeyPair) {
      throw new Error("Rsa Key Pair not initialized");
    }

    this._log("signing our public key for the peer");

    const signedPublicKey = this._rsaKeyPair.signPayloadToHexStr(this._diffieHellmanWorker.publicKey);

    this._log("sending our signed public key to the peer");
    const payload: SecurityPayload = {
      signedPublicKey: signedPublicKey,
    };

    this._communication.send(JSON.stringify({
      type: MessageTypes.SecurityRequest,
      payload: JSON.stringify(payload),
    }));
  }
  //endregion Make Secure

  send(inText: string): void {

    if (this._wasDeleted) {
      throw new Error("was deleted");
    }

    if (this._EncryptedCommunicationState === EncryptedCommunicationState.initiated) {
      throw new Error("cannot send while securing the connection");
    }


    if (this._EncryptedCommunicationState === EncryptedCommunicationState.unencrypted) {

      this._log(`sending a message:`, "[unencrypted]");
      this._log(`"${inText}"`, "[unencrypted]");

      this._communication.send(JSON.stringify({ type: MessageTypes.PlainMessage, payload: (inText) }));
    } else {

      this._log(`sending a message:`, "[encrypted]");
      this._log(`"${inText}"`, "[encrypted]");

      this._log(`encrypting`, "[encrypted]");
      const startTime = Date.now();

      const wasmModule = CrytpoppWasmModule.get();
      const textAshex = wasmModule.utf8ToHex(inText);
      const encrypted = this._aesSymmetricCipher.encryptFromHexStrAsHexStr(textAshex);

      const endTime = Date.now();
      this._log(`encrypted (${endTime - startTime}ms)`, "[encrypted]");

      this._communication.send(JSON.stringify({ type: MessageTypes.EncryptedMessage, payload: encrypted }));
    }

  }

  onReceive(inCallback: onReceiveCallback): void {

    if (this._wasDeleted) {
      throw new Error("was deleted");
    }

    this._onReceiveCallbacks.push(inCallback);
  }

  get EncryptedCommunicationState() {

    if (this._wasDeleted) {
      throw new Error("was deleted");
    }

    return this._EncryptedCommunicationState;
  }




  //region Process Message

  private async _processReceivedClientMessage(inText: string) {

    if (this._wasDeleted) {
      throw new Error("was deleted");
    }

    const jsonMsg = JSON.parse(inText);

    if (!isMessage(jsonMsg)) {
      throw new Error("received message structure unrecognized");
    }

    this._log(`received message, type: "${jsonMsg.type}"`);

    switch (jsonMsg.type) {
      case MessageTypes.PlainMessage:
      {
        this._onReceiveCallbacks.forEach((callback) => callback(jsonMsg.payload));
        break;
      }
      case MessageTypes.EncryptedMessage:
      {
        this._log("decrypting");
        const startTime = Date.now();

        const recovered = this._aesSymmetricCipher.decryptFromHexStrAsHexStr(jsonMsg.payload);
        const wasmModule = CrytpoppWasmModule.get();
        const plainText = wasmModule.hexToUtf8(recovered);

        const endTime = Date.now();
        this._log(`decrypted (${endTime - startTime}ms)`);

        if (this._EncryptedCommunicationState === EncryptedCommunicationState.ready) {
          this._log("connection now confirmed secure");
          this._EncryptedCommunicationState = EncryptedCommunicationState.confirmed;
        }
        else if (this._EncryptedCommunicationState !== EncryptedCommunicationState.confirmed) {
          throw new Error("was expecting to be in a secure state");
        }

        this._onReceiveCallbacks.forEach((callback) => callback(plainText));
        break;
      }
      case MessageTypes.SecurityRequest:
      {
        this._log("now securing the connection");

        this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

        const jsonPayload = JSON.parse(jsonMsg.payload);

        if (!isSecurityRequestPayload(jsonPayload)) {
          throw new Error("received message security request payload unrecognized");
        }
        if (!this._diffieHellmanWorker) {
          throw new Error("worker (workerObtainCipherKey) not initialized");
        }

        // both can be inside a Promise.all([...])
        // -> but since it would mess up the logs of this demo...
        await this._deriveRsaKeys();
        await this._generateDiffieHellmanKeys();

        if (!this._rsaKeyPair) {
          throw new Error("Rsa Key Pair not initialized");
        }

        this._log("verifying signed public key from the peer");
        const verifiedPublicKey = this._rsaKeyPair.verifyHexStrPayloadToStr(jsonPayload.signedPublicKey);

        await this._computeDiffieHellmanSharedSecret(verifiedPublicKey);
        await this._initializeAesSymmetricCipher();

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        if (!this._diffieHellmanWorker.publicKey) {
          throw new Error("missing public key");
        }

        this._log("signing our public key for the peer");

        const signedPublicKey = this._rsaKeyPair.signPayloadToHexStr(this._diffieHellmanWorker.publicKey);

        this._log("sending our signed public key to the peer");
        const payload: SecurityPayload = {
          signedPublicKey: signedPublicKey,
        };

        this._communication.send(
          JSON.stringify({
            type: MessageTypes.SecurityResponse,
            payload: JSON.stringify(payload),
          }));

        break;
      }
      case MessageTypes.SecurityResponse:
      {
        this._log("processing received security response");

        if (this._EncryptedCommunicationState !== EncryptedCommunicationState.initiated) {
          throw new Error("was expecting a security response");
        }

        this._log("computing the shared secret with the received public key");

        const jsonPayload = JSON.parse(jsonMsg.payload);

        if (!isSecurityResponsePayload(jsonPayload)) {
          throw new Error("received message security response payload unrecognized");
        }
        if (!this._rsaKeyPair) {
          throw new Error("Rsa Key Pair not initialized");
        }

        this._log("verifying signed public key of the peer");
        const verifiedPublicKey = this._rsaKeyPair.verifyHexStrPayloadToStr(jsonPayload.signedPublicKey);

        await this._computeDiffieHellmanSharedSecret(verifiedPublicKey);
        await this._initializeAesSymmetricCipher();

        this._log("connection now confirmed secure");

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        break;
      }
      default:
        throw new Error(`received message type unsupported, type: "${jsonMsg.type}"`);
    }

  }

  //endregion Process Message

  private _log(inLogMsg: string, inLogHeader?: string) {
    if (this._onLogging) {
      this._onLogging(inLogMsg, inLogHeader);
    }
  }

  //region Helpers

  private async _generateDiffieHellmanKeys() {

    this._log("------------------------------------");
    this._log("Diffie Hellman Key Exchange");
    this._log("generating public/private keys");
    this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");

    if (!this._diffieHellmanWorker) {
      throw new Error("worker (workerObtainCipherKey) not initialized");
    }

    const elapsed = await this._diffieHellmanWorker.generateDiffieHellmanKeys();

    this._log(`diffieHellmanWorker.publicKey`);
    printHexadecimalStrings(this._log.bind(this), this._diffieHellmanWorker.publicKey!, 32);

    this._log(`generated public/private keys (${elapsed}ms)`);
    this._log("------------------------------------");
  }

  private async _deriveRsaKeys() {

    if (!this._deriveRsaKeysWorker) {
      throw new Error("worker (deriveRsaKeysWorker) not initialized");
    }

    // const keySize = 1024 * 3; // actually safe
    const keySize = 1024 * 1; // faster for the demo but unsafe

    this._log("------------------------------------");
    this._log(`Derive Rsa Keys`);
    this._log(`input password: "${this._password}"`);
    this._log(`input key size: ${keySize}`);

    let elapsedTime = await this._deriveRsaKeysWorker.deriveRsaKeys(this._password, keySize);

    this._log("output privateKeyPem");
    this._log(this._deriveRsaKeysWorker.privateKeyPem!);
    this._log("output publicKeyPem");
    this._log(this._deriveRsaKeysWorker.publicKeyPem!);
    this._log("output ivValue");
    printHexadecimalStrings(this._log.bind(this), this._deriveRsaKeysWorker.ivValue!, 32);

    this._log(`Derive Rsa Keys done (elapsedTime: ${elapsedTime}ms)`);
    this._log("------------------------------------");

    this._rsaKeyPair = this._deriveRsaKeysWorker.makeRsaKeyPair();
  }

  private async _computeDiffieHellmanSharedSecret(publicKey: string) {

    if (!this._diffieHellmanWorker) {
      throw new Error("worker (workerObtainCipherKey) not initialized");
    }
    // if (!this._deriveRsaKeysWorker) {
    //   throw new Error("worker (deriveRsaKeysWorker) not initialized");
    // }

    this._log("------------------------------------");
    this._log("Diffie Hellman Key Exchange");
    this._log(`computing shared secret`);

    this._log(`input publicKey`);
    printHexadecimalStrings(this._log.bind(this), publicKey, 32);

    const elapsed = await this._diffieHellmanWorker.computeDiffieHellmanSharedSecret(publicKey);
    // this._sharedSecret = this._diffieHellmanWorker.sharedSecret;

    this._log(`output sharedSecret`);
    printHexadecimalStrings(this._log.bind(this), this._diffieHellmanWorker.sharedSecret!, 32);

    this._log(`computed shared secret (${elapsed}ms)`);
    this._log("------------------------------------");
  }

  private async _initializeAesSymmetricCipher() {

    if (!this._deriveRsaKeysWorker) {
      throw new Error("worker (deriveRsaKeysWorker) not initialized");
    }
    if (!this._deriveRsaKeysWorker.ivValue) {
      throw new Error("iv value not initialized");
    }
    if (!this._diffieHellmanWorker) {
      throw new Error("worker (workerObtainCipherKey) not initialized");
    }
    if (!this._diffieHellmanWorker.sharedSecret) {
      throw new Error("shared secret not initialized");
    }

    this._log("------------------------------------");
    this._log("AES Symmetric Cipher");
    this._log("initializing");
    this._log("256bits key from computed shared secret");

    const startTime = Date.now();

    this._aesSymmetricCipher.initializeFromHexStr(
      this._diffieHellmanWorker.sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
      this._deriveRsaKeysWorker.ivValue,
    );

    const endTime = Date.now();
    this._log(`initialized (${endTime - startTime}ms)`);
    this._log("------------------------------------");
  }

  //endregion Helpers

};
