
import { getSecureContext } from "../data-store"

import { StrategiesTypes, IMsgGenerateDiffieHellmanKey_request, IMsgGenerateDiffieHellmanKey_response } from "../../../_common"

import { setupDiffieHellman } from "./utilities"

const isGenerateCipherKey = (data: any): data is IMsgGenerateDiffieHellmanKey_request => data?.type === StrategiesTypes.generate_diffie_hellman_keys;


export const generateDiffieHellmanKeysStrategy = async (data: any): Promise<IMsgGenerateDiffieHellmanKey_response> => {
  if (!isGenerateCipherKey(data)) {
    throw new Error('invalid payload');
  }

  const loadStartTime = Date.now();

  //
  //

  const secureContext = getSecureContext(data.id);
  secureContext.publicKey = setupDiffieHellman(secureContext.diffieHellmanClient);

  //
  //

  const loadEndTime = Date.now();
  const elapsedTime = loadEndTime - loadStartTime;

  return {
    elapsedTime,
    publicKey: secureContext.publicKey,
  };
};
