
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule, Logger } from "@local-framework";

import { ICommunication, onReceiveCallback } from "./internals/FakeWebSocket";

import { DiffieHellmanWorker } from "./internals/workers/DiffieHellmanWorker";
import { DeriveRsaKeysWorker, RsaKeyPair } from "./internals/workers/DeriveRsaKeysWorker";

import { getRandomHexStr } from "./internals/getRandomHexStr";

import {
  EncryptedCommunicationState,
  EncryptedMessage,
  isBaseMessage,
  isEncryptedMessage,
  isPlainMessage,
  isSecurityRequestPayload,
  isSecurityResponsePayload,
  MessageTypes,
  PlainMessage,
  SecurityPayload,
} from "./internals/Messaging";

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

  private _aesStreamCipher: wasmCryptoppJs.AuthenticatedEncryptionJs;



  constructor(password: string, inCommunication: ICommunication, inOnLogging: onLogCallback) {

    this._password = password;

    this._communication = inCommunication;
    this._onLogging = inOnLogging;

    const wasmModule = CrytpoppWasmModule.get();

    this._aesStreamCipher = new wasmModule.AuthenticatedEncryptionJs();

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
    this._aesStreamCipher.delete();
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

    if (!this._rsaKeyPair) {
      throw new Error("Rsa Key Pair not initialized");
    }

    this._log("signing our public key for the peer");

    const signedPublicKey = this._rsaKeyPair.signPayloadToHexStr(this._diffieHellmanWorker.publicKey);

    this._log(Logger.makeColor([128,128 + 64,128], `here by signing the payload with the key only known from`));
    this._log(Logger.makeColor([128,128 + 64,128], `us and our peer, we ensure that we are talking to`));
    this._log(Logger.makeColor([128,128 + 64,128], `our peer and only to them, meaning no bad actor`));
    this._log(Logger.makeColor([128,128 + 64,128], `in the middle can usurp the identity of our peer and listen`));

    this._log("sending our signed public key to the peer");

    this._communication.send(JSON.stringify({
      type: MessageTypes.SecurityRequest,
      signedPublicKey,
    } satisfies SecurityPayload));
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

      this._communication.send(JSON.stringify({
        type: MessageTypes.PlainMessage,
        plainText: inText
      } satisfies PlainMessage));

      return;
    }

    if (!this._deriveRsaKeysWorker) {
      throw new Error("worker (deriveRsaKeysWorker) not initialized");
    }

    try {

      this._log(`sending a message:`, "[encrypted]");
      this._log(`"${inText}"`, "[encrypted]");

      this._log(`encrypting`, "[encrypted]");
      const startTime = Date.now();

      const ivValue = getRandomHexStr(13);

      const wasmModule = CrytpoppWasmModule.get();
      const textAsHex = wasmModule.utf8ToHex(inText);
      const encrypted = this._aesStreamCipher.encryptFromHexStrAsHexStr(textAsHex, ivValue);

      const endTime = Date.now();
      this._log(`encrypted (${endTime - startTime}ms)`, "[encrypted]");

      this._communication.send(JSON.stringify({
        type: MessageTypes.EncryptedMessage,
        encryptedMessage: encrypted,
        size: inText.length,
        ivValue
      } satisfies EncryptedMessage));

    } catch (err) {
      console.log(err);
      if (typeof(err) === 'number') {
        const wasmModule = CrytpoppWasmModule.get();
        console.log(wasmModule.getExceptionMessage(err))
      } else {
        console.log(err)
      }
      throw err;
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

    if (!isBaseMessage(jsonMsg)) {
      throw new Error("received message structure unrecognized");
    }

    this._log(`received message, type: "${jsonMsg.type}"`);

    if (isPlainMessage(jsonMsg)) {
      this._onReceiveCallbacks.forEach((callback) => callback(jsonMsg.plainText));
      return;
    }

    if (isEncryptedMessage(jsonMsg)) {

      this._log("decrypting");
      const startTime = Date.now();

      try {

        const recovered = this._aesStreamCipher.decryptFromHexStrAsHexStr(
          jsonMsg.encryptedMessage,
          jsonMsg.size,
          jsonMsg.ivValue
        );
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

      } catch (err) {
        console.log(err);
        if (typeof(err) === 'number') {
          const wasmModule = CrytpoppWasmModule.get();
          console.log(wasmModule.getExceptionMessage(err))
        } else {
          console.log(err);
        }
        throw err;
      }

      return;
    }

    if (isSecurityRequestPayload(jsonMsg)) {

      this._log("now securing the connection");

      this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

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
      const verifiedPublicKey = this._rsaKeyPair.verifyHexStrPayloadToStr(jsonMsg.signedPublicKey);

      this._log(Logger.makeColor([128,128 + 64,128], `here we verify the signed key from our peer, by doing so we can`));
      this._log(Logger.makeColor([128,128 + 64,128], `confirm the peer is someone that used the same password only known`));
      this._log(Logger.makeColor([128,128 + 64,128], `from us and our peer(s), which is vital to prevent someone`))
      this._log(Logger.makeColor([128,128 + 64,128], `listening in the middle (bad actors)`));

      await this._computeDiffieHellmanSharedSecret(verifiedPublicKey);
      await this._initializeAesSymmetricCipher();

      this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

      if (!this._diffieHellmanWorker.publicKey) {
        throw new Error("missing public key");
      }

      this._log("signing our public key for the peer");

      const signedPublicKey = this._rsaKeyPair.signPayloadToHexStr(this._diffieHellmanWorker.publicKey);

      this._log(Logger.makeColor([128,128 + 64,128], `here by signing the payload with the key only known from`));
      this._log(Logger.makeColor([128,128 + 64,128], `us and our peer, we ensure that we are talking to`));
      this._log(Logger.makeColor([128,128 + 64,128], `our peer and only to them, meaning no bad actor`));
      this._log(Logger.makeColor([128,128 + 64,128], `in the middle can usurp the identity of our peer and listen`));

      this._log("sending our signed public key to the peer");

      this._communication.send(JSON.stringify({
        type: MessageTypes.SecurityResponse,
        signedPublicKey: signedPublicKey,
      } satisfies SecurityPayload));

      return;
    }

    if (isSecurityResponsePayload(jsonMsg)) {

      this._log("processing received security response");

      if (this._EncryptedCommunicationState !== EncryptedCommunicationState.initiated) {
        throw new Error("was expecting a security response");
      }

      this._log("computing the shared secret with the received public key");

      if (!this._rsaKeyPair) {
        throw new Error("Rsa Key Pair not initialized");
      }

      this._log("verifying signed public key of the peer");
      const verifiedPublicKey = this._rsaKeyPair.verifyHexStrPayloadToStr(jsonMsg.signedPublicKey);

      this._log(Logger.makeColor([128,128 + 64,128], `here we verify the signed key from our peer, by doing so we can`));
      this._log(Logger.makeColor([128,128 + 64,128], `confirm the peer is someone that used the same password only known`));
      this._log(Logger.makeColor([128,128 + 64,128], `from us and our peer(s), which is vital to prevent someone`))
      this._log(Logger.makeColor([128,128 + 64,128], `listening in the middle (bad actors)`));

      await this._computeDiffieHellmanSharedSecret(verifiedPublicKey);
      await this._initializeAesSymmetricCipher();

      this._log("connection now confirmed secure");

      this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

      return;
    }

    throw new Error(`received message type unsupported, type: "${jsonMsg.type}"`);
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
    this._log(Logger.makeColor([128,128 + 64,128], Logger.makeSize(30, `input password: "${this._password}"`)));
    this._log(`input key size: ${keySize}`);
    this._log(Logger.makeColor([128,128 + 64,128], `(key size is likely smaller for this demo)`));
    this._log(Logger.makeColor([128,128 + 64,128], `(safe key size at the moment of writing is at least >=${1024*3})`));

    let elapsedTime = await this._deriveRsaKeysWorker.deriveRsaKeys(this._password, keySize);

    this._log("output privateKeyPem");
    this._log(this._deriveRsaKeysWorker.privateKeyPem!);
    this._log("output publicKeyPem");
    this._log(this._deriveRsaKeysWorker.publicKeyPem!);

    this._log(Logger.makeColor([128,128 + 64,128], `those value will be the same for the peer`));
    this._log(Logger.makeColor([128,128 + 64,128], `since the same password was used`));

    this._log(`Derive Rsa Keys done (elapsedTime: ${elapsedTime}ms)`);
    this._log("------------------------------------");

    this._rsaKeyPair = this._deriveRsaKeysWorker.makeRsaKeyPair();
  }

  private async _computeDiffieHellmanSharedSecret(publicKey: string) {

    if (!this._diffieHellmanWorker) {
      throw new Error("worker (workerObtainCipherKey) not initialized");
    }

    this._log("------------------------------------");
    this._log("Diffie Hellman Key Exchange");
    this._log(`computing shared secret`);

    this._log(`input publicKey`);
    printHexadecimalStrings(this._log.bind(this), publicKey, 32);

    const elapsed = await this._diffieHellmanWorker.computeDiffieHellmanSharedSecret(publicKey);

    this._log(`output sharedSecret`);
    printHexadecimalStrings(this._log.bind(this), this._diffieHellmanWorker.sharedSecret!, 32);

    this._log(`computed shared secret (${elapsed}ms)`);
    this._log("------------------------------------");
  }

  private async _initializeAesSymmetricCipher() {

    if (!this._deriveRsaKeysWorker) {
      throw new Error("worker (deriveRsaKeysWorker) not initialized");
    }
    if (!this._diffieHellmanWorker) {
      throw new Error("worker (workerObtainCipherKey) not initialized");
    }
    if (!this._diffieHellmanWorker.sharedSecret) {
      throw new Error("shared secret not initialized");
    }

    this._log("------------------------------------");
    this._log("AES GCM (Stream) Cipher");
    this._log("initializing");
    this._log("256bits key from computed shared secret");

    const startTime = Date.now();

    this._aesStreamCipher.initializeFromHexStr(
      this._diffieHellmanWorker.sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
    );

    const endTime = Date.now();
    this._log(`initialized (${endTime - startTime}ms)`);
    this._log("------------------------------------");
  }

  //endregion Helpers

};
