
// import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";
import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "@local-framework";

import { profileScope } from "./internals";

export const runRSAFeaturesTest = async (logger: Logger) => {

  const wasmModule = CrytpoppWasmModule.get();

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("RSA Features test"))));

  //
  // SETUP
  //

  logger.logCenter(Logger.makeBorder("RSA Features: setup"));

  const prng = new wasmModule.AutoSeededRandomPoolJs();

  const primarySet = {
    privateKey: new wasmModule.RSAPrivateKeyJs(),
    publicKey: new wasmModule.RSAPublicKeyJs(),
  };

  const secondarySet = {
    privateKey: new wasmModule.RSAPrivateKeyJs(),
    publicKey: new wasmModule.RSAPublicKeyJs(),
  };

  //
  // INITIALIZE
  //

  logger.logCenter(Logger.makeBorder("RSA Features: initialize"));

  logger.alignedLog('center', "generate random private key of 3072 bytes (PRIVATE KEY A)");

  logger.alignedLog('center', `generating`);
  await profileScope(() => {
    primarySet.privateKey.generateRandomWithKeySizeUsingAutoSeeded(prng, 3072);
  }, (elapsed) => {
    logger.alignedLog('center', `generated (${elapsed}ms)`);
  });

  logger.alignedLog('left', primarySet.privateKey.getAsPemString());

  logger.alignedLog('center', "get public key from the private key (PUBLIC KEY A)");

  primarySet.publicKey.setFromPrivateKey(primarySet.privateKey);

  logger.alignedLog('left', primarySet.publicKey.getAsPemString());

  //
  // PEM LOAD
  //

  logger.logCenter(Logger.makeBorder("RSA Features: PEM GET/LOAD"));

  logger.alignedLog('center', "load a new private key (PRIVATE KEY B) from the PEM of the first private key (PRIVATE KEY A)");

  secondarySet.privateKey.loadFromPemString(primarySet.privateKey.getAsPemString());

  logger.alignedLog('center', "load a new public key (PUBLIC KEY B) from the PEM of the first public key (PUBLIC KEY A)");

  secondarySet.publicKey.loadFromPemString(primarySet.publicKey.getAsPemString());

  //
  // SIGN
  //

  logger.logCenter(Logger.makeBorder("RSA Features: SIGN"));

  logger.alignedLog('center', "sign some content with the second private key (PRIVATE KEY B)");

  const payloadStr = "Hello from JavaScript!";

  logger.alignedLog('center', `original payload:`);
  logger.logCenter(
    Logger.makeColor([0,128,0],
      Logger.makeSize(30, `"${payloadStr}"`)));

  const payloadHexStr = wasmModule!.utf8ToHex(payloadStr);

  logger.alignedLog('center', `signing`);
  const signedHexStr = await profileScope(() => {
    return secondarySet.privateKey.signFromHexStrToHexStrUsingAutoSeeded(prng, payloadHexStr);
  }, (elapsed) => {
    logger.alignedLog('center', `signed (${elapsed}ms)`);
  });

  logger.alignedLog('center', `signed payload:`);
  printHexadecimalStrings(logger, signedHexStr, 64, 'center');

  //
  // VERIFY
  //

  logger.logCenter(Logger.makeBorder("RSA Features: VERIFY"));

  logger.alignedLog('center', "verify signed content with the first public key (PUBLIC KEY A)");

  logger.alignedLog('center', `verifying`);
  const verifiedHexStr = await profileScope(() => {
    return primarySet.publicKey.verifyFromHexStrToHexStr(signedHexStr);
  }, (elapsed) => {
    logger.alignedLog('center', `verified (${elapsed}ms)`);
  });

  const verifiedMessage = wasmModule.hexToUtf8(verifiedHexStr);

  logger.alignedLog('center', `verified payload:`);
  logger.logCenter(
    Logger.makeColor([0,128,0],
      Logger.makeSize(30, `"${verifiedMessage}"`)));

  logger.logCenter(Logger.makeBorder("Verification"));

  if (verifiedMessage === payloadStr) {
    logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], " => SUCCESS: SIGNED PAYLOAD WAS VERIFIED!"))}
    `);
  } else {
    logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], " => FAILURE: SIGNED PAYLOAD WAS NOT VERIFIED!"))}
    `);
  }

  //
  // DEALLOCATE
  //

  secondarySet.publicKey.delete();
  secondarySet.privateKey.delete();
  primarySet.publicKey.delete();
  primarySet.privateKey.delete();
  prng.delete();




  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("RSA Features test"))));


};
