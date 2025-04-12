
interface WasmOptions {
  locateFile: (path: string, prefix: string) => string;
}

export default wasmCryptoppJs;
declare function wasmCryptoppJs(options?: WasmOptions): Promise<typeof wasmCryptoppJs>;

declare module wasmCryptoppJs {

  //
  //
  //

  class DiffieHellmanClientJs {
    constructor();
    delete(): void;
    generateRandomKeysSimpler(): void;
    generateRandomKeys(rng: AutoSeededRandomPoolJs, p: string, q: string, g: string): void;
    computeSharedSecretFromHexStr(inHexStr: string): void;
    getPublicKeyAsHexStr(): string;
    getSharedSecretAsHexStr(): string;
  }

  class EllipticCurveDiffieHellmanClientJs {
    constructor();
    delete(): void;
    generateRandomKeys(rng: AutoSeededRandomPoolJs): void;
    computeSharedSecretFromHexStr(inHexStr: string): void;
    getPublicKeyAsHexStr(): string;
    getSharedSecretAsHexStr(): string;
  }

  //
  //
  //

  class AutoSeededRandomPoolJs {
    constructor();
    delete(): void;
    getRandomHexStr(inBufferSize: number): string;
  };

  class HashDrbgRandomGeneratorJs {
    constructor(
      entropy: string,
      nonce: string,
      personalization: string
    );
    delete(): void;
    getRandomHexStr(inBufferSize: number): string;
  };

  //
  //
  //

  class AesStreamCipherJs {
    constructor();
    delete(): void;
    initializeFromHexStr(inKeyStr: string, inIvStr: string): void;
    encryptFromHexStrAsHexStr(inStr: string): string;
    decryptFromHexStrAsHexStr(inStr: string): string;
  };

  class AuthenticatedEncryptionJs {
    constructor();
    delete(): void;
    initializeFromHexStr(inKeyStr: string): void;
    encryptFromHexStrAsHexStr(inStr: string, inIvStr: string): string;
    decryptFromHexStrAsHexStr(inStr: string, size: number, inIvStr: string): string;
  };

  class AesSymmetricCipherJs {
    constructor();
    delete(): void;
    initializeFromHexStr(inKeyStr: string, inIvStr: string): void;
    encryptFromHexStrAsHexStr(inStr: string): string;
    decryptFromHexStrAsHexStr(inStr: string): string;
  };

  //
  //
  //

  class RSAPrivateKeyJs {
    constructor();
    delete(): void;
    generateRandomWithKeySizeUsingAutoSeeded(rng: AutoSeededRandomPoolJs, keySize: number): void;
    generateRandomWithKeySizeUsingHashDrbg(rng: HashDrbgRandomGeneratorJs, keySize: number): void;
    loadFromPemString(inPemString: string): void;
    getAsPemString(): string;
    signFromHexStrToHexStrUsingAutoSeeded(rng: AutoSeededRandomPoolJs, inHexStr: string): string;
    signFromHexStrToHexStrUsingHashDrbg(rng: HashDrbgRandomGeneratorJs, inHexStr: string): string;
  };

  //
  //
  //

  class RSAPublicKeyJs {
    constructor();
    delete(): void;
    setFromPrivateKey(inPrivateKey: RSAPrivateKey): void;
    loadFromPemString(inPemString: string): void;
    getAsPemString(): string;
    verifyFromHexStrToHexStr(inHexStr: string): string;
  };

  //
  //
  //

  const deriveSha256HexStrKeyFromHexStrData: (
    inKeyHexStr: string,
    inSaltHexStr: string,
    inInfoHexStr: string,
    inKeySize: number
  ) => string;

  //
  //
  //
  const utf8ToHex: (inJsStr: string) => string;
  const hexToUtf8: (inJsStr: string) => string;

  const getExceptionMessage: (err: unknown) => string;

}

// export default wasmCryptoppJs;
