
import { CrytpoppWasmModule } from "@local-worker-framework";

import { getSecureContext } from "../data-store"

import { DeriveRsaKeys } from "../../../_common"

// import { setupDiffieHellman } from "./utilities"

const isGenerateCipherKey = (data: any): data is DeriveRsaKeys.IMsgDeriveRsaKeys_request => data?.type === DeriveRsaKeys.StrategiesTypes.derive_rsa_keys;


export const deriveRsaKeys = async (data: any): Promise<DeriveRsaKeys.IMsgDeriveRsaKeys_response> => {
  if (!isGenerateCipherKey(data)) {
    throw new Error('invalid payload');
  }

  const loadStartTime = Date.now();

  //
  //

  const secureContext = getSecureContext(data.id);

  secureContext._data = {}; // reset

  const wasmModule = CrytpoppWasmModule.get()


  {
    secureContext._data.password = data.password;

    // derive a bigger key from password (300bytes)

    const mySalt = "my salt";
    const myINfo = "my info";
    const k_size = 332;

    secureContext._data.derivedKey = wasmModule.deriveSha256HexStrKeyFromHexStrData(
      secureContext._data.password, mySalt, myINfo, k_size
    );


    secureContext._data.entropy = secureContext._data.derivedKey.slice(0, 100);
    secureContext._data.nonce = secureContext._data.derivedKey.slice(100, 200);
    secureContext._data.personalization = secureContext._data.derivedKey.slice(200, 300);
    secureContext._data.ivValue = secureContext._data.derivedKey.slice(300, 332);
  }

  // use derived key deterministic random generator

  {
    if (secureContext.prng) {
      secureContext.prng.delete();
      secureContext.prng = undefined;
    }

    secureContext.prng = new wasmModule.HashDrbgRandomGeneratorJs(secureContext._data.entropy, secureContext._data.nonce, secureContext._data.personalization);
  }

  // use random generator to generate private/public RSA keys

  {
    if (secureContext.privateRsaKey) {
      secureContext.privateRsaKey.delete();
      secureContext.privateRsaKey = undefined;
    }
    secureContext.privateRsaKey = new wasmModule.RSAPrivateKeyJs();
    secureContext.privateRsaKey.generateRandomWithKeySizeUsingHashDrbg(secureContext.prng, data.keySize);
    secureContext._data.privateKeyPem = secureContext.privateRsaKey.getAsPemString();
  }

  {
    if (secureContext.publicRsaKey) {
      secureContext.publicRsaKey.delete();
      secureContext.publicRsaKey = undefined;
    }
    secureContext.publicRsaKey = new wasmModule.RSAPublicKeyJs();
    secureContext.publicRsaKey.setFromPrivateKey(secureContext.privateRsaKey);
    secureContext._data.publicKeyPem = secureContext.publicRsaKey.getAsPemString();
  }

  // secureContext.publicKey = setupDiffieHellman(secureContext.diffieHellmanClient);

  //
  //

  const loadEndTime = Date.now();
  const elapsedTime = loadEndTime - loadStartTime;

  return {
    elapsedTime,
    privateKeyPem: secureContext._data.privateKeyPem,
    publicKeyPem: secureContext._data.publicKeyPem,
  };
};
