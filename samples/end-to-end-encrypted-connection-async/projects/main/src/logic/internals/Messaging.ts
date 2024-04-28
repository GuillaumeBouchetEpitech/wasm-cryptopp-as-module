
export enum MessageTypes {
  PlainMessage = "PlainMessage",
  EncryptedMessage = "EncryptedMessage",
  SecurityRequest = "SecurityRequest",
  SecurityResponse = "SecurityResponse",
};

export type Message = {
  type: string;
  payload: string;
};
export const isMessage = (inValue: any): inValue is Message => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.type) === 'string' &&
    typeof(inValue.payload) === 'string'
  )
}

export type ErrorResponse = {
  success: boolean;
  response: {
    error: string;
  }
};

export const isErrorResponse = (inValue: any): inValue is ErrorResponse => {
  return (
    typeof(inValue) === 'object' &&
    inValue.success === false &&
    typeof(inValue.response) === 'object'
  )
}

export enum EncryptedCommunicationState {
  unencrypted,
  initiated,
  ready,
  confirmed,
};

export type SecurityPayload = {
  publicKey: string;
  ivValue: string;
};
export const isSecurityResponsePayload = (inValue: any): inValue is SecurityPayload => {
  return (
    typeof(inValue) === 'object' &&
    typeof(inValue.publicKey) === 'string'
  )
}
export const isSecurityRequestPayload = (inValue: any): inValue is SecurityPayload => {
  return (
    isSecurityResponsePayload(inValue) &&
    typeof(inValue.ivValue) === 'string'
  )
}
