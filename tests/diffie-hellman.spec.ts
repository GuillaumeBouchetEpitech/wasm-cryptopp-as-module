
import wasmCryptoppJs from "..";

let wasmModule: typeof wasmCryptoppJs;

describe("Diffie Hellman tests", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("successful test", () => {

    test('two clients can obtain a common secret without sharing it', async () => {

      const clientA = new wasmModule!.DiffieHellmanClientJs();
      const clientB = new wasmModule!.DiffieHellmanClientJs();

      clientA.generateKeys();
      clientB.generateKeys();

      //
      //
      //

      const pubKeyHex_A = clientA.getPublicKeyAsHexStr()
      const pubKeyHex_B = clientB.getPublicKeyAsHexStr()

      expect(pubKeyHex_A).not.toEqual(pubKeyHex_B);

      //
      //
      //

      clientA.computeSharedSecretFromHexStr(pubKeyHex_B);
      clientB.computeSharedSecretFromHexStr(pubKeyHex_A);

      //
      //
      //

      const sharedSecretHex_A = clientA.getSharedSecretAsHexStr();
      const sharedSecretHex_B = clientB.getSharedSecretAsHexStr();

      expect(sharedSecretHex_A).toEqual(sharedSecretHex_B);

      //
      //
      //

      clientA.dispose();
      clientB.dispose();

    });

  });

});

