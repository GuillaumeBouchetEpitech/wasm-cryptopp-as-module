
import wasmCryptoppJs from "wasmCryptoppJs";

import { scriptLoadingUtility } from "./scriptLoadingUtility";

export class CrytpoppWasmModule {

  private static _wasmModule: typeof wasmCryptoppJs | undefined;

  static async load() {

    await scriptLoadingUtility("../../build/wasm-cryptopp.js");

    CrytpoppWasmModule._wasmModule = await wasmCryptoppJs();
  }

  static get() {
    if (!this._wasmModule)
      throw new Error("crytpopp wasm module not loaded");
    return this._wasmModule;
  }

};
