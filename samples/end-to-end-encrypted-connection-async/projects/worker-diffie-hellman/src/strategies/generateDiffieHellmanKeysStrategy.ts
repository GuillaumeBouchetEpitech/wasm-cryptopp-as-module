
import { getSecureContext } from "../data-store"

import { DiffieHellman } from "../../../_common"

const isGenerateCipherKey = (data: any): data is DiffieHellman.IMsgGenerateDiffieHellmanKey_request => data?.type === DiffieHellman.StrategiesTypes.generate_diffie_hellman_keys;


export const generateDiffieHellmanKeysStrategy = async (data: any): Promise<DiffieHellman.IMsgGenerateDiffieHellmanKey_response> => {
  if (!isGenerateCipherKey(data)) {
    throw new Error('invalid payload');
  }

  const loadStartTime = Date.now();

  //
  //

  const secureContext = getSecureContext(data.id);
  secureContext.diffieHellmanClient.generateRandomKeysSimpler();
  secureContext.publicKey = secureContext.diffieHellmanClient.getPublicKeyAsHexStr();

  //
  //

  const loadEndTime = Date.now();
  const elapsedTime = loadEndTime - loadStartTime;

  return {
    elapsedTime,
    publicKey: secureContext.publicKey,
  };
};
