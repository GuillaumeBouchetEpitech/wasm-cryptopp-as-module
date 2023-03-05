
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule } from "../../../_common";

//
//
//

// RFC 5114, 1024-bit MODP Group with 160-bit Prime Order Subgroup
// http://tools.ietf.org/html/rfc5114#section-2.1

const localP = [
  "0xB10B8F96A080E01DDE92DE5EAE5D54EC52C99FBCFB06A3C6",
  "9A6A9DCA52D23B616073E28675A23D189838EF1E2EE652C0",
  "13ECB4AEA906112324975C3CD49B83BFACCBDD7D90C4BD70",
  "98488E9C219A73724EFFD6FAE5644738FAA31A4FF55BCCC0",
  "A151AF5F0DC8B4BD45BF37DF365C1A65E68CFDA76D4DA708",
  "DF1FB2BC2E4A4371"
].join("");

const localQ = "0xF518AA8781A8DF278ABA4E7D64B7CB9D49462353";

const localG = [
  "0xA4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507F",
  "D6406CFF14266D31266FEA1E5C41564B777E690F5504F213",
  "160217B4B01B886A5E91547F9E2749F4D7FBD7D3B9A92EE1",
  "909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28A",
  "D662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24",
  "855E6EEB22B3B2E5"
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
export const isSecurityPayload = (inValue: any): inValue is SecurityPayload => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.publicKey) === 'string' &&
    typeof(inValue.ivValue) === 'string'
  )
}

export class SecureClient implements ICommunication {

  private _wasDeleted = false;

  private readonly _communication: ICommunication;
  private _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
  private _callbacks: onReceiveCallback[] = [];
  private _dhClient: wasmCryptoppJs.DiffieHellmanClientJs;
  private _symmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;

  private _publicKey?: string;
  private _ivValue?: string;
  private _sharedSecret?: string;

  private _onLogging: (inLogMsg: string) => void;


  constructor(inCommunication: ICommunication, inOnLogging: (inLogMsg: string) => void) {

    this._communication = inCommunication;
    this._onLogging = inOnLogging;

    const wasmModule = CrytpoppWasmModule.get();

    this._dhClient = new wasmModule.DiffieHellmanClientJs();
    this._symmetricCipher = new wasmModule.AesSymmetricCipherJs();

    this._communication.onReceive((inMsg: string) => {
      this._processReceivedMessage(inMsg);
    });
  }

  delete() {
    this._dhClient.delete();
    this._symmetricCipher.delete();
    this._wasDeleted = true;
  }

  private _log(inLogMsg: string) {
    if (this._onLogging)
      this._onLogging(inLogMsg);
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
        this._callbacks.forEach((callback) => callback(jsonMsg.payload));
        break;
      }
      case MessageTypes.EncryptedMessage:
      {
        this._log("decrypting message");

        const recovered = this._symmetricCipher.decryptFromHexStrAsHexStr(jsonMsg.payload);

        if (this._EncryptedCommunicationState === EncryptedCommunicationState.ready) {
          this._log("connection now confirmed secure");
          this._EncryptedCommunicationState = EncryptedCommunicationState.confirmed;
        }
        else if (this._EncryptedCommunicationState !== EncryptedCommunicationState.confirmed) {
          throw new Error("was expecting to be in a secure state");
        }

        const wasmModule = CrytpoppWasmModule.get();
        const plainText = wasmModule.hexToUtf8(recovered);

        this._log("message decrypted");

        this._callbacks.forEach((callback) => callback(plainText));
        break;
      }
      case MessageTypes.SecurityRequest:
      {
        this._log("now securing the connection");

        this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

        const jsonPayload = JSON.parse(jsonMsg.payload);

        if (!isSecurityPayload(jsonPayload))
          throw new Error("received message security payload unrecognized");

        this._ivValue = jsonPayload.ivValue;

        this._dhClient.generateKeys(localP, localQ, localG);

        this._log("generating public/private keys");

        this._publicKey = this._dhClient.getPublicKeyAsHexStr();
        this._dhClient.computeSharedSecretFromHexStr(jsonPayload.publicKey);

        this._log("computing the shared secret with the received public key");

        this._sharedSecret = this._dhClient.getSharedSecretAsHexStr();

        this._log("initializing aes symmetric cipher with computed shared secret");

        this._symmetricCipher.initializeFromHexStr(
          this._sharedSecret.slice(0, 32),
          this._ivValue,
        );

        this._log("sending public key");

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        this._communication.send(JSON.stringify({ type: MessageTypes.SecurityResponse, payload: this._publicKey }));

        break;
      }
      case MessageTypes.SecurityResponse:
      {
        this._log("processing received security response");

        if (this._EncryptedCommunicationState !== EncryptedCommunicationState.initiated)
          throw new Error("was expecting a security response");

        this._log("computing the shared secret with the received public key");

        this._dhClient.computeSharedSecretFromHexStr(jsonMsg.payload);
        this._sharedSecret = this._dhClient.getSharedSecretAsHexStr();

        this._log("initializing aes symmetric cipher with computed shared secret");

        this._symmetricCipher.initializeFromHexStr(
          this._sharedSecret.slice(0, 32),
          this._ivValue!,
        );

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

    this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

    this._dhClient.generateKeys(localP, localQ, localG);
    this._publicKey = this._dhClient.getPublicKeyAsHexStr();


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

      const wasmModule = CrytpoppWasmModule.get();
      const textAshex = wasmModule.utf8ToHex(inText);

      const encrypted = this._symmetricCipher.encryptFromHexStrAsHexStr(textAshex);

      this._communication.send(JSON.stringify({ type: MessageTypes.EncryptedMessage, payload: encrypted }));
    }

  }

  onReceive(inCallback: onReceiveCallback): void {

    if (this._wasDeleted)
      throw new Error("was deleted");

    this._callbacks.push(inCallback);
  }

  get EncryptedCommunicationState() {

    if (this._wasDeleted)
      throw new Error("was deleted");

    return this._EncryptedCommunicationState;
  }

};

