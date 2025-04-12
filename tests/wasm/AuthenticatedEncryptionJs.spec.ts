
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

describe("AuthenticatedEncryptionJs.spec", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("can encrypt and then decrypt payload with same key", () => {

    test('same cipher', async () => {

      //
      // SETUP
      //

      const prng = new wasmModule.AutoSeededRandomPoolJs();
      const keyHexStr = prng.getRandomHexStr(16);
      const ivHexStr = prng.getRandomHexStr(13);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipher = new wasmModule!.AuthenticatedEncryptionJs();
      cipher.initializeFromHexStr(keyHexStr);

      //
      // ENCRYPT
      //

      const payloadStr = "Hello from JavaScript!";
      const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

      const encodedHexStr =  cipher.encryptFromHexStrAsHexStr(payloadHexStr, ivHexStr);

      expect(encodedHexStr).not.toEqual(payloadStr);
      expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

      //
      // DECRYPT
      //

      const decodedHexStr = cipher.decryptFromHexStrAsHexStr(encodedHexStr, payloadStr.length, ivHexStr);

      expect(decodedHexStr).not.toEqual(null);

      const recovered = wasmModule.hexToUtf8(decodedHexStr!);

      expect(recovered).toEqual(payloadStr);

      //
      // DEALLOCATE
      //

      cipher.delete();

    });

    test('two ciphers', async () => {

      //
      // SETUP
      //

      const prng = new wasmModule.AutoSeededRandomPoolJs();
      const keyHexStr = prng.getRandomHexStr(16);
      const ivHexStr = prng.getRandomHexStr(13);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipherA = new wasmModule!.AuthenticatedEncryptionJs();
      const cipherB = new wasmModule!.AuthenticatedEncryptionJs();

      cipherA.initializeFromHexStr(keyHexStr);
      cipherB.initializeFromHexStr(keyHexStr);

      //
      // ENCRYPT
      //

      const payloadStr = "Hello from JavaScript!";
      const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

      const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr, ivHexStr);

      expect(encodedHexStr).not.toEqual(payloadStr);
      expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

      //
      // DECRYPT
      //

      const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr, payloadStr.length, ivHexStr);

      expect(decodedHexStr).not.toEqual(null);

      const recovered = wasmModule.hexToUtf8(decodedHexStr!);

      expect(recovered).toEqual(payloadStr);

      //
      // DEALLOCATE
      //

      cipherA.delete();
      cipherB.delete();

    });

    test('two ciphers multiple times', async () => {

      //
      // SETUP
      //

      const prng = new wasmModule.AutoSeededRandomPoolJs();
      const keyHexStr = prng.getRandomHexStr(16);
      const ivHexStr = prng.getRandomHexStr(13);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipherA = new wasmModule!.AuthenticatedEncryptionJs();
      const cipherB = new wasmModule!.AuthenticatedEncryptionJs();

      cipherA.initializeFromHexStr(keyHexStr);
      cipherB.initializeFromHexStr(keyHexStr);

      //
      //

      for (let ii = 0; ii < 5; ++ii) {

        //
        // ENCRYPT
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr, ivHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr, payloadStr.length, ivHexStr);

        expect(decodedHexStr).not.toEqual(null);

        const recovered = wasmModule.hexToUtf8(decodedHexStr!);

        expect(recovered).toEqual(payloadStr);

      }

      //
      // DEALLOCATE
      //

      cipherA.delete();
      cipherB.delete();

    });

    test('two ciphers swap roles multiple times', async () => {

      //
      // SETUP
      //

      const prng = new wasmModule.AutoSeededRandomPoolJs();
      const keyHexStr = prng.getRandomHexStr(16);
      const ivHexStr = prng.getRandomHexStr(13);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipherA = new wasmModule!.AuthenticatedEncryptionJs();
      const cipherB = new wasmModule!.AuthenticatedEncryptionJs();

      cipherA.initializeFromHexStr(keyHexStr);
      cipherB.initializeFromHexStr(keyHexStr);

      //
      //

      for (let ii = 0; ii < 5; ++ii) {

        //
        // ENCRYPT
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr, ivHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr, payloadStr.length, ivHexStr);

        expect(decodedHexStr).not.toEqual(null);

        const recovered = wasmModule.hexToUtf8(decodedHexStr!);

        expect(recovered).toEqual(payloadStr);

      }


      for (let ii = 0; ii < 5; ++ii) {

        //
        // ENCRYPT
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const encodedHexStr =  cipherB.encryptFromHexStrAsHexStr(payloadHexStr, ivHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherA.decryptFromHexStrAsHexStr(encodedHexStr, payloadStr.length, ivHexStr);

        expect(decodedHexStr).not.toEqual(null);

        const recovered = wasmModule.hexToUtf8(decodedHexStr!);

        expect(recovered).toEqual(payloadStr);

      }


      for (let ii = 0; ii < 5; ++ii) {

        //
        // ENCRYPT
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr, ivHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr, payloadStr.length, ivHexStr);

        expect(decodedHexStr).not.toEqual(null);

        const recovered = wasmModule.hexToUtf8(decodedHexStr!);

        expect(recovered).toEqual(payloadStr);

      }

      //
      // DEALLOCATE
      //

      cipherA.delete();
      cipherB.delete();

    });

    test('cipher decrypt garbage', async () => {

      //
      // SETUP
      //

      const prng = new wasmModule.AutoSeededRandomPoolJs();
      const keyHexStr = prng.getRandomHexStr(16);
      const ivHexStr = prng.getRandomHexStr(13);
      const garbageHexStr = prng.getRandomHexStr(128);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipher = new wasmModule!.AuthenticatedEncryptionJs();

      cipher.initializeFromHexStr(keyHexStr);

      //
      // DECRYPT
      //

      let errorWasCaught = false;

      try {
        cipher.decryptFromHexStrAsHexStr(garbageHexStr, 128, ivHexStr);
      } catch (err) {
        const errMsg = wasmModule!.getExceptionMessage(err);
        // expect(errMsg).toEqual("StreamTransformationFilter: invalid PKCS #7 block padding found");
        expect(errMsg).toEqual("AES/CCM: message length doesn't match that given in SpecifyDataLengths");
        errorWasCaught = true;
      }

      expect(errorWasCaught).toEqual(true);

      //
      // DEALLOCATE
      //

      cipher.delete();

    });

  });

});

