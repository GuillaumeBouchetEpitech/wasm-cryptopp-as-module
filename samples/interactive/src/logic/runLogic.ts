
import { SecureClient, isMessage, isSecurityPayload, onReceiveCallback, ICommunication, MessageTypes } from "./SecureClient";

import { Logger, printHexadecimalStrings } from "../../../_common";

export const runLogic = (logger: Logger) => {

  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder("Secure Connection Test"))));


  const clientA_str = logger.makeColor([128 + 64,128,128], "Client A");
  const clientB_str = logger.makeColor([128,128,128 + 64], "Client B");

  //
  //
  //

  const _logPayload = (inAlign: "left" | "center" | "right", inText: string) => {

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

            if (isSecurityPayload(jsonSecMsg)) {

              logger.alignedLog(inAlign, `payload.publicKey:`);
              printHexadecimalStrings(logger, jsonSecMsg.publicKey, 64, inAlign)
              logger.alignedLog(inAlign, `payload.ivValue:`);
              printHexadecimalStrings(logger, jsonSecMsg.ivValue, 64, inAlign)

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

  const allSendMessagesA: string[] = [];
  const allOnReceiveCallbacksA: onReceiveCallback[] = [
    (inText) => {
      logger.alignedLog("left", `SecureClient ${clientA_str} received a message`);
      // _logPayload("left", inText);
      logger.alignedLog("left", "\n");
    },
  ];
  const communicationA: ICommunication = {
    send: (inText: string) => {
      logger.alignedLog("left", `SecureClient ${clientA_str} sent a message`);
      // _logPayload("left", inText);
      logger.alignedLog("left", "\n");


      logger.alignedLog('center', `${clientA_str} -----> ${clientB_str}`);
      logger.alignedLog("center", "\n");
      _logPayload('center', inText);
      logger.alignedLog("center", "\n");
      logger.alignedLog('center', `${clientA_str} -----> ${clientB_str}`);
      logger.alignedLog("center", "\n");


      allSendMessagesA.push(inText);
    },
    onReceive: (inCallback: onReceiveCallback) => {
      allOnReceiveCallbacksA.push(inCallback);
    },
  };

  //

  const allSendMessagesB: string[] = [];
  const allOnReceiveCallbacksB: onReceiveCallback[] = [
    (inText) => {
      logger.alignedLog("right", `SecureClient ${clientB_str} received a message`);
      // _logPayload("right", inText);
      logger.alignedLog("right", "\n");
    },
  ];
  const communicationB: ICommunication = {
    send: (inText: string) => {
      logger.alignedLog("right", `SecureClient ${clientB_str} sent a message`);
      // _logPayload("right", inText);
      logger.alignedLog("right", "\n");

      logger.alignedLog('center', `${clientA_str} <----- ${clientB_str}`);
      logger.alignedLog("center", "\n");
      _logPayload('center', inText);
      logger.alignedLog("center", "\n");
      logger.alignedLog('center', `${clientA_str} <----- ${clientB_str}`);
      logger.alignedLog("center", "\n");


      allSendMessagesB.push(inText);
    },
    onReceive: (inCallback: onReceiveCallback) => {
      allOnReceiveCallbacksB.push(inCallback);
    },
  };

  //
  //
  //

  logger.logCenter(logger.makeBorder(`initialize`));

  logger.logLeft(`${clientA_str} created`);
  const clientA = new SecureClient(communicationA, (inLogMsg) => logger.logLeft(inLogMsg));
  clientA.onReceive((inText) => {
    logger.alignedLog("left", `${clientA_str} received:`);
    logger.alignedLog("left", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${inText}"`)));
    logger.alignedLog("left", `\n`);
  });

  logger.logRight(`${clientB_str} created`);
  const clientB = new SecureClient(communicationB, (inLogMsg) => logger.logRight(inLogMsg));
  clientB.onReceive((inText) => {
    logger.alignedLog("right", `${clientB_str} received:`);
    // logger.alignedLog("right", logger.makeColor([64,128+64,64], `"${inText}"`));
    logger.alignedLog("right", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${inText}"`)));
    logger.alignedLog("right", `\n`);
  });

  //
  //
  //

  logger.logCenter(logger.makeBorder(`[unencrypted] Client A send to Client B`));

  logger.logLeft(`${clientA_str} now sending a message:`);
  const messageToSend = "Hello, is this safe?";
  logger.alignedLog("left", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${messageToSend}"`)));
  logger.log(`\n`);
  clientA.send(messageToSend);
  allSendMessagesA.forEach((inText) => {
    allOnReceiveCallbacksB.forEach((callback) => callback(inText));
  });
  allSendMessagesA.length = 0;

  logger.logCenter(logger.makeBorder(`[unencrypted] Client B send to Client A`));

  logger.logRight(`${clientB_str} now sending a message:`);
  const messageToReply = "Hi, no... it isn't safe...";
  logger.alignedLog("right", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${messageToReply}"`)));
  logger.log(`\n`);
  clientB.send(messageToReply);
  allSendMessagesB.forEach((inText) => {
    allOnReceiveCallbacksA.forEach((callback) => callback(inText));
  });
  allSendMessagesB.length = 0;

  //
  //

  logger.logCenter(logger.makeBorder(`Client A send request for encryption to Client B`));

  clientA.makeSecure();

  while (allSendMessagesA.length !== 0 || allSendMessagesB.length !== 0) {

    allSendMessagesA.forEach((inText) => {
      allOnReceiveCallbacksB.forEach((callback) => callback(inText));
    });
    allSendMessagesA.length = 0;

    allSendMessagesB.forEach((inText) => {
      allOnReceiveCallbacksA.forEach((callback) => callback(inText));
    });
    allSendMessagesB.length = 0;
  }

  logger.logCenter(logger.makeBorder(`Client B sent a reply for encryption to Client B`));
  logger.logCenter(logger.makeBorder(`Both Client A and Client B can now encrypt/decrypt each other messages`));

  //

  logger.logCenter(logger.makeBorder(`[encrypted] Client A send to Client B`));

  logger.logLeft(`${clientA_str} now sending a message:`);
  const newMessageToSend = "Let's try again, safe now?";
  logger.alignedLog("left", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${newMessageToSend}"`)));
  logger.log(`\n`);
  clientA.send(newMessageToSend);
  allSendMessagesA.forEach((inText) => {
    allOnReceiveCallbacksB.forEach((callback) => callback(inText));
  });

  logger.logCenter(logger.makeBorder(`[encrypted] Client B send to Client A`));

  logger.logRight(`${clientB_str} now sending a message:`);
  const newMessageToReply = "I'd say we're pretty safe right now :)";
  logger.alignedLog("right", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${newMessageToReply}"`)));
  logger.log(`\n`);
  clientB.send(newMessageToReply);
  allSendMessagesB.forEach((inText) => {
    allOnReceiveCallbacksA.forEach((callback) => callback(inText));
  });

  //
  //
  //

  clientA.delete();
  clientB.delete();


  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder(`Secure Connection Test`))));


};
