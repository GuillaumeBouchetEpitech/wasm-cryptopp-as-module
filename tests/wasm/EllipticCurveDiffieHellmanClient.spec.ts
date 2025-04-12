
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;


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


describe("EllipticCurveDiffieHellmanClientJs", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("successful test", () => {

    test('two clients can obtain a common secret without sharing it', async () => {

      const prngA = new wasmModule.AutoSeededRandomPoolJs();
      const prngB = new wasmModule.AutoSeededRandomPoolJs();

      const clientA = new wasmModule!.EllipticCurveDiffieHellmanClientJs();
      const clientB = new wasmModule!.EllipticCurveDiffieHellmanClientJs();

      clientA.generateRandomKeys(prngA);
      clientB.generateRandomKeys(prngB);

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

      clientA.delete();
      clientB.delete();

    });

  });


  // describe("basic tests", () => {

  //   test('will generate new keys every time', async () => {

  //     const client = new wasmModule!.EllipticCurveDiffieHellmanClientJs();

  //     const allValues = new Set<string>();
  //     for (let ii = 0; ii < 50; ++ii) {
  //       client.generateRandomKeys();
  //       const publicKeyHexStr = client.getPublicKeyAsHexStr();
  //       expect(allValues.has(publicKeyHexStr)).toEqual(false);
  //       allValues.add(publicKeyHexStr);
  //     }

  //     client.delete();

  //   });

  // });

});

