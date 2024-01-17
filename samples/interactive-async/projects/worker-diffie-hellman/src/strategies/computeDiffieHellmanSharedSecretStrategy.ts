
import { getSecureContext } from "../data-store"

import { StrategiesTypes, IMsgComputeDiffieHellmanSharedSecret_request, IMsgComputeDiffieHellmanSharedSecret_response } from "../../../_common"

const isProcessSecurityRequest = (data: any): data is IMsgComputeDiffieHellmanSharedSecret_request => data?.type === StrategiesTypes.compute_diffie_hellman_shared_secret;

export const computeDiffieHellmanSharedSecretStrategy = async (data: any): Promise<IMsgComputeDiffieHellmanSharedSecret_response> => {
  if (!isProcessSecurityRequest(data)) {
    throw new Error('invalid payload');
  }

  const loadStartTime = Date.now();

  //
  //

  const secureContext = getSecureContext(data.id);

  secureContext.diffieHellmanClient.computeSharedSecretFromHexStr(data.publicKey);
  secureContext.sharedSecret = secureContext.diffieHellmanClient.getSharedSecretAsHexStr();

  //
  //

  const loadEndTime = Date.now();
  const elapsedTime = loadEndTime - loadStartTime;

  return {
    elapsedTime,
    sharedSecret: secureContext.sharedSecret,
  };
};
