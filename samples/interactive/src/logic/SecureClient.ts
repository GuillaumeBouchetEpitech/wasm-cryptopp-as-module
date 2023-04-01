
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule } from "../../../_common";

//
//
//

// 2.3.  2048-bit MODP Group with 256-bit Prime Order Subgroup
// https://www.rfc-editor.org/rfc/rfc5114#section-2.3

const localP = [
  "0x87A8E61DB4B6663CFFBBD19C651959998CEEF608660DD0F2",
  "5D2CEED4435E3B00E00DF8F1D61957D4FAF7DF4561B2AA30",
  "16C3D91134096FAA3BF4296D830E9A7C209E0C6497517ABD",
  "5A8A9D306BCF67ED91F9E6725B4758C022E0B1EF4275BF7B",
  "6C5BFC11D45F9088B941F54EB1E59BB8BC39A0BF12307F5C",
  "4FDB70C581B23F76B63ACAE1CAA6B7902D52526735488A0E",
  "F13C6D9A51BFA4AB3AD8347796524D8EF6A167B5A41825D9",
  "67E144E5140564251CCACB83E6B486F6B3CA3F7971506026",
  "C0B857F689962856DED4010ABD0BE621C3A3960A54E710C3",
  "75F26375D7014103A4B54330C198AF126116D2276E11715F",
  "693877FAD7EF09CADB094AE91E1A1597",
].join("");

const localQ = "0x8CF83642A709A097B447997640129DA299B1A47D1EB3750BA308B0FE64F5FBD3";

const localG = [
  "0x3FB32C9B73134D0B2E77506660EDBD484CA7B18F21EF2054",
  "07F4793A1A0BA12510DBC15077BE463FFF4FED4AAC0BB555",
  "BE3A6C1B0C6B47B1BC3773BF7E8C6F62901228F8C28CBB18",
  "A55AE31341000A650196F931C77A57F2DDF463E5E9EC144B",
  "777DE62AAAB8A8628AC376D282D6ED3864E67982428EBC83",
  "1D14348F6F2F9193B5045AF2767164E1DFC967C1FB3F2E55",
  "A4BD1BFFE83B9C80D052B985D182EA0ADB2A3B7313D3FE14",
  "C8484B1E052588B9B7D2BBD2DF016199ECD06E1557CD0915",
  "B3353BBB64E0EC377FD028370DF92B52C7891428CDC67EB6",
  "184B523D1DB246C32F63078490F00EF8D647D148D4795451",
  "5E2327CFEF98C582664B4C0F6CC41659",
].join("");

//
//
//

export enum MessageTypes {
  "PlainMessage" = "PlainMessage",
  "EncryptedMessage" = "EncryptedMessage",
  "SecurityRequest" = "SecurityRequest",
  "SecurityResponse" = "SecurityResponse",
};

//
//
//

export type Message = {
  type: string;
  payload: string;
};
export const isMessage = (inValue: any): inValue is Message => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.type) === 'string' &&
    typeof(inValue.payload) === 'string'
  )
}

export type onReceiveCallback = (inText: string) => void;

export interface ICommunication {
  send(inText: string): void;
  onReceive(inCallback: onReceiveCallback): void;
};

export enum EncryptedCommunicationState {
  unencrypted,
  initiated,
  ready,
  confirmed,
};

export type SecurityPayload = {
  publicKey: string;
  ivValue: string;
};
export const isSecurityResponsePayload = (inValue: any): inValue is SecurityPayload => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.publicKey) === 'string'
  )
}
export const isSecurityRequestPayload = (inValue: any): inValue is SecurityPayload => {
  return (
    isSecurityResponsePayload(inValue) &&
    typeof(inValue.ivValue) === 'string'
  )
}

export class SecureClient implements ICommunication {

  private _wasDeleted = false;

  private readonly _communication: ICommunication;
  private _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
  private _onReceiveCallbacks: onReceiveCallback[] = [];
  private _dhClient: wasmCryptoppJs.DiffieHellmanClientJs;
  private _aesSymmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;

  private _publicKey?: string;
  private _ivValue?: string;
  private _sharedSecret?: string;

  private _onLogging: (inLogMsg: string) => void;


  constructor(inCommunication: ICommunication, inOnLogging: (inLogMsg: string) => void) {

    this._communication = inCommunication;
    this._onLogging = inOnLogging;

    const wasmModule = CrytpoppWasmModule.get();

    this._dhClient = new wasmModule.DiffieHellmanClientJs();
    this._aesSymmetricCipher = new wasmModule.AesSymmetricCipherJs();

    this._communication.onReceive((inMsg: string) => {
      this._processReceivedMessage(inMsg);
    });
  }

