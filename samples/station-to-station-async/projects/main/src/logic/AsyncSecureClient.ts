
import wasmCryptoppJs from "wasmCryptoppJs";

import { CrytpoppWasmModule, asyncSleep } from "@local-framework";

import { ICommunication, onReceiveCallback } from "./internals/FakeWebSocket";

// import { DiffieHellmanWorker } from "./internals/DiffieHellmanWorker";

import { EncryptedCommunicationState, isMessage, isSecurityRequestPayload, isSecurityResponsePayload, MessageTypes, SecurityPayload } from "./internals/Messaging";

// import { getRandomHexStr } from "./internals/getRandomHexStr";
import { printHexadecimalStrings } from "./internals/printHexadecimalStrings";
// import { profileScope } from "./internals/profileScope";

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

const password = "pineapple";

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

//
//
//

interface TestClientData {

  password?: string;

  derivedKey?: string;

  entropy?: string;
  nonce?: string;
  personalization?: string;
  ivValue?: string;

  privateKeyPem?: string;
  publicKeyPem?: string;

  dhPublicKey?: string;
  dhSignedPublicKey?: string;
  sharedSecret?: string;
};

export class AsyncSecureClient {

  public _data: TestClientData = {};

  private _wasDeleted = false;

  private readonly _communication: ICommunication;
  private _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
  private _onReceiveCallbacks: onReceiveCallback[] = [];
  private _onLogging: onLogCallback;

  // private _publicKey?: string;
  // private _ivValue?: string;
  // private _sharedSecret?: string;


  private _prng?: wasmCryptoppJs.HashDrbgRandomGeneratorJs;
  private _privateKey?: wasmCryptoppJs.RSAPrivateKeyJs;
  private _publicKey?: wasmCryptoppJs.RSAPublicKeyJs;
  private _dhClient?: wasmCryptoppJs.DiffieHellmanClientJs;
  // private _workerObtainCipherKey: DiffieHellmanWorker | undefined;
  private _cipher?: wasmCryptoppJs.AesSymmetricCipherJs;

  // private _aesSymmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;

  constructor(inCommunication: ICommunication, inOnLogging: onLogCallback) {
    this._communication = inCommunication;
    this._onLogging = inOnLogging;

    // const wasmModule = CrytpoppWasmModule.get();

    // this._aesSymmetricCipher = new wasmModule.AesSymmetricCipherJs();

    this._communication.onReceive(async (inMsg: string) => {
      await this._processReceivedMessage(inMsg);
    });
  }

  // async initialize(): Promise<void> {
  //   await this._initializeDiffieHellmanWorker();
  // }

  delete() {

    if (this._prng) {
      this._prng.delete();
      this._prng = undefined;
    }
    if (this._privateKey) {
      this._privateKey.delete();
      this._privateKey = undefined;
    }
    if (this._publicKey) {
      this._publicKey.delete();
      this._publicKey = undefined;
    }
    if (this._dhClient) {
      this._dhClient.delete();
      this._dhClient = undefined;
    }
    if (this._cipher) {
      this._cipher.delete();
      this._cipher = undefined;
    }
  }

