
import { SecureClient } from "./SecureClient";

import { FakeWebSocket } from "./internals/FakeWebSocket";

import { Logger } from "@local-framework";

export const runLogic = async (logger: Logger) => {

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("Secure Connection Test"))));

  const clientA_str = Logger.makeColor([128 + 64,128,128], "Client A");
  const clientB_str = Logger.makeColor([128,128,128 + 64], "Client B");

  //
  //
  //

  const fakeWebSocketA = new FakeWebSocket(logger, 'left', clientA_str, clientB_str);
  const fakeWebSocketB = new FakeWebSocket(logger, 'right', clientB_str, clientA_str);

  //
  //
  //

  logger.logCenter(Logger.makeBorder(`initialize`));

  logger.logLeft(`${clientA_str} created`);
  const clientA = new SecureClient(fakeWebSocketA, logger, 'left');
  clientA.onReceive((inText) => {
    logger.alignedLog("left", `${clientA_str} received:`);
    logger.alignedLog("left", Logger.makeColor([64,128+64,64], Logger.makeSize(25, `"${inText}"`)));
    logger.alignedLog("left", `\n`);
  });

  logger.logRight(`${clientB_str} created`);
  const clientB = new SecureClient(fakeWebSocketB, logger, 'right');
  clientB.onReceive((inText) => {
    logger.alignedLog("right", `${clientB_str} received:`);
    // logger.alignedLog("right", Logger.makeColor([64,128+64,64], `"${inText}"`));
    logger.alignedLog("right", Logger.makeColor([64,128+64,64], Logger.makeSize(25, `"${inText}"`)));
    logger.alignedLog("right", `\n`);
  });

  //
  //
  //

  logger.logCenter(Logger.makeBorder(`[unencrypted] Client A send to Client B`));

  logger.logLeft(`${clientA_str} now sending a message:`);
  const messageToSend = "Hello, is this safe?";
  logger.alignedLog("left", Logger.makeColor([64,128+64,64], Logger.makeSize(25, `"${messageToSend}"`)));
  logger.log(`\n`);
  clientA.send(messageToSend);
  fakeWebSocketA.pipeMessages(fakeWebSocketB);

  logger.logCenter(Logger.makeBorder(`[unencrypted] Client B send to Client A`));

  logger.logRight(`${clientB_str} now sending a message:`);
  const messageToReply = "Hi, no... it isn't safe...";
  logger.alignedLog("right", Logger.makeColor([64,128+64,64], Logger.makeSize(25, `"${messageToReply}"`)));
  logger.log(`\n`);
  clientB.send(messageToReply);
  fakeWebSocketB.pipeMessages(fakeWebSocketA);

  //
  //

  logger.logCenter(Logger.makeBorder(`Client A send request for encryption to Client B`));

  clientA.makeSecure();

  while (
    fakeWebSocketA.hasMessageToSend() ||
    fakeWebSocketB.hasMessageToSend()
  ) {
    fakeWebSocketA.pipeMessages(fakeWebSocketB);
    fakeWebSocketB.pipeMessages(fakeWebSocketA);
  }

  logger.logCenter(Logger.makeBorder(`Client B sent a reply for encryption to Client B`));

  logger.logCenter(Logger.makeBorder(`Both Client A and Client B can now encrypt/decrypt each other messages`));

  //

  logger.logCenter(Logger.makeBorder(`[encrypted] Client A send to Client B`));

  logger.logLeft(`${clientA_str} now sending a message:`);
  const newMessageToSend = "Let's try again, safe now?";
  logger.alignedLog("left", Logger.makeColor([64,128+64,64], Logger.makeSize(25, `"${newMessageToSend}"`)));
  logger.log(`\n`);
  clientA.send(newMessageToSend);
  fakeWebSocketA.pipeMessages(fakeWebSocketB);

  logger.logCenter(Logger.makeBorder(`[encrypted] Client B send to Client A`));

  logger.logRight(`${clientB_str} now sending a message:`);
  const newMessageToReply = "I'd say we're pretty safe right now :)";
  logger.alignedLog("right", Logger.makeColor([64,128+64,64], Logger.makeSize(25, `"${newMessageToReply}"`)));
  logger.log(`\n`);
  clientB.send(newMessageToReply);
  fakeWebSocketB.pipeMessages(fakeWebSocketA);

  //
  //
  //

  clientA.delete();
  clientB.delete();

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder(`Secure Connection Test`))));


};
