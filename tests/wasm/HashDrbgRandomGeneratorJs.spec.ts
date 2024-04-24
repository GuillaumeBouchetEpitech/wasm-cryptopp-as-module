
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

describe("HashDrbgRandomGeneratorJs", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  const entropyAB = "1234567890abcdef";
  const entropyC = "1234567890abcdefg";
  const nonce = "my nonce";
  const personalization = "my personalization";

  describe("can generate random numbers", () => {

    test('size of 16', async () => {

      const k_size = 16;

      const prngA = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngB = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngC = new wasmModule.HashDrbgRandomGeneratorJs(entropyC, nonce, personalization);

      const randomHexStrA = prngA.getRandomHexStr(k_size);
      const randomHexStrB = prngB.getRandomHexStr(k_size);
      const randomHexStrC = prngC.getRandomHexStr(k_size);

      expect(randomHexStrA.length).toEqual(k_size * 2);
      expect(randomHexStrB.length).toEqual(k_size * 2);
      expect(randomHexStrC.length).toEqual(k_size * 2);
      expect(randomHexStrA).toEqual(randomHexStrB);
      expect(randomHexStrA).not.toEqual(randomHexStrC);

      prngA.delete();
      prngB.delete();
      prngC.delete();
    });

    test('size of 32', async () => {

      const prngA = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngB = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngC = new wasmModule.HashDrbgRandomGeneratorJs(entropyC, nonce, personalization);

      const randomHexStrA = prngA.getRandomHexStr(32);
      const randomHexStrB = prngB.getRandomHexStr(32);
      const randomHexStrC = prngC.getRandomHexStr(32);

      expect(randomHexStrA).toEqual(randomHexStrB);
      expect(randomHexStrA).not.toEqual(randomHexStrC);

      prngA.delete();
      prngB.delete();
      prngC.delete();
    });

    test('size of 64', async () => {

      const prngA = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngB = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngC = new wasmModule.HashDrbgRandomGeneratorJs(entropyC, nonce, personalization);

      const randomHexStrA = prngA.getRandomHexStr(64);
      const randomHexStrB = prngB.getRandomHexStr(64);
      const randomHexStrC = prngC.getRandomHexStr(64);

      expect(randomHexStrA).toEqual(randomHexStrB);
      expect(randomHexStrA).not.toEqual(randomHexStrC);

      prngA.delete();
      prngB.delete();
      prngC.delete();
    });

    test('size of 128', async () => {

      const prngA = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngB = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngC = new wasmModule.HashDrbgRandomGeneratorJs(entropyC, nonce, personalization);

      const randomHexStrA = prngA.getRandomHexStr(128);
      const randomHexStrB = prngB.getRandomHexStr(128);
      const randomHexStrC = prngC.getRandomHexStr(128);

      expect(randomHexStrA).toEqual(randomHexStrB);
      expect(randomHexStrA).not.toEqual(randomHexStrC);

      prngA.delete();
      prngB.delete();
      prngC.delete();
    });

    test('size of 256', async () => {

      const prngA = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngB = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngC = new wasmModule.HashDrbgRandomGeneratorJs(entropyC, nonce, personalization);

      const randomHexStrA = prngA.getRandomHexStr(256);
      const randomHexStrB = prngB.getRandomHexStr(256);
      const randomHexStrC = prngC.getRandomHexStr(256);

      expect(randomHexStrA).toEqual(randomHexStrB);
      expect(randomHexStrA).not.toEqual(randomHexStrC);

      prngA.delete();
      prngB.delete();
      prngC.delete();
    });

    test('size of 512', async () => {

      const prngA = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngB = new wasmModule.HashDrbgRandomGeneratorJs(entropyAB, nonce, personalization);
      const prngC = new wasmModule.HashDrbgRandomGeneratorJs(entropyC, nonce, personalization);

      const randomHexStrA = prngA.getRandomHexStr(512);
      const randomHexStrB = prngB.getRandomHexStr(512);
      const randomHexStrC = prngC.getRandomHexStr(512);

      expect(randomHexStrA).toEqual(randomHexStrB);
      expect(randomHexStrA).not.toEqual(randomHexStrC);

      prngA.delete();
      prngB.delete();
      prngC.delete();
    });


  });

});

