
import { createNewSecureContext } from "../data-store"

import { DeriveRsaKeys } from "../../../_common"

const isCreateSecureContext = (data: any): data is DeriveRsaKeys.IMsgCreateSecureContext_request => data?.type === DeriveRsaKeys.StrategiesTypes.create_secure_context;

export const createSecureContextStrategy = async (data: any): Promise<DeriveRsaKeys.IMsgCreateSecureContext_response> => {
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
