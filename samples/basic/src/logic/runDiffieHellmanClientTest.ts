
import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";

import { profileScope } from "./internals";

export const runDiffieHellmanClientTest = async (logger: Logger) => {

  const wasmModule = CrytpoppWasmModule.get();

  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder("DiffieHellmanClient test"))));


  const clientA_str = logger.makeColor([128 + 64,128,128], "Client A");
  const clientB_str = logger.makeColor([128,128,128 + 64], "Client B");

  //
  //
  //

  // 2.3.  2048-bit MODP Group with 256-bit Prime Order Subgroup
  // https://www.rfc-editor.org/rfc/rfc5114#section-2.3

  const localP = [
    "0x87A8E61DB4B6663CFFBBD19C651959998CEEF608660DD0F2",
    "5D2CEED4435E3B00E00DF8F1D61957D4FAF7DF4561B2AA30",
    "16C3D91134096FAA3BF4296D830E9A7C209E0C6497517ABD",
    "5A8A9D306BCF67ED91F9E6725B4758C022E0B1EF4275BF7B",
    "6C5BFC11D45F9088B941F54EB1E59BB8BC39A0BF12307F5C",
    "4FDB70C581B23F76B63ACAE1CAA6B7902D52526735488A0E",
    "F13C6D9A51BFA4AB3AD8347796524D8EF6A167B5A41825D9",
    "67E144E5140564251CCACB83E6B486F6B3CA3F7971506026",
    "C0B857F689962856DED4010ABD0BE621C3A3960A54E710C3",
    "75F26375D7014103A4B54330C198AF126116D2276E11715F",
    "693877FAD7EF09CADB094AE91E1A1597",
  ].join("");

  const localQ = "0x8CF83642A709A097B447997640129DA299B1A47D1EB3750BA308B0FE64F5FBD3";

  const localG = [
    "0x3FB32C9B73134D0B2E77506660EDBD484CA7B18F21EF2054",
    "07F4793A1A0BA12510DBC15077BE463FFF4FED4AAC0BB555",
    "BE3A6C1B0C6B47B1BC3773BF7E8C6F62901228F8C28CBB18",
    "A55AE31341000A650196F931C77A57F2DDF463E5E9EC144B",
    "777DE62AAAB8A8628AC376D282D6ED3864E67982428EBC83",
    "1D14348F6F2F9193B5045AF2767164E1DFC967C1FB3F2E55",
    "A4BD1BFFE83B9C80D052B985D182EA0ADB2A3B7313D3FE14",
    "C8484B1E052588B9B7D2BBD2DF016199ECD06E1557CD0915",
    "B3353BBB64E0EC377FD028370DF92B52C7891428CDC67EB6",
    "184B523D1DB246C32F63078490F00EF8D647D148D4795451",
    "5E2327CFEF98C582664B4C0F6CC41659",
  ].join("");

  //
  //
  //

  logger.logCenter(logger.makeBorder(`${clientA_str} initialize`));

  logger.logLeft(`${clientA_str} created`);
  const clientA = new wasmModule.DiffieHellmanClientJs();
  logger.logLeft(`${clientA_str} generate keys`);
  logger.alignedLog('left', "generating");
  await profileScope(() => {
    clientA.generateKeys(localP, localQ, localG);
  }, (elapsed) => {
    logger.alignedLog('left', `generated (${elapsed}ms)`);
  });
  logger.logLeft(`${clientA_str} provide public key`);
  const pubKeyHexStr_A = clientA.getPublicKeyAsHexStr();
  // logger.log(`${clientA_str} public key as hexadecimal value:`);
  // printHexadecimalStrings(logger, pubKeyHexStr_A, 64);
  // logger.log();

  logger.logCenter(logger.makeBorder(`${clientB_str} initialize`));

  logger.logRight(`${clientB_str} created`);
  const clientB = new wasmModule.DiffieHellmanClientJs();
  logger.logRight(`${clientB_str} generate keys`);
  logger.alignedLog('right', "generating");
  await profileScope(() => {
    clientB.generateKeys(localP, localQ, localG);
  }, (elapsed) => {
    logger.alignedLog('right', `generated (${elapsed}ms)`);
  });
  logger.logRight(`${clientB_str} provide public key`);
  const pubKeyHexStr_B = clientB.getPublicKeyAsHexStr();
  // logger.log(`${clientB_str} public key as hexadecimal value:`);
  // printHexadecimalStrings(logger, pubKeyHexStr_B, 64);
  // logger.log();

  //
  //
  //

  logger.logCenter(logger.makeBorder(`${clientA_str} compute shared secret (with ${clientB_str} public key)`));

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

  logger.logCenter(logger.makeBorder(`${clientB_str} compute shared secret (with ${clientA_str} public key)`));

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

  logger.logCenter(logger.makeBorder(`verification`));

  if (sharedSecretHexStr_A == sharedSecretHexStr_B) {
    logger.logCenter(`
      ${logger.makeBorder(logger.makeColor([128, 255, 128], ` => SUCCESS: BOTH CLIENTS SHARE THE SAME SECRET!`))}
    `);
  } else {
    logger.logCenter(`
      ${logger.makeBorder(logger.makeColor([255, 128, 128], ` => FAILURE: CLIENTS SECRETS ARE NOT MATCHING!`))}
    `);
  }

  //
  //
  //

  clientA.delete();
  clientB.delete();


  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder(`DiffieHellmanClient test`))));


};
