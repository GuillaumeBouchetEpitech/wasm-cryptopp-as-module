
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule } from "@local-framework";

import { ICommunication, onReceiveCallback } from "./internals/FakeWebSocket";

import { DiffieHellmanWorker } from "./internals/DiffieHellmanWorker";

import { EncryptedCommunicationState, isMessage, isSecurityRequestPayload, isSecurityResponsePayload, MessageTypes } from "./internals/Messaging";

import { getRandomHexStr } from "./internals/getRandomHexStr";
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

  private readonly _communication: ICommunication;
  private _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
  private _onReceiveCallbacks: onReceiveCallback[] = [];
  private _onLogging: onLogCallback;

  private _workerObtainCipherKey: DiffieHellmanWorker | undefined;

  private _publicKey?: string;
  private _ivValue?: string;
  private _sharedSecret?: string;

  private _aesSymmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;

  constructor(inCommunication: ICommunication, inOnLogging: onLogCallback) {
    this._communication = inCommunication;
    this._onLogging = inOnLogging;

    const wasmModule = CrytpoppWasmModule.get();

    this._aesSymmetricCipher = new wasmModule.AesSymmetricCipherJs();

    this._communication.onReceive(async (inMsg: string) => {
      await this._processReceivedMessage(inMsg);
    });
  }

  async initialize(): Promise<void> {
    await this._initializeDiffieHellmanWorker();
  }

  delete() {
    this._aesSymmetricCipher.delete();
    this._workerObtainCipherKey?.dispose();
    this._wasDeleted = true;
  }

  async makeSecure(): Promise<void> {
    if (this._wasDeleted) {
      throw new Error("was deleted");
    }
    if (!this._workerObtainCipherKey) {
      throw new Error("worker not initialized");
    }

    this._log("now securing the connection");
    this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

    await this._generateDiffieHellmanKeys();

    this._ivValue = getRandomHexStr(16);

    this._log(`message.response.ivValue`);
    printHexadecimalStrings(this._log.bind(this), this._ivValue, 64);

    const payload = JSON.stringify({
      publicKey: this._publicKey,
      ivValue: this._ivValue,
    });

    this._communication.send(JSON.stringify({ type: MessageTypes.SecurityRequest, payload }));
  }

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

    if (this._wasDeleted)
      throw new Error("was deleted");

    this._onReceiveCallbacks.push(inCallback);
  }

  get EncryptedCommunicationState() {

    if (this._wasDeleted)
      throw new Error("was deleted");

    return this._EncryptedCommunicationState;
  }






  private async _initializeDiffieHellmanWorker(): Promise<void> {
    this._workerObtainCipherKey = new DiffieHellmanWorker();
    await this._workerObtainCipherKey.initialize();
  }

  private async _processReceivedMessage(inText: string) {

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

        this._ivValue = jsonPayload.ivValue;

        await this._generateDiffieHellmanKeys();
        await this._computeDiffieHellmanSharedSecret(jsonPayload.publicKey);
        await this._initializeAesSymmetricCipher();

        this._log("sending public key");

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        const payload = JSON.stringify({
          publicKey: this._publicKey,
        });

        this._communication.send(JSON.stringify({ type: MessageTypes.SecurityResponse, payload }));

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

        await this._computeDiffieHellmanSharedSecret(jsonPayload.publicKey);
        await this._initializeAesSymmetricCipher();

        this._log("connection now confirmed secure");

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        break;
      }
      default:
        throw new Error(`received message type unsupported, type: "${jsonMsg.type}"`);
    }

  }

  private _log(inLogMsg: string, inLogHeader?: string) {
    if (this._onLogging) {
      this._onLogging(inLogMsg, inLogHeader);
    }
  }

  private async _generateDiffieHellmanKeys() {

    this._log("------------------------------------");
    this._log("Diffie Hellman Key Exchange");
    this._log("generating public/private keys");
    this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");

    if (!this._workerObtainCipherKey) {
      throw new Error("worker not initialized");
    }

    await this._workerObtainCipherKey.generateDiffieHellmanKeys();
    this._publicKey = this._workerObtainCipherKey.publicKey;

    this._log(`this._publicKey`);
    printHexadecimalStrings(this._log.bind(this), this._publicKey!, 64);

    // this._log(`generated public/private keys (${message.response.elapsedTime}ms)`);
    this._log("------------------------------------");
  }

  private async _computeDiffieHellmanSharedSecret(publicKey: string) {

    if (!this._workerObtainCipherKey) {
      throw new Error("worker not initialized");
    }

    this._log(`input publicKey`);
    printHexadecimalStrings(this._log.bind(this), publicKey, 64);

    await this._workerObtainCipherKey.computeDiffieHellmanSharedSecret(publicKey);
    this._sharedSecret = this._workerObtainCipherKey.sharedSecret;

    this._log(`this._sharedSecret`);
    printHexadecimalStrings(this._log.bind(this), this._sharedSecret!, 64);
  }

  private async _initializeAesSymmetricCipher() {

    if (!this._ivValue) {
      throw new Error("iv value not initialized");
    }
    if (!this._sharedSecret) {
      throw new Error("shared secret not initialized");
    }
    if (!this._workerObtainCipherKey) {
      throw new Error("worker not initialized");
    }

    this._log("------------------------------------");
    this._log("AES Symmetric Cipher");
    this._log("initializing");
    this._log("256bits key from computed shared secret");

    const startTime = Date.now();

    this._aesSymmetricCipher.initializeFromHexStr(
      this._sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
      this._ivValue,
    );

    const endTime = Date.now();
    this._log(`initialized (${endTime - startTime}ms)`);
    this._log("------------------------------------");
  }

};
