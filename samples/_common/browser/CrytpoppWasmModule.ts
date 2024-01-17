
import wasmCryptoppJs from "wasmCryptoppJs";

import { scriptLoadingUtility } from "./scriptLoadingUtility";

export type WasmCryptoppJsInstance = typeof wasmCryptoppJs;

export class CrytpoppWasmModule {

  private static _wasmModule: WasmCryptoppJsInstance | undefined;

  static async load() {
    await scriptLoadingUtility("../../build/wasm-cryptopp.js");
    await CrytpoppWasmModule.rawLoad();
  }

  static async rawLoad() {
    CrytpoppWasmModule._wasmModule = await wasmCryptoppJs({
      locateFile: (url: string) => {
        console.log(`url: "${url}"`);
        return `../../build/${url}`;
      },
    });
  }

  static get(): typeof wasmCryptoppJs {
    if (!this._wasmModule)
      throw new Error("crytpopp wasm module not loaded");
    return this._wasmModule;
  }

};
