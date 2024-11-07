
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

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

class TestClient {

  public _data: TestClientData = {};

  private _prng?: wasmCryptoppJs.HashDrbgRandomGeneratorJs;
  private _privateKey?: wasmCryptoppJs.RSAPrivateKeyJs;
  private _publicKey?: wasmCryptoppJs.RSAPublicKeyJs;
  private _dhClient?: wasmCryptoppJs.DiffieHellmanClientJs;
  private _cipher?: wasmCryptoppJs.AesSymmetricCipherJs;

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

  setupEncryption_step1(inputPassword: string) {

    this._data.password = inputPassword;

    // derive a bigger key from password (300bytes)

    const mySalt = "my salt";
    const myInfo = "my info";
    const k_size = 128 + 128 + 128 + 32;

    this._data.derivedKey = wasmModule.deriveSha256HexStrKeyFromHexStrData(
      this._data.password, mySalt, myInfo, k_size
    );

    // use derived key deterministic random generator

    this._data.entropy /*****/ = this._data.derivedKey.slice(128 * 0, 128 * 1);
    this._data.nonce /*******/ = this._data.derivedKey.slice(128 * 1, 128 * 2);
    this._data.personalization = this._data.derivedKey.slice(128 * 2, 128 * 3);
    this._data.ivValue /*****/ = this._data.derivedKey.slice(128 * 3, 128 * 3 + 32);

    if (this._prng) {
      this._prng.delete();
      this._prng = undefined;
    }

    this._prng = new wasmModule.HashDrbgRandomGeneratorJs(this._data.entropy, this._data.nonce, this._data.personalization);

    // generate private/public RSA keys
    // -> rely on the deterministic random generator

    if (this._privateKey) {
      this._privateKey.delete();
      this._privateKey = undefined;
    }
    this._privateKey = new wasmModule.RSAPrivateKeyJs();
    this._privateKey.generateRandomWithKeySizeUsingHashDrbg(this._prng, 3072);
    this._data.privateKeyPem = this._privateKey.getAsPemString();

    if (this._publicKey) {
      this._publicKey.delete();
      this._publicKey = undefined;
    }
    this._publicKey = new wasmModule.RSAPublicKeyJs();
    this._publicKey.setFromPrivateKey(this._privateKey);
    this._data.publicKeyPem = this._privateKey.getAsPemString();

    // start a Diffie Hellman client

    if (this._dhClient) {
      this._dhClient.delete();
      this._dhClient = undefined;
    }
    this._dhClient = new wasmModule.DiffieHellmanClientJs();
    this._dhClient.generateRandomKeysSimpler();
    this._data.dhPublicKey = this._dhClient.getPublicKeyAsHexStr();

    this._data.dhSignedPublicKey = this._privateKey.signFromHexStrToHexStrUsingHashDrbg(this._prng, this._data.dhPublicKey);
    return this._data.dhSignedPublicKey;
  }

  syncWithOtherClient_step2(otherClientSignedPublicKey: string) {
    if (!this._publicKey) {
      throw new Error(`no _publicKey yet`);
    }
    if (!this._dhClient) {
      throw new Error(`no _dhClient yet`);
    }
    if (!this._data.ivValue) {
      throw new Error(`no _data.ivValue yet`);
    }

    const otherClientPublicKey = this._publicKey.verifyFromHexStrToHexStr(otherClientSignedPublicKey);

    this._dhClient.computeSharedSecretFromHexStr(otherClientPublicKey);

    this._data.sharedSecret = this._dhClient.getSharedSecretAsHexStr();

    const actualKey = this._data.sharedSecret.substr(0, 64);

    if (this._cipher) {
      this._cipher.delete();
      this._cipher = undefined;
    }
    this._cipher = new wasmModule.AesSymmetricCipherJs();
    this._cipher.initializeFromHexStr(actualKey, this._data.ivValue);
  }

  getSignedPublicKeyAsHexStr(): string {
    if (!this._data.dhSignedPublicKey) {
      throw new Error(`no _data.dhSignedPublicKey yet`);
    }
    return this._data.dhSignedPublicKey;
  }

  encryptStrToHexStr(message: string): string
  {
    if (!this._cipher) {
      throw new Error(`no _cipher yet`);
    }
    const hexMessage = wasmModule.utf8ToHex(message);
    const encryptedHexStr = this._cipher!.encryptFromHexStrAsHexStr(hexMessage);
    return encryptedHexStr;
  }

