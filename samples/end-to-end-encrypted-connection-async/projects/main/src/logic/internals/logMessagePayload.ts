
import {
  BaseMessage,
  isBaseMessage,
  isEncryptedMessage,
  isPlainMessage,
  isSecurityRequestPayload,
  isSecurityResponsePayload,
  MessageTypes
} from "./Messaging";

import { Logger, printHexadecimalStrings } from "@local-framework";

const k_plainMessagetext = [
  "/!\\",
  "UNENCRYPTED MESSAGE",
  "ANYONE LISTENING CAN SEE IT",
  "/!\\",
].join("\n");

const k_encryptedMessagetext = [
  "(OK)",
  "ENCRYPTED MESSAGE",
  "GOOD LUCK TO ANYONE LISTENING",
  "(OK)",
].join("\n");

const k_securityMessagetext = [
  "(OK)",
  "NO COMPROMISING INFORMATION SHARED",
  "GOOD LUCK TO ANYONE LISTENING",
  "(OK)",
].join("\n");

const logSeparator = (logger: Logger, inAlign: "left" | "center" | "right", jsonMsg: BaseMessage) => {

  if (jsonMsg.type === MessageTypes.PlainMessage) {
    logger.alignedLog(inAlign, Logger.makeColor([128,64,64], k_plainMessagetext));
  } else if (jsonMsg.type === MessageTypes.EncryptedMessage) {
    logger.alignedLog(inAlign, Logger.makeColor([64,128,64], k_encryptedMessagetext));
  } else if (jsonMsg.type === MessageTypes.SecurityRequest || jsonMsg.type === MessageTypes.SecurityResponse) {
    logger.alignedLog(inAlign, Logger.makeColor([64,128,64], k_securityMessagetext));
  }
};

export const logMessagePayload = (logger: Logger, inAlign: "left" | "center" | "right", inText: string) => {

  const jsonMsg = JSON.parse(inText);

  if (!isBaseMessage(jsonMsg)) {
    throw new Error("unknown message format");
  }

  logSeparator(logger, inAlign, jsonMsg);

  logger.alignedLog(inAlign, `type:`);
  logger.alignedLog(inAlign, Logger.makeColor([128+64,128+64,64], `"${jsonMsg.type}"`));

  if (isPlainMessage(jsonMsg)) {
    logger.alignedLog(inAlign, `payload:`);
    logger.alignedLog(inAlign, Logger.makeColor([128+64,64,64], Logger.makeSize(25, `"${jsonMsg.plainText}"`)));
    logSeparator(logger, inAlign, jsonMsg);

    return;
  }

  if (isEncryptedMessage(jsonMsg)) {

    logger.alignedLog(inAlign, `encryptedMessage:`);
    printHexadecimalStrings(logger, jsonMsg.encryptedMessage, 64, inAlign)
    logger.alignedLog(inAlign, `size:`);
    logger.alignedLog(inAlign, jsonMsg.size);
    logger.alignedLog(inAlign, `ivValue:`);
    printHexadecimalStrings(logger, jsonMsg.ivValue, 64, inAlign)
    logSeparator(logger, inAlign, jsonMsg);

    return;
  }

  if (
    isSecurityRequestPayload(jsonMsg) ||
    isSecurityResponsePayload(jsonMsg)
  ) {

    logger.alignedLog(inAlign, `payload.signedPublicKey:`);
    printHexadecimalStrings(logger, jsonMsg.signedPublicKey, 64, inAlign)
    logSeparator(logger, inAlign, jsonMsg);

    return;
  }

  throw new Error("unknown message type");
};
