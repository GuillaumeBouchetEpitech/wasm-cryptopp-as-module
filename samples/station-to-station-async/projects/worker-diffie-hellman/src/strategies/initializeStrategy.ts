
import { CrytpoppWasmModule } from "@local-worker-framework";

import { StrategiesTypes, IMsgInitialize_request, IMsgInitialize_response } from "../../../_common"

const isInitialize = (data: any): data is IMsgInitialize_request => data?.type === StrategiesTypes.initialize;

export const initializeStrategy = async (data: any): Promise<IMsgInitialize_response> => {
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
