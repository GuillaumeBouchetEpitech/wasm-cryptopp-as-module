
import wasmCryptoppJs from "../..";

let wasmModule: typeof wasmCryptoppJs;

describe("RSAFeatures.spec", () => {

  beforeAll(async () => {

    wasmModule = await wasmCryptoppJs();
  });

  describe("success", () => {

    describe("using AutoSeededRandomPoolJs", () => {

      test('can sign and verify', async () => {

        //
        // SETUP
        //

        const prng = new wasmModule.AutoSeededRandomPoolJs();
        const privateKey = new wasmModule.RSAPrivateKeyJs();
        const publicKey = new wasmModule.RSAPublicKeyJs();

        //
        // INITIALIZE
        //

        privateKey.generateRandomWithKeySizeUsingAutoSeeded(prng, 3072);
        publicKey.setFromPrivateKey(privateKey);

        //
        // SIGN
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const signedHexStr =  privateKey.signFromHexStrToHexStrUsingAutoSeeded(prng, payloadHexStr);

        expect(signedHexStr).not.toEqual(payloadStr);
        expect(signedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // VERIFY
        //

        const verifiedHexStr = publicKey.verifyFromHexStrToHexStr(signedHexStr);
        const verifiedMessage = wasmModule.hexToUtf8(verifiedHexStr);

        expect(verifiedMessage).toEqual(payloadStr);

        //
        // DEALLOCATE
        //

        publicKey.delete();
        privateKey.delete();
        prng.delete();

      });

      test('can get and load PEM, then sign and verify', async () => {

        //
        // SETUP
        //

        const prng = new wasmModule.AutoSeededRandomPoolJs();

        const primarySet = {
          privateKey: new wasmModule.RSAPrivateKeyJs(),
          publicKey: new wasmModule.RSAPublicKeyJs(),
        };

        const secondarySet = {
          privateKey: new wasmModule.RSAPrivateKeyJs(),
          publicKey: new wasmModule.RSAPublicKeyJs(),
        };

        //
        // INITIALIZE
        //

        primarySet.privateKey.generateRandomWithKeySizeUsingAutoSeeded(prng, 3072);
        primarySet.publicKey.setFromPrivateKey(primarySet.privateKey);

        secondarySet.privateKey.loadFromPemString(primarySet.privateKey.getAsPemString());
        secondarySet.publicKey.loadFromPemString(primarySet.publicKey.getAsPemString());

        //
        // SIGN
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const signedHexStr =  primarySet.privateKey.signFromHexStrToHexStrUsingAutoSeeded(prng, payloadHexStr);

        expect(signedHexStr).not.toEqual(payloadStr);
        expect(signedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // VERIFY
        //

        const verifiedHexStr = secondarySet.publicKey.verifyFromHexStrToHexStr(signedHexStr);
        const verifiedMessage = wasmModule.hexToUtf8(verifiedHexStr);

        expect(verifiedMessage).toEqual(payloadStr);

        //
        // DEALLOCATE
        //

        secondarySet.publicKey.delete();
        secondarySet.privateKey.delete();
        primarySet.publicKey.delete();
        primarySet.privateKey.delete();
        prng.delete();

      });

    });

    describe("using HashDrbgRandomGeneratorJs", () => {

      test('can sign and verify', async () => {

        //
        // SETUP
        //

        const entropy = "1234567890abcdef";
        const nonce = "my nonce";
        const personalization = "my personalization";

        const prng = new wasmModule.HashDrbgRandomGeneratorJs(entropy, nonce, personalization);
        const privateKey = new wasmModule.RSAPrivateKeyJs();
        const publicKey = new wasmModule.RSAPublicKeyJs();

        //
        // INITIALIZE
        //

        privateKey.generateRandomWithKeySizeUsingHashDrbg(prng, 3072);
        publicKey.setFromPrivateKey(privateKey);

        //
        // SIGN
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const signedHexStr =  privateKey.signFromHexStrToHexStrUsingHashDrbg(prng, payloadHexStr);

        expect(signedHexStr).not.toEqual(payloadStr);
        expect(signedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // VERIFY
        //

        const verifiedHexStr = publicKey.verifyFromHexStrToHexStr(signedHexStr);
        const verifiedMessage = wasmModule.hexToUtf8(verifiedHexStr);

        expect(verifiedMessage).toEqual(payloadStr);

        //
        // DEALLOCATE
        //

        publicKey.delete();
        privateKey.delete();
        prng.delete();

      });

      test('can get and load PEM, then sign and verify', async () => {

        //
        // SETUP
        //

        const entropy = "1234567890abcdef";
        const nonce = "my nonce";
        const personalization = "my personalization";

        const prng = new wasmModule.HashDrbgRandomGeneratorJs(entropy, nonce, personalization);

        const primarySet = {
          privateKey: new wasmModule.RSAPrivateKeyJs(),
          publicKey: new wasmModule.RSAPublicKeyJs(),
        };

        const secondarySet = {
          privateKey: new wasmModule.RSAPrivateKeyJs(),
          publicKey: new wasmModule.RSAPublicKeyJs(),
        };

        //
        // INITIALIZE
        //

        primarySet.privateKey.generateRandomWithKeySizeUsingHashDrbg(prng, 3072);
        primarySet.publicKey.setFromPrivateKey(primarySet.privateKey);

        secondarySet.privateKey.loadFromPemString(primarySet.privateKey.getAsPemString());
        secondarySet.publicKey.loadFromPemString(primarySet.publicKey.getAsPemString());

        //
        // SIGN
        //

        const payloadStr = "Hello from JavaScript!";
        const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

        const signedHexStr =  primarySet.privateKey.signFromHexStrToHexStrUsingHashDrbg(prng, payloadHexStr);

        expect(signedHexStr).not.toEqual(payloadStr);
        expect(signedHexStr.length).toBeGreaterThan(payloadStr.length);

        //
        // VERIFY
        //

        const verifiedHexStr = secondarySet.publicKey.verifyFromHexStrToHexStr(signedHexStr);
        const verifiedMessage = wasmModule.hexToUtf8(verifiedHexStr);

        expect(verifiedMessage).toEqual(payloadStr);

        //
        // DEALLOCATE
        //

        secondarySet.publicKey.delete();
        secondarySet.privateKey.delete();
        primarySet.publicKey.delete();
        primarySet.privateKey.delete();
        prng.delete();

      });

    });

  });

  describe("failure", () => {

    describe("using AutoSeededRandomPoolJs", () => {

      test('public key verify garbage', async () => {

        //
        // SETUP
        //

        const prng = new wasmModule.AutoSeededRandomPoolJs();
        const privateKey = new wasmModule.RSAPrivateKeyJs();
        const publicKey = new wasmModule.RSAPublicKeyJs();

        //
        // INITIALIZE
        //

        privateKey.generateRandomWithKeySizeUsingAutoSeeded(prng, 3072);
        publicKey.setFromPrivateKey(privateKey);

        //
        // VERIFY
        //

        const garbageHexStr = prng.getRandomHexStr(128);

        let errorWasCaught = false;

        try {
          publicKey.verifyFromHexStrToHexStr(garbageHexStr);
        } catch (err) {
          const errMsg = wasmModule!.getExceptionMessage(err);
          expect(errMsg).toEqual("VerifierFilter: digital signature not valid");
          errorWasCaught = true;
        }

        expect(errorWasCaught).toEqual(true);

        //
        // DEALLOCATE
        //

        publicKey.delete();
        privateKey.delete();
        prng.delete();

      });

    });

    describe("using HashDrbgRandomGeneratorJs", () => {

      test('public key verify garbage', async () => {

        //
        // SETUP
        //

        const entropy = "1234567890abcdef";
        const nonce = "my nonce";
        const personalization = "my personalization";

        const prng = new wasmModule.HashDrbgRandomGeneratorJs(entropy, nonce, personalization);
        const privateKey = new wasmModule.RSAPrivateKeyJs();
        const publicKey = new wasmModule.RSAPublicKeyJs();

        //
        // INITIALIZE
        //

        privateKey.generateRandomWithKeySizeUsingHashDrbg(prng, 3072);
        publicKey.setFromPrivateKey(privateKey);

        //
        // VERIFY
        //

        const garbageHexStr = prng.getRandomHexStr(128);

        let errorWasCaught = false;

        try {
          publicKey.verifyFromHexStrToHexStr(garbageHexStr);
        } catch (err) {
          const errMsg = wasmModule!.getExceptionMessage(err);
          expect(errMsg).toEqual("VerifierFilter: digital signature not valid");
          errorWasCaught = true;
        }

        expect(errorWasCaught).toEqual(true);

        //
        // DEALLOCATE
        //

        publicKey.delete();
        privateKey.delete();
        prng.delete();

      });

    });

  });

});

