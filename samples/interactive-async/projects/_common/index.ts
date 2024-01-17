
export enum StrategiesTypes {
  initialize = 'initialize',
  create_secure_context = 'create_secure_context',
  generate_diffie_hellman_keys = 'generate_diffie_hellman_keys',
  compute_diffie_hellman_shared_secret = 'compute_diffie_hellman_shared_secret',
};

//
//
//

export interface IMsgInitialize_request {
  type: StrategiesTypes.initialize;
};
export interface IMsgInitialize_response {
  elapsedTime: number;
};

//
//
//

export interface IMsgCreateSecureContext_request {
  type: StrategiesTypes.create_secure_context;
};
export interface IMsgCreateSecureContext_response {
  elapsedTime: number;
  id: string;
};

//
//
//

export interface IMsgGenerateDiffieHellmanKey_request {
  type: StrategiesTypes.generate_diffie_hellman_keys;
  id: string;
};
export interface IMsgGenerateDiffieHellmanKey_response {
  elapsedTime: number;
  publicKey: string;
};

//
//
//

export interface IMsgComputeDiffieHellmanSharedSecret_request {
  type: StrategiesTypes.compute_diffie_hellman_shared_secret;
  id: string;
  publicKey: string;
};
export interface IMsgComputeDiffieHellmanSharedSecret_response {
  elapsedTime: number;
  sharedSecret: string;
};

//
//
//
