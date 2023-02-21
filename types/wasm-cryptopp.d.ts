
export default wasmCryptoppJs;
declare function wasmCryptoppJs(): Promise<typeof wasmCryptoppJs>;

interface WasmInstance {
  ptr: number;
}

interface WasmAllocatedMemoryInstance extends WasmInstance {
  size: number;
}
type WasmStringInstance = WasmAllocatedMemoryInstance;

interface WasmObjectInstance extends WasmInstance {
  __destroy__: unknown;
}

declare module wasmCryptoppJs {

  //
  //
  //

  class DiffieHellmanClient {

    constructor();

    ptr: number;
    __destroy__: unknown;

    generateKeys(): void;
    computeSharedSecretFromHexStrPtr(inDataPtr: number, inDataSize: number): void;
    getPublicKeyAsHexStrPtr(): WasmInstance;
    getSharedSecretAsHexStrPtr(): WasmInstance;
  }

  class DiffieHellmanClientJs {
    constructor();
    dispose(): void;
    generateKeys(): void;
    computeSharedSecretFromHexStr(inHexStr): void;
    getPublicKeyAsHexStr(): string;
    getSharedSecretAsHexStr(): string;
  }

  //
  //
  //

  class AutoSeededRandomPool {
    constructor();
    getRandomHexStrPtr(inBufferSize: number): WasmInstance;
  };

  class AutoSeededRandomPoolJs {
    constructor();
    dispose(): void;
    getRandomHexStr(inBufferSize: number): string;
  };

  //
  //
  //

  class AesSymmetricCipher {

    initializeFromHexStrPtr(
      inKeyPtr: number,
      inKeySize: number,
      inIvPtr: number,
      inIvSize: number
    ): void;

    encryptFromHexStrPtrAsHexStrPtr(
      inDataPtr: number,
      inDataSize: number
    ): WasmInstance;
  };

  class AesSymmetricCipherJs {
    constructor();
    dispose(): void;
    initializeFromHexStr( inKeyStr: string, inIvStr: string): void;
    encryptFromHexStrAsHexStr(inStr: string): string;
  };

  //
  //
  //

  class AesSymmetricDecipher {

    initializeFromHexStrPtr(
      inKeyPtr: number,
      inKeySize: number,
      inIvPtr: number,
      inIvSize: number
    ): void;

    decryptFromHexStrPtrAsHexStrPtr(
      inDataPtr: number,
      inDataSize: number
    ): WasmInstance;
  };

  class AesSymmetricDecipherJs {
    constructor();
    dispose(): void;
    initializeFromHexStr( inKeyStr: string, inIvStr: string): void;
    decryptFromHexStrAsHexStr(inStr: string): string;
  };

  //
  //
  //

  const UTF8ToString: (inPtr: number) => string;
  const lengthBytesUTF8: (inJsStr: string) => number;
  const stringToUTF8: (inJsStr: string, inHexRawStrPtr: number, inHexRawStrSize: number) => string;

  const jsStr_to_wasmAllocatedStr: (inJsStr: string) => WasmStringInstance;
  const wasmAllocatedStr_to_jsStr: (inWasmStr: WasmInstance | number) => string;

  const utf8ToHex: (inJsStr: string) => string;
  const hexToUtf8: (inJsStr: string) => string;

  const allocate: (inSize: number) => WasmAllocatedMemoryInstance;

  // destroy objects (when relevant)
  // deallocate memory
  const deallocate: (inWasmStr: Partial<WasmObjectInstance>) => string;

  //
  //
  //

  // avoid using -> prefer `allocate()`
  const _malloc: (inSize: number) => number;
  // avoid using -> prefer `deallocate()`
  const _free: (inPtr: number) => void;

  //
  //
  //

}

// export default wasmCryptoppJs;
