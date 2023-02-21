
import wasmCryptoppJs from "..";

let wasmModule: typeof wasmCryptoppJs;

describe("Symmetric Cipher and Decipher tests", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("successful test", () => {

    test('can encrypt and then decrypt payload with same key', async () => {

      const toDeallocate: any[] = []; // TODO

      //
      // SETUP
      //

      const prng = new wasmModule.AutoSeededRandomPoolJs();
      const keyHexStr = prng.getRandomHexStr(16);
      const ivHexStr = prng.getRandomHexStr(16);
      prng.dispose();

      //
      // INITIALIZE
      //

      const cipher = new wasmModule!.AesSymmetricCipherJs();
      const decipher = new wasmModule!.AesSymmetricDecipherJs();

      //
      //

      cipher.initializeFromHexStr(keyHexStr, ivHexStr);
      decipher.initializeFromHexStr(keyHexStr, ivHexStr);

      //
      // ENCRYPT
      //

      const payloadJsStr = "Hello from JavaScript!";
      const payloadJsHexStr = wasmModule!.utf8ToHex(payloadJsStr);

      const encodedHexStr =  cipher.encryptFromHexStrAsHexStr(payloadJsHexStr);

      expect(encodedHexStr).not.toEqual(payloadJsStr);
      expect(encodedHexStr.length).toBeGreaterThan(payloadJsStr.length);

      //
      // DECRYPT
      //

      const decodedHexStr = decipher.decryptFromHexStrAsHexStr(encodedHexStr);
      const recovered = wasmModule.hexToUtf8(decodedHexStr)

      expect(recovered).toEqual(payloadJsStr);

      //
      // DEALLOCATE
      //

      cipher.dispose();
      decipher.dispose();

    });

  });

});