  async setupEncryption(inputPassword: string) {

    const wasmModule = CrytpoppWasmModule.get();

    {
      this._log("------------------------------------");
      this._log(`Derive Sha256 hash`);
      this._log(`(from password "${inputPassword}")`);
      this._log(`Deriving`);
      const startTime = Date.now();

      this._data.password = inputPassword;

      // derive a bigger key from password (300bytes)

      const mySalt = "my salt";
      const myINfo = "my info";
      const k_size = 332;

      this._data.derivedKey = wasmModule.deriveSha256HexStrKeyFromHexStrData(
        this._data.password, mySalt, myINfo, k_size
      );

      const endTime = Date.now();
      printHexadecimalStrings(this._log.bind(this), this._data.derivedKey, 64);
      this._log(`Derived (${endTime - startTime}ms)`);

      this._log(`using derived hash for future input values`);
      this._data.entropy = this._data.derivedKey.slice(0, 100);
      this._data.nonce = this._data.derivedKey.slice(100, 200);
      this._data.personalization = this._data.derivedKey.slice(200, 300);
      this._data.ivValue = this._data.derivedKey.slice(300, 332);
      this._log(`entropy`);
      printHexadecimalStrings(this._log.bind(this), this._data.entropy, 64);
      this._log(`nonce`);
      printHexadecimalStrings(this._log.bind(this), this._data.nonce, 64);
      this._log(`personalization`);
      printHexadecimalStrings(this._log.bind(this), this._data.personalization, 64);
      this._log(`ivValue`);
      printHexadecimalStrings(this._log.bind(this), this._data.ivValue, 64);

      this._log("------------------------------------");
    }

    // use derived key deterministic random generator

    {
      this._log("------------------------------------");
      this._log(`Build the Hash Drbg Random Generator`);
      this._log(`(will use previously derived entropy, nonce, personalization)`);
      this._log(`Building`);
      const startTime = Date.now();

      if (this._prng) {
        this._prng.delete();
        this._prng = undefined;
      }

      this._prng = new wasmModule.HashDrbgRandomGeneratorJs(this._data.entropy, this._data.nonce, this._data.personalization);

      const endTime = Date.now();
      this._log(`Built (${endTime - startTime}ms)`);
      this._log("------------------------------------");
    }

    // use random generator to generate private/public RSA keys

    {
      this._log("------------------------------------");
      this._log("Generate random RSA private key of 3072 bytes");
      this._log(`(will use the previously setup Hash Drbg Random Generator)`);
      this._log(`Building`);

      await asyncSleep(10);

      const startTime = Date.now();

      if (this._privateKey) {
        this._privateKey.delete();
        this._privateKey = undefined;
      }
      this._privateKey = new wasmModule.RSAPrivateKeyJs();
      this._privateKey.generateRandomWithKeySizeUsingHashDrbg(this._prng, 3072);
      this._data.privateKeyPem = this._privateKey.getAsPemString();

      const endTime = Date.now();
      this._log(`Built (${endTime - startTime}ms)`);
      this._log("------------------------------------");
    }

    {
      this._log("------------------------------------");
      this._log("Generate random RSA public key");
      this._log(`(will use the previously setup RSA private key)`);
      this._log(`Building`);
      const startTime = Date.now();

      if (this._publicKey) {
        this._publicKey.delete();
        this._publicKey = undefined;
      }
      this._publicKey = new wasmModule.RSAPublicKeyJs();
      this._publicKey.setFromPrivateKey(this._privateKey);
      this._data.publicKeyPem = this._privateKey.getAsPemString();

      const endTime = Date.now();
      this._log(`Built (${endTime - startTime}ms)`);
      this._log("------------------------------------");
    }
  }

  async startEncryption_step1()
  {
    if (!this._prng) {
      throw new Error(`no _prng yet`);
    }
    if (!this._privateKey) {
      throw new Error(`no _privateKey yet`);
    }

    const wasmModule = CrytpoppWasmModule.get();

    // start a Diffie Hellman client

    {
      this._log("------------------------------------");
      this._log("Diffie Hellman Key Exchange");
      this._log("generating public/private keys");
      this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");

      await asyncSleep(10);

      const startTime = Date.now();

      if (this._dhClient) {
        this._dhClient.delete();
        this._dhClient = undefined;
      }
      this._dhClient = new wasmModule.DiffieHellmanClientJs();
      this._dhClient.generateKeys(localP, localQ, localG);
      this._data.dhPublicKey = this._dhClient.getPublicKeyAsHexStr();

      const endTime = Date.now();
      this._log(`generated public/private keys (${endTime - startTime}ms)`);
      this._log("------------------------------------");
    }

    {
      this._log("------------------------------------");
      this._log("RSA private key signing");
      this._log("sign Diffie Hellman public key");

      await asyncSleep(10);

      const startTime = Date.now();

      this._data.dhSignedPublicKey = this._privateKey.signFromHexStrToHexStrUsingHashDrbg(this._prng, this._data.dhPublicKey);

      const endTime = Date.now();
      this._log(`signed Diffie Hellman public key (${endTime - startTime}ms)`);
      this._log("------------------------------------");
    }
  }

