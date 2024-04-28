
import { createNewSecureContext } from "../data-store"

import { DiffieHellman } from "../../../_common"

const isCreateSecureContext = (data: any): data is DiffieHellman.IMsgCreateSecureContext_request => data?.type === DiffieHellman.StrategiesTypes.create_secure_context;

export const createSecureContextStrategy = async (data: any): Promise<DiffieHellman.IMsgCreateSecureContext_response> => {
  if (!isCreateSecureContext(data)) {
    throw new Error('invalid payload');
  }

  const loadStartTime = Date.now();

  //
  //
  //

  const newKeyStr = createNewSecureContext();

  //
  //
  //

  const loadEndTime = Date.now();
  const elapsedTime = loadEndTime - loadStartTime;

  return { elapsedTime, id: newKeyStr };
};
