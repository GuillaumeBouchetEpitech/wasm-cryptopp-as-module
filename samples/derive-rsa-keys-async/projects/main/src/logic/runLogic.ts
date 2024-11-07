
// import { SecureClient } from "./SecureClient";
// import { AsyncSecureClient, onLogCallback } from "./AsyncSecureClient";
import { DeriveRsaKeysWorker } from "./internals/DeriveRsaKeysWorker";

import { CrytpoppWasmModule, printHexadecimalStrings } from "@local-framework";

// import { FakeWebSocket } from "./internals/FakeWebSocket";

import { Logger } from "@local-framework";

export const runLogic = async (logger: Logger) => {

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("Derive RSA Keys from password"))));

  const wasmModule = CrytpoppWasmModule.get()

  const deriveRsaKeysWorker = new DeriveRsaKeysWorker();

  await deriveRsaKeysWorker.initialize();

  // const keySize = 1024 * 3;
  const keySize = 1024 * 1;

  logger.logCenter(Logger.makeBorder(`Test1, Password: "pineapple", Key Size: ${keySize}`));
  let elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pineapple", keySize);
  logger.logCenter(deriveRsaKeysWorker.privateKeyPem!);
  logger.logCenter(deriveRsaKeysWorker.publicKeyPem!);
  logger.logCenter(Logger.makeBorder(`Test1 elapsedTime: ${elapsedTime}ms`));

  const rsaKeyPairTest1 = deriveRsaKeysWorker.makeRsaKeyPair();

  logger.logCenter(Logger.makeBorder(`Test2, Password: "pen", Key Size: ${keySize}`));
  elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pen", keySize);
  logger.logCenter(deriveRsaKeysWorker.privateKeyPem!);
  logger.logCenter(deriveRsaKeysWorker.publicKeyPem!);
  logger.logCenter(Logger.makeBorder(`Test2 elapsedTime: ${elapsedTime}ms`));

  const rsaKeyPairTest2 = deriveRsaKeysWorker.makeRsaKeyPair();

  logger.logCenter(Logger.makeBorder(`Test3, Password: "pineapple", Key Size: ${keySize}`));
  elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pineapple", keySize);
  logger.logCenter(deriveRsaKeysWorker.privateKeyPem!);
  logger.logCenter(deriveRsaKeysWorker.publicKeyPem!);
  logger.logCenter(Logger.makeBorder(`Test3 elapsedTime: ${elapsedTime}ms`));

  const rsaKeyPairTest3 = deriveRsaKeysWorker.makeRsaKeyPair();

  //

  logger.logCenter(Logger.makeBorder(`Sign payload with Test1 private key`));
  const payload = 'LOL';

  const signedPayload = rsaKeyPairTest1.signPayloadToHexStr(payload);

  logger.logCenter(`\npayload: "${payload}"`);
  logger.logCenter(`\nsignedPayload`);
  printHexadecimalStrings(logger, signedPayload, 64, 'center');

  logger.logCenter(Logger.makeBorder(`Verify payload with Test3 public key (NOT the same password)`));

  try {
    const verifiedPayloadA = rsaKeyPairTest2.verifyHexStrPayloadToStr(signedPayload);

    logger.logCenter(`\nverifiedPayload: "${verifiedPayloadA}"`);
  } catch (err: any) {
    logger.logCenter(`\nverifiedPayload ERROR: "${err?.message}"`);
  }

  logger.logCenter(Logger.makeBorder(`Verify payload with Test3 public key (WITH the same password)`));

  const verifiedPayloadB = rsaKeyPairTest3.verifyHexStrPayloadToStr(signedPayload);

  logger.logCenter(`\nverifiedPayload: "${verifiedPayloadB}"`);


  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder(`Derive RSA Keys from password`))));


};
