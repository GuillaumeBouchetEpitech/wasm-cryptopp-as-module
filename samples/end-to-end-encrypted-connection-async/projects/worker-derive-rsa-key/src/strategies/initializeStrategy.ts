
import { CrytpoppWasmModule } from "@local-worker-framework";

import { DeriveRsaKeys } from "../../../_common"

const isInitialize = (data: any): data is DeriveRsaKeys.IMsgInitialize_request => data?.type === DeriveRsaKeys.StrategiesTypes.initialize;

export const initializeStrategy = async (data: any): Promise<DeriveRsaKeys.IMsgInitialize_response> => {
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
