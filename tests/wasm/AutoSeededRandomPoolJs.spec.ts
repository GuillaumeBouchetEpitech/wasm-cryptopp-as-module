
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

describe("AutoSeededRandomPoolJs", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("can generate random numbers", () => {

    test('size of 16', async () => {
      const prng = new wasmModule.AutoSeededRandomPoolJs();

      const allValues = new Set<string>();
      for (let ii = 0; ii < 200; ++ii) {
        const randomHexStr = prng.getRandomHexStr(16);
        expect(allValues.has(randomHexStr)).toEqual(false);
        allValues.add(randomHexStr);
      }

      prng.delete();
    });

    test('size of 32', async () => {
      const prng = new wasmModule.AutoSeededRandomPoolJs();

      const allValues = new Set<string>();
      for (let ii = 0; ii < 200; ++ii) {
        const randomHexStr = prng.getRandomHexStr(32);
        expect(allValues.has(randomHexStr)).toEqual(false);
        allValues.add(randomHexStr);
      }

      prng.delete();
    });

    test('size of 64', async () => {
      const prng = new wasmModule.AutoSeededRandomPoolJs();

      const allValues = new Set<string>();
      for (let ii = 0; ii < 200; ++ii) {
        const randomHexStr = prng.getRandomHexStr(64);
        expect(allValues.has(randomHexStr)).toEqual(false);
        allValues.add(randomHexStr);
      }

      prng.delete();
    });

    test('size of 128', async () => {
      const prng = new wasmModule.AutoSeededRandomPoolJs();

      const allValues = new Set<string>();
      for (let ii = 0; ii < 200; ++ii) {
        const randomHexStr = prng.getRandomHexStr(128);
        expect(allValues.has(randomHexStr)).toEqual(false);
        allValues.add(randomHexStr);
      }

      prng.delete();
    });

    test('size of 256', async () => {
      const prng = new wasmModule.AutoSeededRandomPoolJs();

      const allValues = new Set<string>();
      for (let ii = 0; ii < 200; ++ii) {
        const randomHexStr = prng.getRandomHexStr(256);
        expect(allValues.has(randomHexStr)).toEqual(false);
        allValues.add(randomHexStr);
      }

      prng.delete();
    });

    test('size of 512', async () => {
      const prng = new wasmModule.AutoSeededRandomPoolJs();

      const allValues = new Set<string>();
      for (let ii = 0; ii < 200; ++ii) {
        const randomHexStr = prng.getRandomHexStr(512);
        expect(allValues.has(randomHexStr)).toEqual(false);
        allValues.add(randomHexStr);
      }

      prng.delete();
    });

  });

});