  getSignedPublicKeyAsHexStr(): string {
    if (!this._data.dhSignedPublicKey) {
      throw new Error(`no _data.dhSignedPublicKey yet`);
    }
    return this._data.dhSignedPublicKey;
  }

  async syncWithOtherClient_step2(otherClientSignedPublicKey: string) {
    if (!this._publicKey) {
      throw new Error(`no _publicKey yet`);
    }
    if (!this._dhClient) {
      throw new Error(`no _dhClient yet`);
    }
    if (!this._data.ivValue) {
      throw new Error(`no _data.ivValue yet`);
    }

    const wasmModule = CrytpoppWasmModule.get();

    const otherClientPublicKey = this._publicKey.verifyFromHexStrToHexStr(otherClientSignedPublicKey);

    {
      this._log("------------------------------------");
      this._log("Diffie Hellman Key Exchange");
      this._log("shared secret");
      this._log("computing");

      await asyncSleep(10);

      const startTime = Date.now();
      this._dhClient.computeSharedSecretFromHexStr(otherClientPublicKey);
      const endTime = Date.now();

      this._data.sharedSecret = this._dhClient.getSharedSecretAsHexStr();

      this._log(`computed (${endTime - startTime}ms)`);
      printHexadecimalStrings(this._log.bind(this), this._data.sharedSecret, 64);
      this._log("------------------------------------");
    }

    {
      this._log("------------------------------------");
      this._log("AES Symmetric Cipher");
      this._log(`(will use previously computed shared secret)`);
      this._log(`(will use previously derived ivValue)`);

      const actualKey = this._data.sharedSecret.slice(0, 64);
      this._log(`actual key used`);
      printHexadecimalStrings(this._log.bind(this), actualKey, 32);
      this._log(`actual iv value used`);
      printHexadecimalStrings(this._log.bind(this), this._data.ivValue, 32);

      this._log("initializing");

      await asyncSleep(10);

      const startTime = Date.now();

      if (this._cipher) {
        this._cipher.delete();
        this._cipher = undefined;
      }
      this._cipher = new wasmModule.AesSymmetricCipherJs();
      this._cipher.initializeFromHexStr(actualKey, this._data.ivValue);

      const endTime = Date.now();
      this._log(`initialized (${endTime - startTime}ms)`);
      this._log("------------------------------------");
    }

  }

  encryptStrToHexStr(message: string): string
  {
    if (!this._cipher) {
      throw new Error(`no _cipher yet`);
    }
    const wasmModule = CrytpoppWasmModule.get();
    const hexMessage = wasmModule.utf8ToHex(message);
    const encryptedHexStr = this._cipher!.encryptFromHexStrAsHexStr(hexMessage);
    return encryptedHexStr;
  }

  decryptHexStrToStr(encryptedHexStr: string): string
  {
    if (!this._cipher) {
      throw new Error(`no _cipher yet`);
    }
    const wasmModule = CrytpoppWasmModule.get();
    const decryptedHexStr = this._cipher!.decryptFromHexStrAsHexStr(encryptedHexStr);
    const decryptedMessage = wasmModule.hexToUtf8(decryptedHexStr);
    return decryptedMessage;
  }



