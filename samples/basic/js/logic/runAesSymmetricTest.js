
import {
  printImportantText
} from "./helpers.js";

export const runAesSymmetricTest = (logger, wasmModule) => {

  logger.log("");
  logger.log("");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("##########");
  logger.log("########## AesSymmetricCipher / AesSymmetricDecipher test");
  logger.log("##########");
  logger.log("#####");
  logger.log("");
  logger.log("");

  //
  //
  // generate

  const prng = new wasmModule.AutoSeededRandomPoolJs();
  logger.log("generate random key value");
  const keyHexJsStr = prng.getRandomHexStr(16);
  logger.log("generate random iv value");
  const ivHexJsStr = prng.getRandomHexStr(16);
  prng.dispose();

  printImportantText(logger, "AesSymmetricCipher: initialize");

  logger.log("create the AES Symmetric Cipher");
  const aesEncryptCipher = new wasmModule.AesSymmetricCipherJs();
  logger.log("initialize the AES Symmetric Cipher");
  aesEncryptCipher.initializeFromHexStr(keyHexJsStr, ivHexJsStr);

  printImportantText(logger, "AesSymmetricDecipher: initialize");

  logger.log("create the AES Symmetric Decipher");
  const aesDecryptCipher = new wasmModule.AesSymmetricDecipherJs();
  logger.log("initialize the AES Symmetric Decipher");
  aesDecryptCipher.initializeFromHexStr(keyHexJsStr, ivHexJsStr);

  //
  //
  // encrypt

  printImportantText(logger, "AesSymmetricCipher: encrypt payload");

  const inputJsStr = "This is my plain text message....";

  logger.log(`original payload:  "${inputJsStr}"`);

  const inputJsHexStr = wasmModule.utf8ToHex(inputJsStr);
  const encodedHexStr = aesEncryptCipher.encryptFromHexStrAsHexStr(inputJsHexStr);

  logger.log(`encrypted payload: "${encodedHexStr}"`);

  //
  //
  // decrypt

  printImportantText(logger, "AesSymmetricDecipher: decrypt payload");

  const decodedHexStr = aesDecryptCipher.decryptFromHexStrAsHexStr(encodedHexStr);
  const recovered = wasmModule.hexToUtf8(decodedHexStr)

  logger.log(`decrypted payload: "${recovered}"`);
  logger.log(`original payload:  "${inputJsStr}"`);

  printImportantText(logger, "Verification");

  if (recovered === inputJsStr) {
    logger.log();
    logger.log(" => SUCCESS: ENCRYPTED PAYLOAD WAS RECOVERED!");
    logger.log();
  } else {
    logger.log();
    logger.log(" => FAILURE: ENCRYPTED PAYLOAD WAS NOT RECOVERED!");
    logger.log();
  }

  //
  //
  //

  aesEncryptCipher.dispose();
  aesDecryptCipher.dispose();

  logger.log("");
  logger.log("");
  logger.log("#####");
  logger.log("##########");
  logger.log("########## AesSymmetricCipher / AesSymmetricDecipher test");
  logger.log("##########");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("");
  logger.log("");

};
