
export default wasmCryptoppJs;
declare function wasmCryptoppJs(): Promise<typeof wasmCryptoppJs>;

declare module wasmCryptoppJs {

  //
  //
  //

  class DiffieHellmanClientJs {
    constructor();
    delete(): void;
    generateKeys(p: string, q: string, g: string): void;
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

  //
  //
  //

  class AesSymmetricCipherJs {
    constructor();
    delete(): void;
    initializeFromHexStr( inKeyStr: string, inIvStr: string): void;
    encryptFromHexStrAsHexStr(inStr: string): string;
    decryptFromHexStrAsHexStr(inStr: string): string;
  };

  //
  //
  //

  const utf8ToHex: (inJsStr: string) => string;
  const hexToUtf8: (inJsStr: string) => string;

  const getExceptionMessage: (err: unknown) => string;

}

// export default wasmCryptoppJs;
