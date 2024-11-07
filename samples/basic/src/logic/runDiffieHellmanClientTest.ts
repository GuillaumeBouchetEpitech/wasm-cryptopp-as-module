
import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "@local-framework";

import { profileScope } from "./internals";

export const runDiffieHellmanClientTest = async (logger: Logger) => {

  const wasmModule = CrytpoppWasmModule.get();

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("DiffieHellmanClient test"))));


  const clientA_str = Logger.makeColor([128 + 64,128,128], "Client A");
  const clientB_str = Logger.makeColor([128,128,128 + 64], "Client B");

  //
  //
  //

  logger.logCenter(Logger.makeBorder(`${clientA_str} initialize`));

  logger.logLeft(`${clientA_str} created`);
  const clientA = new wasmModule.DiffieHellmanClientJs();
  logger.logLeft(`${clientA_str} generate keys`);
  logger.alignedLog('left', "generating");
  await profileScope(() => {
    clientA.generateRandomKeysSimpler();
  }, (elapsed) => {
    logger.alignedLog('left', `generated (${elapsed}ms)`);
  });
  logger.logLeft(`${clientA_str} provide public key`);
  const pubKeyHexStr_A = clientA.getPublicKeyAsHexStr();
  logger.logLeft(`${clientA_str} public key as hexadecimal value:`);
  printHexadecimalStrings(logger, pubKeyHexStr_A, 64, 'left');
  logger.log();

  logger.logCenter(Logger.makeBorder(`${clientB_str} initialize`));

  logger.logRight(`${clientB_str} created`);
  const clientB = new wasmModule.DiffieHellmanClientJs();
  logger.logRight(`${clientB_str} generate keys`);
  logger.alignedLog('right', "generating");
  await profileScope(() => {
    clientB.generateRandomKeysSimpler();
  }, (elapsed) => {
    logger.alignedLog('right', `generated (${elapsed}ms)`);
  });
  logger.logRight(`${clientB_str} provide public key`);
  const pubKeyHexStr_B = clientB.getPublicKeyAsHexStr();
  logger.logRight(`${clientB_str} public key as hexadecimal value:`);
  printHexadecimalStrings(logger, pubKeyHexStr_B, 64, 'right');
  logger.log();

  //
  //
  //

  logger.logCenter(Logger.makeBorder(`${clientA_str} compute shared secret (with ${clientB_str} public key)`));

  logger.alignedLog('left', "computing");
  const sharedSecretHexStr_A = await profileScope(() => {
    clientA.computeSharedSecretFromHexStr(pubKeyHexStr_B);
    return clientA.getSharedSecretAsHexStr();
  }, (elapsed) => {
    logger.alignedLog('left', `computed (${elapsed}ms)`);
  });

  logger.logLeft(`${clientA_str} computed shared secret as hexadecimal value:`);
  printHexadecimalStrings(logger, sharedSecretHexStr_A, 64, 'left');
  logger.log();

  logger.logCenter(Logger.makeBorder(`${clientB_str} compute shared secret (with ${clientA_str} public key)`));

  logger.alignedLog('right', "computing");
  const sharedSecretHexStr_B = await profileScope(() => {
    clientB.computeSharedSecretFromHexStr(pubKeyHexStr_A);
    return clientB.getSharedSecretAsHexStr();
  }, (elapsed) => {
    logger.alignedLog('right', `computed (${elapsed}ms)`);
  });

  logger.logRight(`${clientB_str} computed shared secret as hexadecimal value:`);
  printHexadecimalStrings(logger, sharedSecretHexStr_B, 64, 'right');
  logger.log();


  //
  //
  //

  logger.logCenter(Logger.makeBorder(`verification`));

  if (sharedSecretHexStr_A == sharedSecretHexStr_B) {
    logger.logCenter(`
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], ` => SUCCESS: BOTH CLIENTS SHARE THE SAME SECRET!`))}
    `);
  } else {
    logger.logCenter(`
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], ` => FAILURE: CLIENTS SECRETS ARE NOT MATCHING!`))}
    `);
  }

  //
  //
  //

  clientA.delete();
  clientB.delete();


  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder(`DiffieHellmanClient test`))));


};
