
import { isMessage, isSecurityRequestPayload, isSecurityResponsePayload, MessageTypes } from "../SecureClient";

import { Logger, printHexadecimalStrings } from "../../../../_common";

export const logMessagePayload = (logger: Logger, inAlign: "left" | "center" | "right", inText: string) => {

  const jsonMsg = JSON.parse(inText);

  if (isMessage(jsonMsg)) {

    if (jsonMsg.type === MessageTypes.PlainMessage) {
      logger.alignedLog(inAlign, logger.makeColor([128+64,64,64], `/!\\ UNENCRYPTED MESSAGE /!\\`));
    } else if (jsonMsg.type === MessageTypes.EncryptedMessage) {
      logger.alignedLog(inAlign, logger.makeColor([64,128+64,64], `(OK) ENCRYPTED MESSAGE (OK)`));
    } else if (jsonMsg.type === MessageTypes.SecurityRequest || jsonMsg.type === MessageTypes.SecurityResponse) {
      logger.alignedLog(inAlign, logger.makeColor([64,128+64,64], `(OK) NO COMPROMISING INFORMATION SHARED (OK)`));
    }

    logger.alignedLog(inAlign, `type:`);
    logger.alignedLog(inAlign, logger.makeColor([128+64,128+64,64], `"${jsonMsg.type}"`));

    switch (jsonMsg.type) {
      case MessageTypes.PlainMessage:
        logger.alignedLog(inAlign, `payload:`);
        logger.alignedLog(inAlign, logger.makeColor([128+64,64,64], logger.makeSize(25, `"${jsonMsg.payload}"`)));
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

    if (jsonMsg.type === MessageTypes.PlainMessage) {
      logger.alignedLog(inAlign, logger.makeColor([128+64,64,64], `/!\\ UNENCRYPTED MESSAGE /!\\`));
    } else if (jsonMsg.type === MessageTypes.EncryptedMessage) {
      logger.alignedLog(inAlign, logger.makeColor([64,128+64,64], `(OK) ENCRYPTED MESSAGE (OK)`));
    } else if (jsonMsg.type === MessageTypes.SecurityRequest || jsonMsg.type === MessageTypes.SecurityResponse) {
      logger.alignedLog(inAlign, logger.makeColor([64,128+64,64], `(OK) NO COMPROMISING INFORMATION SHARED (OK)`));
    }

  } else {
    logger.alignedLog(inAlign, `"${inText}"`);
  }
};