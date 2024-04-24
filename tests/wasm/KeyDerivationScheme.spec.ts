
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

describe("deriveSha256HexStrKeyFromHexStrData", () => {

  beforeAll(async () => {
    wasmModule = await wasmCryptoppJs();
  });

  describe("can derive key in a deterministic way", () => {

    const keyAB = "0123456789abcdef";
    const keyC = "abcdef0123456789";
    const salt = "my salt";
    const info = "my info";

    test('size of 16', async () => {

      const keyHexStrA = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 16);
      const keyHexStrB = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 16);
      const keyHexStrC = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyC, salt, info, 16);

      expect(keyHexStrA).toEqual(keyHexStrB);
      expect(keyHexStrA).not.toEqual(keyHexStrC);
    });


    test('size of 32', async () => {

      const keyHexStrA = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 32);
      const keyHexStrB = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 32);
      const keyHexStrC = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyC, salt, info, 32);

      expect(keyHexStrA).toEqual(keyHexStrB);
      expect(keyHexStrA).not.toEqual(keyHexStrC);
    });


    test('size of 64', async () => {

      const keyHexStrA = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 64);
      const keyHexStrB = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 64);
      const keyHexStrC = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyC, salt, info, 64);

      expect(keyHexStrA).toEqual(keyHexStrB);
      expect(keyHexStrA).not.toEqual(keyHexStrC);
    });


    test('size of 128', async () => {

      const keyHexStrA = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 128);
      const keyHexStrB = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 128);
      const keyHexStrC = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyC, salt, info, 128);

      expect(keyHexStrA).toEqual(keyHexStrB);
      expect(keyHexStrA).not.toEqual(keyHexStrC);
    });


    test('size of 256', async () => {

      const keyHexStrA = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 256);
      const keyHexStrB = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 256);
      const keyHexStrC = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyC, salt, info, 256);

      expect(keyHexStrA).toEqual(keyHexStrB);
      expect(keyHexStrA).not.toEqual(keyHexStrC);
    });


    test('size of 542', async () => {

      const keyHexStrA = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 542);
      const keyHexStrB = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyAB, salt, info, 542);
      const keyHexStrC = wasmModule.deriveSha256HexStrKeyFromHexStrData(keyC, salt, info, 542);

      expect(keyHexStrA).toEqual(keyHexStrB);
      expect(keyHexStrA).not.toEqual(keyHexStrC);
    });






  });

});

