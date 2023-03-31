
import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";

export const runAesSymmetricTest = (logger: Logger) => {

  const wasmModule = CrytpoppWasmModule.get();

  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder("AesSymmetricCipher test"))));

  //
  //
  // generate

  const prng = new wasmModule.AutoSeededRandomPoolJs();
  logger.alignedLog('center', "generate random key value");
  const keyHexStr = prng.getRandomHexStr(32);
  logger.alignedLog('center', "generate random iv value");
  const ivHexStr = prng.getRandomHexStr(16);
  prng.delete();

  logger.logCenter(logger.makeBorder("AesSymmetricCipher A: initialize"));
  logger.alignedLog('left', "create the AES Symmetric Cipher A");
  const aesEncryptCipherA = new wasmModule.AesSymmetricCipherJs();
  logger.alignedLog('left', "initialize the AES Symmetric Cipher A");
  aesEncryptCipherA.initializeFromHexStr(keyHexStr, ivHexStr);

  logger.logCenter(logger.makeBorder("AesSymmetricCipher B: initialize"));
  logger.alignedLog('right', "create the AES Symmetric Cipher B");
  const aesEncryptCipherB = new wasmModule.AesSymmetricCipherJs();
  logger.alignedLog('right', "initialize the AES Symmetric Cipher B");
  aesEncryptCipherB.initializeFromHexStr(keyHexStr, ivHexStr);

  //
  //
  // encrypt

  logger.logCenter(logger.makeBorder("AesSymmetricCipher A: encrypt payload"));

  const inputStr = "This is my plain text message....";

  logger.alignedLog('left', `original payload:  "${logger.makeColor([64,128+64,64], inputStr)}"`);

  const inputHexStr = wasmModule.utf8ToHex(inputStr);
  const encodedHexStr = aesEncryptCipherA.encryptFromHexStrAsHexStr(inputHexStr);

  logger.alignedLog('left', `encrypted payload:`);
  printHexadecimalStrings(logger, encodedHexStr, 32, 'left');

  //
  //
  // decrypt

  logger.logCenter(logger.makeBorder("AesSymmetricCipher B: decrypt payload"));

  logger.alignedLog('right', `encrypted payload:`);
  printHexadecimalStrings(logger, encodedHexStr, 32, 'right');

  const decodedHexStr = aesEncryptCipherB.decryptFromHexStrAsHexStr(encodedHexStr);
  const recoveredStr = wasmModule.hexToUtf8(decodedHexStr)

  logger.alignedLog('right', `decrypted payload: "${logger.makeColor([128,128,255], recoveredStr)}"`);
  logger.alignedLog('right', `original payload:  "${logger.makeColor([64,128+64,64], inputStr)}"`);

  logger.logCenter(logger.makeBorder("Verification"));

  if (recoveredStr === inputStr) {
    logger.alignedLog('center', `
      ${logger.makeBorder(logger.makeColor([128, 255, 128], " => SUCCESS: ENCRYPTED PAYLOAD WAS RECOVERED!"))}
    `);
  } else {
    logger.alignedLog('center', `
      ${logger.makeBorder(logger.makeColor([255, 128, 128], " => FAILURE: ENCRYPTED PAYLOAD WAS NOT RECOVERED!"))}
    `);
  }

  //
  //
  //

  aesEncryptCipherA.delete();
  aesEncryptCipherB.delete();


  logger.logCenter(
    logger.makeColor([128,128,0],
      logger.makeSize(30,
        logger.makeBorder("AesSymmetricCipher test"))));

};
