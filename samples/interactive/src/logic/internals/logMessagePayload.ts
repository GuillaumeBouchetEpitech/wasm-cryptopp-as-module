
import { isMessage, isSecurityRequestPayload, isSecurityResponsePayload, Message, MessageTypes } from "../SecureClient";

// import { Logger, printHexadecimalStrings } from "../../../../_common";
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

const logSeparator = (logger: Logger, inAlign: "left" | "center" | "right", jsonMsg: Message) => {

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

  if (isMessage(jsonMsg)) {

    logSeparator(logger, inAlign, jsonMsg);

    logger.alignedLog(inAlign, `type:`);
    logger.alignedLog(inAlign, Logger.makeColor([128+64,128+64,64], `"${jsonMsg.type}"`));

    switch (jsonMsg.type) {
      case MessageTypes.PlainMessage:
        logger.alignedLog(inAlign, `payload:`);
        logger.alignedLog(inAlign, Logger.makeColor([128+64,64,64], Logger.makeSize(25, `"${jsonMsg.payload}"`)));
        break;
      default: {

        try {

          const jsonSecMsg = JSON.parse(jsonMsg.payload);

          if (isSecurityRequestPayload(jsonSecMsg)) {

            logger.alignedLog(inAlign, `payload.publicKey:`);
            printHexadecimalStrings(logger, jsonSecMsg.publicKey, 64, inAlign)
            logger.alignedLog(inAlign, `payload.ivValue:`);
            printHexadecimalStrings(logger, jsonSecMsg.ivValue, 64, inAlign)

          } else if (isSecurityResponsePayload(jsonSecMsg)) {

            logger.alignedLog(inAlign, `payload.publicKey:`);
            printHexadecimalStrings(logger, jsonSecMsg.publicKey, 64, inAlign)

          } else {
            logger.alignedLog(inAlign, `payload:`);
            printHexadecimalStrings(logger, jsonMsg.payload, 64, inAlign)
          }

        } catch {
          logger.alignedLog(inAlign, `payload:`);
          printHexadecimalStrings(logger, jsonMsg.payload, 64, inAlign)
        }

        break;
      }
    }

    logSeparator(logger, inAlign, jsonMsg);

  } else {
    logger.alignedLog(inAlign, `"${inText}"`);
  }
};
