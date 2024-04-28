
import { createNewSecureContext } from "../data-store"

import { StrategiesTypes, IMsgCreateSecureContext_request, IMsgCreateSecureContext_response } from "../../../_common"

const isCreateSecureContext = (data: any): data is IMsgCreateSecureContext_request => data?.type === StrategiesTypes.create_secure_context;

export const createSecureContextStrategy = async (data: any): Promise<IMsgCreateSecureContext_response> => {
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
