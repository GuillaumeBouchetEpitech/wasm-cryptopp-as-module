
import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";

export const runDiffieHellmanClientTest = (logger: Logger) => {

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

  // RFC 5114, 1024-bit MODP Group with 160-bit Prime Order Subgroup
  // http://tools.ietf.org/html/rfc5114#section-2.1

  const localP = [
    "0xB10B8F96A080E01DDE92DE5EAE5D54EC52C99FBCFB06A3C6",
    "9A6A9DCA52D23B616073E28675A23D189838EF1E2EE652C0",
    "13ECB4AEA906112324975C3CD49B83BFACCBDD7D90C4BD70",
    "98488E9C219A73724EFFD6FAE5644738FAA31A4FF55BCCC0",
    "A151AF5F0DC8B4BD45BF37DF365C1A65E68CFDA76D4DA708",
    "DF1FB2BC2E4A4371"
  ].join("");

  const localQ = "0xF518AA8781A8DF278ABA4E7D64B7CB9D49462353";

  const localG = [
    "0xA4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507F",
    "D6406CFF14266D31266FEA1E5C41564B777E690F5504F213",
    "160217B4B01B886A5E91547F9E2749F4D7FBD7D3B9A92EE1",
    "909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28A",
    "D662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24",
    "855E6EEB22B3B2E5"
  ].join("");

  //
  //
  //

  logger.logCenter(logger.makeBorder(`${clientA_str} initialize`));

  logger.logLeft(`${clientA_str} created`);
  const clientA = new wasmModule.DiffieHellmanClientJs();
  logger.logLeft(`${clientA_str} generate keys`);
  clientA.generateKeys(localP, localQ, localG);
  logger.logLeft(`${clientA_str} provide public key`);
  const pubKeyHexStr_A = clientA.getPublicKeyAsHexStr();
  // logger.log(`${clientA_str} public key as hexadecimal value:`);
  // printHexadecimalStrings(logger, pubKeyHexStr_A, 64);
  // logger.log();

  logger.logCenter(logger.makeBorder(`${clientB_str} initialize`));

  logger.logRight(`${clientB_str} created`);
  const clientB = new wasmModule.DiffieHellmanClientJs();
  logger.logRight(`${clientB_str} generate keys`);
  clientB.generateKeys(localP, localQ, localG);
  logger.logRight(`${clientB_str} provide public key`);
  const pubKeyHexStr_B = clientB.getPublicKeyAsHexStr();
  // logger.log(`${clientB_str} public key as hexadecimal value:`);
  // printHexadecimalStrings(logger, pubKeyHexStr_B, 64);
  // logger.log();

  //
  //
  //

  logger.logCenter(logger.makeBorder(`${clientA_str} compute shared secret (with ${clientB_str} public key)`));

  clientA.computeSharedSecretFromHexStr(pubKeyHexStr_B);
  const sharedSecretHexStr_A = clientA.getSharedSecretAsHexStr();
  logger.logLeft(`${clientA_str} computed shared secret as hexadecimal value:`);
  printHexadecimalStrings(logger, sharedSecretHexStr_A, 64, 'left');
  logger.log();

  logger.logCenter(logger.makeBorder(`${clientB_str} compute shared secret (with ${clientA_str} public key)`));

  clientB.computeSharedSecretFromHexStr(pubKeyHexStr_A);
  const sharedSecretHexStr_B = clientB.getSharedSecretAsHexStr();
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