  async makeSecure() {

    if (this._wasDeleted)
      throw new Error("was deleted");

    this._log("now securing the connection");

    this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;

    await this.setupEncryption(password);
    await this.startEncryption_step1();
    // this._generateDiffieHellmanKeys();

    // const wasmModule = CrytpoppWasmModule.get();
    // const prng = new wasmModule.AutoSeededRandomPoolJs();
    // this._ivValue = prng.getRandomHexStr(16);
    // prng.delete();

    const payloadObject: SecurityPayload = {
      signedPublicKey: this.getSignedPublicKeyAsHexStr()
    };

    const payloadStr = JSON.stringify(payloadObject);

    this._communication.send(JSON.stringify({ type: MessageTypes.SecurityRequest, payload: payloadStr }));
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

      // const wasmModule = CrytpoppWasmModule.get();
      // const textAshex = wasmModule.utf8ToHex(inText);
      // const encrypted = this._cipher!.encryptFromHexStrAsHexStr(textAshex);
      const encrypted = this.encryptStrToHexStr(inText);

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






  // private async _initializeDiffieHellmanWorker(): Promise<void> {
  //   this._workerObtainCipherKey = new DiffieHellmanWorker();
  //   await this._workerObtainCipherKey.initialize();
  // }

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

        // const recovered = this._cipher!.decryptFromHexStrAsHexStr(jsonMsg.payload);
        // const wasmModule = CrytpoppWasmModule.get();
        // const plainText = wasmModule.hexToUtf8(recovered);
        const plainText = this.decryptHexStrToStr(jsonMsg.payload);

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

        // this._ivValue = jsonPayload.ivValue;

        await this.setupEncryption(password);
        await this.startEncryption_step1();

        const payloadObject: SecurityPayload = {
          signedPublicKey: this.getSignedPublicKeyAsHexStr()
        };

        const payloadStr = JSON.stringify(payloadObject);

        await this.syncWithOtherClient_step2(jsonPayload.signedPublicKey);

        // await this._generateDiffieHellmanKeys();
        // await this._computeDiffieHellmanSharedSecret(jsonPayload.signedPublicKey);
        // await this._initializeAesSymmetricCipher();

        this._log("sending public key");

        this._EncryptedCommunicationState = EncryptedCommunicationState.ready;

        // const payload = JSON.stringify({
        //   // publicKey: this._publicKey,
        //   publicKey: this._publicKey,
        // });

        this._communication.send(JSON.stringify({ type: MessageTypes.SecurityResponse, payload: payloadStr }));

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

        await this.syncWithOtherClient_step2(jsonPayload.signedPublicKey);

        // await this._computeDiffieHellmanSharedSecret(jsonPayload.publicKey);
        // await this._initializeAesSymmetricCipher();

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

  // private async _generateDiffieHellmanKeys() {

  //   this._log("------------------------------------");
  //   this._log("Diffie Hellman Key Exchange");
  //   this._log("generating public/private keys");
  //   this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");

  //   if (!this._workerObtainCipherKey) {
  //     throw new Error("worker not initialized");
  //   }

  //   await this._workerObtainCipherKey.generateDiffieHellmanKeys();
  //   this._publicKey = this._workerObtainCipherKey.publicKey;

  //   this._log(`this._publicKey`);
  //   printHexadecimalStrings(this._log.bind(this), this._publicKey!, 64);

  //   // this._log(`generated public/private keys (${message.response.elapsedTime}ms)`);
  //   this._log("------------------------------------");
  // }

  // private async _computeDiffieHellmanSharedSecret(publicKey: string) {

  //   if (!this._workerObtainCipherKey) {
  //     throw new Error("worker not initialized");
  //   }

  //   this._log(`input publicKey`);
  //   printHexadecimalStrings(this._log.bind(this), publicKey, 64);

  //   await this._workerObtainCipherKey.computeDiffieHellmanSharedSecret(publicKey);
  //   this._sharedSecret = this._workerObtainCipherKey.sharedSecret;

  //   this._log(`this._sharedSecret`);
  //   printHexadecimalStrings(this._log.bind(this), this._sharedSecret!, 64);
  // }

  // private async _initializeAesSymmetricCipher() {

  //   if (!this._ivValue) {
  //     throw new Error("iv value not initialized");
  //   }
  //   if (!this._sharedSecret) {
  //     throw new Error("shared secret not initialized");
  //   }
  //   if (!this._workerObtainCipherKey) {
  //     throw new Error("worker not initialized");
  //   }

  //   this._log("------------------------------------");
  //   this._log("AES Symmetric Cipher");
  //   this._log("initializing");
  //   this._log("256bits key from computed shared secret");

  //   const startTime = Date.now();

  //   this._aesSymmetricCipher.initializeFromHexStr(
  //     this._sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
  //     this._ivValue,
  //   );

  //   const endTime = Date.now();
  //   this._log(`initialized (${endTime - startTime}ms)`);
  //   this._log("------------------------------------");
  // }

};
