
import { AsyncSecureClient, onLogCallback } from "./AsyncSecureClient";
import { DeriveRsaKeysWorker } from "./internals/DeriveRsaKeysWorker";

import { CrytpoppWasmModule, printHexadecimalStrings } from "@local-framework";

import { FakeWebSocket } from "./internals/FakeWebSocket";

import { Logger } from "@local-framework";

export const runLogic = async (logger: Logger) => {

  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder("Derive RSA Keys from password"))));

  const wasmModule = CrytpoppWasmModule.get()

  const deriveRsaKeysWorker = new DeriveRsaKeysWorker();

  await deriveRsaKeysWorker.initialize();

  // const keySize = 1024 * 3;
  const keySize = 1024 * 1;

  logger.logCenter(logger.makeBorder(`Test1, Password: "pineapple", Key Size: ${keySize}`));
  let elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pineapple", keySize);
  logger.logCenter(deriveRsaKeysWorker.privateKeyPem!);
  logger.logCenter(deriveRsaKeysWorker.publicKeyPem!);
  logger.logCenter(logger.makeBorder(`Test1 elapsedTime: ${elapsedTime}ms`));

  const rsaKeyPairTest1 = deriveRsaKeysWorker.makeRsaKeyPair();

  logger.logCenter(logger.makeBorder(`Test2, Password: "pen", Key Size: ${keySize}`));
  elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pen", keySize);
  logger.logCenter(deriveRsaKeysWorker.privateKeyPem!);
  logger.logCenter(deriveRsaKeysWorker.publicKeyPem!);
  logger.logCenter(logger.makeBorder(`Test2 elapsedTime: ${elapsedTime}ms`));

  const rsaKeyPairTest2 = deriveRsaKeysWorker.makeRsaKeyPair();

  logger.logCenter(logger.makeBorder(`Test3, Password: "pineapple", Key Size: ${keySize}`));
  elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pineapple", keySize);
  logger.logCenter(deriveRsaKeysWorker.privateKeyPem!);
  logger.logCenter(deriveRsaKeysWorker.publicKeyPem!);
  logger.logCenter(logger.makeBorder(`Test3 elapsedTime: ${elapsedTime}ms`));

  const rsaKeyPairTest3 = deriveRsaKeysWorker.makeRsaKeyPair();

  //

  logger.logCenter(logger.makeBorder(`Sign payload with Test1 private key`));
  const payload = 'LOL';

  const signedPayload = rsaKeyPairTest1.signPayloadToHexStr(payload);

  logger.logCenter(`\npayload: "${payload}"`);
  logger.logCenter(`\nsignedPayload`);
  printHexadecimalStrings(logger, signedPayload, 64, 'center');

  logger.logCenter(logger.makeBorder(`Verify payload with Test3 public key (same password)`));

  const verifiedPayload = rsaKeyPairTest3.verifyHexStrPayloadToStr(signedPayload);

  logger.logCenter(`\nverifiedPayload: "${verifiedPayload}"`);


  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder(`Derive RSA Keys from password`))));

  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder("Secure Connection Test"))));

  const clientA_str = logger.makeColor([128 + 64,128,128], "Client A");
  const clientB_str = logger.makeColor([128,128,128 + 64], "Client B");

  //
  //
  //

  const fakeWebSocketA = new FakeWebSocket(logger, 'left', clientA_str, clientB_str);
  const fakeWebSocketB = new FakeWebSocket(logger, 'right', clientB_str, clientA_str);

  //
  //
  //

  logger.logCenter(logger.makeBorder(`initialize`));

  const onLogA: onLogCallback = (inLogMsg: string, inLogHeader?: string) => {
    if (inLogHeader) {
      logger.logLeft(`${inLogHeader} ${inLogMsg}`);
    } else {
      logger.logLeft(inLogMsg);
    }
  };
  const onLogB: onLogCallback = (inLogMsg: string, inLogHeader?: string) => {
    if (inLogHeader) {
      logger.logRight(`${inLogMsg} ${inLogHeader}`);
    } else {
      logger.logRight(inLogMsg);
    }
  };

  logger.logLeft(`${clientA_str} created`);
  const clientA = new AsyncSecureClient(fakeWebSocketA, onLogA);

  logger.logRight(`${clientB_str} created`);
  const clientB = new AsyncSecureClient(fakeWebSocketB, onLogB);

  clientA.onReceive(async (inText) => {
    logger.alignedLog("left", `${clientA_str} received:`);
    logger.alignedLog("left", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${inText}"`)));
    logger.alignedLog("left", `\n`);
  });
  clientB.onReceive(async (inText) => {
    logger.alignedLog("right", `${clientB_str} received:`);
    logger.alignedLog("right", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${inText}"`)));
    logger.alignedLog("right", `\n`);
  });

  await Promise.all([
    clientA.initialize(),
    clientB.initialize(),
  ]);


  //
  //
  //

  logger.logCenter(logger.makeBorder(`[unencrypted] Client A send to Client B`));

  logger.logLeft(`${clientA_str} now sending a message:`);
  const messageToSend = "Hello, is this safe?";
  logger.alignedLog("left", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${messageToSend}"`)));
  logger.log(`\n`);
  clientA.send(messageToSend);

  while (
    fakeWebSocketA.hasMessageToSend() ||
    fakeWebSocketB.hasMessageToSend()
  ) {
    await fakeWebSocketA.pipeMessages(fakeWebSocketB);
    await fakeWebSocketB.pipeMessages(fakeWebSocketA);
  }

  logger.logCenter(logger.makeBorder(`[unencrypted] Client B send to Client A`));

  logger.logRight(`${clientB_str} now sending a message:`);
  const messageToReply = "Hi, no... it isn't safe...";
  logger.alignedLog("right", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${messageToReply}"`)));
  logger.log(`\n`);
  clientB.send(messageToReply);

  while (
    fakeWebSocketA.hasMessageToSend() ||
    fakeWebSocketB.hasMessageToSend()
  ) {
    await fakeWebSocketA.pipeMessages(fakeWebSocketB);
    await fakeWebSocketB.pipeMessages(fakeWebSocketA);
  }

  //
  //

  logger.logCenter(logger.makeBorder(`Client A send request for encryption to Client B`));

  await clientA.makeSecure();

  while (
    fakeWebSocketA.hasMessageToSend() ||
    fakeWebSocketB.hasMessageToSend()
  ) {
    await fakeWebSocketA.pipeMessages(fakeWebSocketB);
    await fakeWebSocketB.pipeMessages(fakeWebSocketA);
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
  await fakeWebSocketA.pipeMessages(fakeWebSocketB);

  logger.logCenter(logger.makeBorder(`[encrypted] Client B send to Client A`));

  logger.logRight(`${clientB_str} now sending a message:`);
  const newMessageToReply = "I'd say we're pretty safe right now :)";
  logger.alignedLog("right", logger.makeColor([64,128+64,64], logger.makeSize(25, `"${newMessageToReply}"`)));
  logger.log(`\n`);
  clientB.send(newMessageToReply);
  await fakeWebSocketB.pipeMessages(fakeWebSocketA);

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
