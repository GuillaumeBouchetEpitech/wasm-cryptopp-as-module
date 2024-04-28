
import { CrytpoppWasmModule } from "@local-worker-framework";

import { DiffieHellman } from "../../../_common"

const isInitialize = (data: any): data is DiffieHellman.IMsgInitialize_request => data?.type === DiffieHellman.StrategiesTypes.initialize;

export const initializeStrategy = async (data: any): Promise<DiffieHellman.IMsgInitialize_response> => {
  if (!isInitialize(data)) {
    throw new Error('invalid payload');
  }

  const loadStartTime = Date.now();

  await CrytpoppWasmModule.load();

  const loadEndTime = Date.now();
  const elapsedTime = loadEndTime - loadStartTime;

  console.log(`worker, wasmCryptoppJs wasm module loaded (${elapsedTime}ms)`);

  return {
    elapsedTime,
  };
};
