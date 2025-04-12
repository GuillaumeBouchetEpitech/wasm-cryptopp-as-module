
//
//
//

export enum MessageTypes {
  PlainMessage = "PlainMessage",
  EncryptedMessage = "EncryptedMessage",
  ErrorMessage = "ErrorMessage",
  SecurityRequest = "SecurityRequest",
  SecurityResponse = "SecurityResponse",
};

//
//
//

export type BaseMessage = {
  type: string;
};
export const isBaseMessage = (inValue: any): inValue is BaseMessage => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.type) === 'string'
  )
}

//
//
//

export interface PlainMessage {
  type: MessageTypes.PlainMessage,
  plainText: string;
};
export const isPlainMessage = (inValue: any): inValue is PlainMessage => {
  return (
    typeof(inValue) === 'object' &&
    inValue.type === MessageTypes.PlainMessage &&
    typeof(inValue.plainText) === 'string'
  );
};

//
//
//

export interface EncryptedMessage {
  type: MessageTypes.EncryptedMessage,
  encryptedMessage: string;
  size: number;
  ivValue: string;
};
export const isEncryptedMessage = (inValue: any): inValue is EncryptedMessage => {
  return (
    typeof(inValue) === 'object' &&
    inValue.type === MessageTypes.EncryptedMessage &&
    typeof(inValue.encryptedMessage) === 'string' &&
    typeof(inValue.size) === 'number' &&
    typeof(inValue.ivValue) === 'string'
  )
}

//
//
//

export enum EncryptedCommunicationState {
  unencrypted,
  initiated,
  ready,
  confirmed,
};

export interface SecurityPayload extends BaseMessage {
  type: MessageTypes.SecurityRequest | MessageTypes.SecurityResponse;
  signedPublicKey: string;
};
export const isSecurityResponsePayload = (inValue: any): inValue is SecurityPayload => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.signedPublicKey) === 'string' &&
    inValue.type === MessageTypes.SecurityResponse
  );
}
export const isSecurityRequestPayload = (inValue: any): inValue is SecurityPayload => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.signedPublicKey) === 'string' && (
      inValue.type === MessageTypes.SecurityRequest
    )
  );
}

//
//
//