  delete() {
    this._dhClient.delete();
    this._aesSymmetricCipher.delete();
    this._wasDeleted = true;
  }

  private _processReceivedMessage(inText: string) {

    if (this._wasDeleted)
      throw new Error("was deleted");

    const jsonMsg = JSON.parse(inText);

    if (!isMessage(jsonMsg))
      throw new Error("received message structure unrecognized");

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

        if (!isSecurityRequestPayload(jsonPayload))
          throw new Error("received message security request payload unrecognized");

        this._ivValue = jsonPayload.ivValue;

        this._generateDiffieHellmanKeys();

        this._initializeAesSymmetricCipher(jsonPayload.publicKey);

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

        if (this._EncryptedCommunicationState !== EncryptedCommunicationState.initiated)
          throw new Error("was expecting a security response");

        this._log("computing the shared secret with the received public key");

        const jsonPayload = JSON.parse(jsonMsg.payload);

        if (!isSecurityResponsePayload(jsonPayload))
          throw new Error("received message security response payload unrecognized");

        this._initializeAesSymmetricCipher(jsonPayload.publicKey);

        this._log("connection now confirmed secure");

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        break;
      }
      default:
        throw new Error(`received message type unsupported, type: "${jsonMsg.type}"`);
    }

  }

  makeSecure() {

    if (this._wasDeleted)
      throw new Error("was deleted");

    this._log("now securing the connection");

    this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

    this._generateDiffieHellmanKeys();

    const wasmModule = CrytpoppWasmModule.get();
    const prng = new wasmModule.AutoSeededRandomPoolJs();
    this._ivValue = prng.getRandomHexStr(16);
    prng.delete();

    const payload = JSON.stringify({
      publicKey: this._publicKey,
      ivValue: this._ivValue,
    });

    this._communication.send(JSON.stringify({ type: MessageTypes.SecurityRequest, payload }));
  }

  send(inText: string): void {

    if (this._wasDeleted)
      throw new Error("was deleted");

    if (this._EncryptedCommunicationState === EncryptedCommunicationState.initiated)
      throw new Error("cannot send while securing the connection");


    if (this._EncryptedCommunicationState === EncryptedCommunicationState.unencrypted) {

      this._log(`[unencrypted] sending a message:`);
      this._log(`[unencrypted] "${inText}"`);

      this._communication.send(JSON.stringify({ type: MessageTypes.PlainMessage, payload: (inText) }));
    } else {

      this._log(`[encrypted] sending a message:`);
      this._log(`[encrypted] "${inText}"`);

      this._log(`[encrypted] encrypting`);
      const startTime = Date.now();

      const wasmModule = CrytpoppWasmModule.get();
      const textAshex = wasmModule.utf8ToHex(inText);
      const encrypted = this._aesSymmetricCipher.encryptFromHexStrAsHexStr(textAshex);

      const endTime = Date.now();
      this._log(`[encrypted] encrypted (${endTime - startTime}ms)`);

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

  private _log(inLogMsg: string) {
    if (this._onLogging)
      this._onLogging(inLogMsg);
  }

  private _generateDiffieHellmanKeys() {

    this._log("------------------------------------");
    this._log("Diffie Hellman Key Exchange");
    this._log("generating public/private keys");
    this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");
    const startTime = Date.now();

    this._dhClient.generateKeys(localP, localQ, localG);
    this._publicKey = this._dhClient.getPublicKeyAsHexStr();

    const endTime = Date.now();
    this._log(`generated public/private keys (${endTime - startTime}ms)`);
    this._log("------------------------------------");
  }

  private _initializeAesSymmetricCipher(publicKey: string) {

    this._dhClient.computeSharedSecretFromHexStr(publicKey);
    this._sharedSecret = this._dhClient.getSharedSecretAsHexStr();

    this._log("------------------------------------");
    this._log("AES Symmetric Cipher");
    this._log("initializing");
    this._log("256bits key from computed shared secret");
    const startTime = Date.now();

    this._aesSymmetricCipher.initializeFromHexStr(
      this._sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
      this._ivValue!,
    );

    const endTime = Date.now();
    this._log(`initialized (${endTime - startTime}ms)`);
    this._log("------------------------------------");
  }

};

