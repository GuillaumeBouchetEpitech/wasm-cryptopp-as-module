
export enum StrategiesTypes {
  initialize = 'initialize',
  create_secure_context = 'create_secure_context',
  derive_rsa_keys = 'derive_rsa_keys',
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

export interface IMsgDeriveRsaKeys_request {
  type: StrategiesTypes.derive_rsa_keys;
  id: string;
  password: string;
  keySize: number;
};
export interface IMsgDeriveRsaKeys_response {
  elapsedTime: number;
  privateKeyPem: string;
  publicKeyPem: string;
  ivValue: string;
};

//
//
//