  decryptHexStrToStr(encryptedHexStr: string): string
  {
    if (!this._cipher) {
      throw new Error(`no _cipher yet`);
    }
    const decryptedHexStr = this._cipher!.decryptFromHexStrAsHexStr(encryptedHexStr);
    const decryptedMessage = wasmModule.hexToUtf8(decryptedHexStr);
    return decryptedMessage;
  }



};

describe("StationToStationProtocol.spec", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("success", () => {

    test('communicate and reset the keys mid-communication', async () => {

      const clientA = new TestClient();
      const clientB = new TestClient();

      const passwordA = "pineapple";
      const passwordB = "pen";

      //
      //
      // use passwordA to setup both client
      // -> this should work
      //
      //

      clientA.setupEncryption_step1(passwordA);
      clientB.setupEncryption_step1(passwordA);

      // equals (-> the determistic data that is never shared)
      expect(clientA._data.password).toEqual(passwordA);
      expect(clientB._data.password).toEqual(passwordA);
      expect(clientA._data.derivedKey).toEqual(clientB._data.derivedKey);
      // not equals
      expect(clientA._data.dhPublicKey).not.toEqual(clientB._data.dhPublicKey);
      expect(clientA._data.dhSignedPublicKey).not.toEqual(clientB._data.dhSignedPublicKey);

      clientA.syncWithOtherClient_step2(clientB.getSignedPublicKeyAsHexStr());
      clientB.syncWithOtherClient_step2(clientA.getSignedPublicKeyAsHexStr());

      // equals
      expect(clientA._data.sharedSecret).toEqual(clientB._data.sharedSecret);

      //

      {
        const message = "clientA want to say Hi to clientB";

        const encryptedHexStr = clientA.encryptStrToHexStr(message);
        const decryptedMessage = clientB.decryptHexStrToStr(encryptedHexStr);

        expect(message).toEqual(decryptedMessage);
      }

      //

      {
        const message = "clientB want to reply Hi to clientA";

        const encryptedHexStr = clientB.encryptStrToHexStr(message);
        const decryptedMessage = clientA.decryptHexStrToStr(encryptedHexStr);

        expect(message).toEqual(decryptedMessage);
      }

      //
      //
      // use passwordA AGAIN to setup both client
      // -> this should work and have some data similar to the first try
      //
      //

      const backupTest1ClientA = JSON.parse(JSON.stringify(clientA._data)) as TestClientData; // dirty copy
      const backupTest1ClientB = JSON.parse(JSON.stringify(clientB._data)) as TestClientData; // dirty copy

      clientA.setupEncryption_step1(passwordA);
      clientB.setupEncryption_step1(passwordA);

      // equals (-> the determistic data that is never shared)
      expect(clientA._data.password).toEqual(passwordA);
      expect(clientB._data.password).toEqual(passwordA);
      expect(clientA._data.derivedKey).toEqual(clientB._data.derivedKey);
      // not equals
      expect(clientA._data.dhPublicKey).not.toEqual(clientB._data.dhPublicKey);
      expect(clientA._data.dhSignedPublicKey).not.toEqual(clientB._data.dhSignedPublicKey);

      clientA.syncWithOtherClient_step2(clientB.getSignedPublicKeyAsHexStr());
      clientB.syncWithOtherClient_step2(clientA.getSignedPublicKeyAsHexStr());

      // equals
      expect(clientA._data.sharedSecret).toEqual(clientB._data.sharedSecret);

      //

      {
        const message = "clientA want to say Hi to clientB";

        const encryptedHexStr = clientA.encryptStrToHexStr(message);
        const decryptedMessage = clientB.decryptHexStrToStr(encryptedHexStr);

        expect(message).toEqual(decryptedMessage);
      }

      //

      {
        const message = "clientB want to reply Hi to clientA";

        const encryptedHexStr = clientB.encryptStrToHexStr(message);
        const decryptedMessage = clientA.decryptHexStrToStr(encryptedHexStr);

        expect(message).toEqual(decryptedMessage);
      }

      // equals (-> the determistic data that is never shared)
      expect(clientA._data.password).toEqual(backupTest1ClientA.password);
      expect(clientB._data.password).toEqual(backupTest1ClientB.password);
      expect(clientA._data.derivedKey).toEqual(backupTest1ClientA.derivedKey);
      expect(clientB._data.derivedKey).toEqual(backupTest1ClientB.derivedKey);
      // not equals (-> the new password)
      expect(clientA._data.dhPublicKey).not.toEqual(backupTest1ClientA.dhPublicKey);
      expect(clientB._data.dhPublicKey).not.toEqual(backupTest1ClientB.dhPublicKey);
      expect(clientA._data.dhSignedPublicKey).not.toEqual(backupTest1ClientA.dhSignedPublicKey);
      expect(clientB._data.dhSignedPublicKey).not.toEqual(backupTest1ClientB.dhSignedPublicKey);
      expect(clientA._data.sharedSecret).not.toEqual(backupTest1ClientA.sharedSecret);
      expect(clientB._data.sharedSecret).not.toEqual(backupTest1ClientB.sharedSecret);

      //
      //
      //
      //
      //

      //
      //
      // use passwordB to setup both client
      // -> this should work but not have any data similar to the previous two tries
      //
      //

      const backupTest2ClientA = JSON.parse(JSON.stringify(clientA._data)) as TestClientData;
      const backupTest2ClientB = JSON.parse(JSON.stringify(clientB._data)) as TestClientData;

      clientA.setupEncryption_step1(passwordB);
      clientB.setupEncryption_step1(passwordB);

      // equals
      expect(clientA._data.password).toEqual(passwordB);
      expect(clientB._data.password).toEqual(passwordB);
      expect(clientA._data.derivedKey).toEqual(clientB._data.derivedKey);
      // not equals
      expect(clientA._data.dhPublicKey).not.toEqual(clientB._data.dhPublicKey);
      expect(clientA._data.dhSignedPublicKey).not.toEqual(clientB._data.dhSignedPublicKey);

      // simplified here
      // but in reality:
      // => clientA send the [SignedPublicKeyAsHexStr] to clientB
      // => clientB send the [SignedPublicKeyAsHexStr] to clientA
      clientA.syncWithOtherClient_step2(clientB.getSignedPublicKeyAsHexStr());
      clientB.syncWithOtherClient_step2(clientA.getSignedPublicKeyAsHexStr());

      // equals
      expect(clientA._data.sharedSecret).toEqual(clientB._data.sharedSecret);

      //

      {
        const message = "clientA want to say Hi to clientB";

        const encryptedHexStr = clientA.encryptStrToHexStr(message);
        const decryptedMessage = clientB.decryptHexStrToStr(encryptedHexStr);

        expect(message).toEqual(decryptedMessage);
      }

      //

      {
        const message = "clientB want to reply Hi to clientA";

        const encryptedHexStr = clientB.encryptStrToHexStr(message);
        const decryptedMessage = clientA.decryptHexStrToStr(encryptedHexStr);

        expect(message).toEqual(decryptedMessage);
      }

      // not equals (test1 data with current data using new password)
      expect(clientA._data.password).not.toEqual(backupTest1ClientA.password);
      expect(clientB._data.password).not.toEqual(backupTest1ClientB.password);
      expect(clientA._data.derivedKey).not.toEqual(backupTest1ClientA.derivedKey);
      expect(clientB._data.derivedKey).not.toEqual(backupTest1ClientB.derivedKey);
      expect(clientA._data.dhPublicKey).not.toEqual(backupTest1ClientA.dhPublicKey);
      expect(clientB._data.dhPublicKey).not.toEqual(backupTest1ClientB.dhPublicKey);
      expect(clientA._data.dhSignedPublicKey).not.toEqual(backupTest1ClientA.dhSignedPublicKey);
      expect(clientB._data.dhSignedPublicKey).not.toEqual(backupTest1ClientB.dhSignedPublicKey);
      expect(clientA._data.sharedSecret).not.toEqual(backupTest1ClientA.sharedSecret);
      expect(clientB._data.sharedSecret).not.toEqual(backupTest1ClientB.sharedSecret);

      // not equals (test2 data with current data using new password)
      expect(clientA._data.password).not.toEqual(backupTest2ClientA.password);
      expect(clientB._data.password).not.toEqual(backupTest2ClientB.password);
      expect(clientA._data.derivedKey).not.toEqual(backupTest2ClientA.derivedKey);
      expect(clientB._data.derivedKey).not.toEqual(backupTest2ClientB.derivedKey);
      expect(clientA._data.dhPublicKey).not.toEqual(backupTest2ClientA.dhPublicKey);
      expect(clientB._data.dhPublicKey).not.toEqual(backupTest2ClientB.dhPublicKey);
      expect(clientA._data.dhSignedPublicKey).not.toEqual(backupTest2ClientA.dhSignedPublicKey);
      expect(clientB._data.dhSignedPublicKey).not.toEqual(backupTest2ClientB.dhSignedPublicKey);
      expect(clientA._data.sharedSecret).not.toEqual(backupTest2ClientA.sharedSecret);
      expect(clientB._data.sharedSecret).not.toEqual(backupTest2ClientB.sharedSecret);

      //
      //
      //
      //
      //




    });

  });
});

