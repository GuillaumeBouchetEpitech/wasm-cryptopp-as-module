
import { CrytpoppWasmModule } from "@local-worker-framework";

export const getRandomHexStr = (inSize: number): string => {

  const wasmModule = CrytpoppWasmModule.get();
  const prng = new wasmModule.AutoSeededRandomPoolJs();
  const randomHexStr = prng.getRandomHexStr(inSize);
  prng.delete();

  return randomHexStr;
}
