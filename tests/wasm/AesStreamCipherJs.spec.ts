
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

describe("AesStreamCipherJs.spec", () => {

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
      const ivHexStr = prng.getRandomHexStr(16);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipher = new wasmModule!.AesStreamCipherJs();
      cipher.initializeFromHexStr(keyHexStr, ivHexStr);

      //
      // ENCRYPT
      //

      const payloadStr = "Hello from JavaScript!";
      const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

      const encodedHexStr =  cipher.encryptFromHexStrAsHexStr(payloadHexStr);

      expect(encodedHexStr).not.toEqual(payloadStr);
      expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

      //
      // DECRYPT
      //

      const decodedHexStr = cipher.decryptFromHexStrAsHexStr(encodedHexStr);

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
      const ivHexStr = prng.getRandomHexStr(16);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipherA = new wasmModule!.AesStreamCipherJs();
      const cipherB = new wasmModule!.AesStreamCipherJs();

      cipherA.initializeFromHexStr(keyHexStr, ivHexStr);
      cipherB.initializeFromHexStr(keyHexStr, ivHexStr);

      //
      // ENCRYPT
      //

      const payloadStr = "Hello from JavaScript!";
      const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

      const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr);

      expect(encodedHexStr).not.toEqual(payloadStr);
      expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

      //
      // DECRYPT
      //

      const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr);

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
      const ivHexStr = prng.getRandomHexStr(16);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipherA = new wasmModule!.AesStreamCipherJs();
      const cipherB = new wasmModule!.AesStreamCipherJs();

      cipherA.initializeFromHexStr(keyHexStr, ivHexStr);
      cipherB.initializeFromHexStr(keyHexStr, ivHexStr);

      //
      //

      for (let ii = 0; ii < 5; ++ii) {

        //
        // ENCRYPT
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr);

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
      const ivHexStr = prng.getRandomHexStr(16);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipherA = new wasmModule!.AesStreamCipherJs();
      const cipherB = new wasmModule!.AesStreamCipherJs();

      cipherA.initializeFromHexStr(keyHexStr, ivHexStr);
      cipherB.initializeFromHexStr(keyHexStr, ivHexStr);

      //
      //

      for (let ii = 0; ii < 5; ++ii) {

        //
        // ENCRYPT
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr);

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

        const encodedHexStr =  cipherB.encryptFromHexStrAsHexStr(payloadHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherA.decryptFromHexStrAsHexStr(encodedHexStr);

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

        const encodedHexStr =  cipherA.encryptFromHexStrAsHexStr(payloadHexStr);

        expect(encodedHexStr).not.toEqual(payloadStr);
        expect(encodedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // DECRYPT
        //

        const decodedHexStr = cipherB.decryptFromHexStrAsHexStr(encodedHexStr);

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
      const ivHexStr = prng.getRandomHexStr(16);
      const garbageHexStr = prng.getRandomHexStr(128);
      prng.delete();

      //
      // INITIALIZE
      //

      const cipher = new wasmModule!.AesStreamCipherJs();

      cipher.initializeFromHexStr(keyHexStr, ivHexStr);

      //
      // DECRYPT
      //

      let errorWasCaught = false;

      try {
        cipher.decryptFromHexStrAsHexStr(garbageHexStr);
      } catch (err) {
        const errMsg = wasmModule!.getExceptionMessage(err);
        expect(errMsg).toEqual("StreamTransformationFilter: invalid PKCS #7 block padding found");
        errorWasCaught = true;
      }

      expect(errorWasCaught).toEqual(false); // garbage will be decrypted as garbage

      //
      // DEALLOCATE
      //

      cipher.delete();

    });

  });

});

