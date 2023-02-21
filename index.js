
const wasmCryptoppJs = require("./build/wasm-cryptopp");

const printImportantText = (logger, inStr) => {

  const spaceFiller = `#${"".padStart(inStr.length + 2, ' ')}#`;
  const delimiterFiller = "".padStart(inStr.length + 4, '#');

  logger.log("");
  logger.log(delimiterFiller);
  logger.log(spaceFiller);
  logger.log(`# ${inStr} #`);
  logger.log(spaceFiller);
  logger.log(delimiterFiller);
  logger.log("");
};

const printHexadecimalStrings = (logger, inHexStr, inStep) => {

  const strSize = inHexStr.length.toString();
  let index = 0;
  while (index < inHexStr.length) {
    logger.log(` => {${index.toString().padStart(3)} / ${strSize}} ${inHexStr.substr(index, inStep)}`);
    index += inStep;
  }
};

const runDiffieHellmanClientTest = (logger, wasmModule) => {

  logger.log("");
  logger.log("");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("##########");
  logger.log("########## DiffieHellmanClient test");
  logger.log("##########");
  logger.log("#####");
  logger.log("");
  logger.log("");

  printImportantText(logger, "DiffieHellmanClient: client A initialize");

  logger.log("client A created");
  const clientA = new wasmModule.DiffieHellmanClientJs();
  logger.log("client A generate keys");
  clientA.generateKeys();
  logger.log("client A provide public key");
  const pubKeyHexJsStr_A = clientA.getPublicKeyAsHexStr();
  logger.log("client A public key as hexadecimal value:");
  printHexadecimalStrings(logger, pubKeyHexJsStr_A, 64);
  logger.log();

  printImportantText(logger, "DiffieHellmanClient: client B initialize");

  logger.log("client B created");
  const clientB = new wasmModule.DiffieHellmanClientJs();
  logger.log("client B generate keys");
  clientB.generateKeys();
  logger.log("client B provide public key");
  const pubKeyHexJsStr_B = clientB.getPublicKeyAsHexStr();
  logger.log("client B public key as hexadecimal value:");
  printHexadecimalStrings(logger, pubKeyHexJsStr_B, 64);
  logger.log();

  //
  //
  //

  printImportantText(logger, "DiffieHellmanClient: client A compute shared secret");

  logger.log();
  logger.log("client A compute shared secret with client B public key");
  clientA.computeSharedSecretFromHexStr(pubKeyHexJsStr_B);
  const sharedSecretHexJsStr_A = clientA.getSharedSecretAsHexStr();
  logger.log("client A shared secret as hexadecimal value:");
  printHexadecimalStrings(logger, sharedSecretHexJsStr_A, 64);
  logger.log();

  printImportantText(logger, "DiffieHellmanClient: client B compute shared secret");

  logger.log();
  logger.log("client B compute shared secret with client A public key");
  clientB.computeSharedSecretFromHexStr(pubKeyHexJsStr_A);
  const sharedSecretHexJsStr_B = clientB.getSharedSecretAsHexStr();
  logger.log("client B shared secret as hexadecimal value:");
  printHexadecimalStrings(logger, sharedSecretHexJsStr_B, 64);
  logger.log();


  //
  //
  //

  printImportantText(logger, "DiffieHellmanClient: verification");

  if (sharedSecretHexJsStr_A == sharedSecretHexJsStr_B) {
    logger.log();
    logger.log(" => SUCCESS: BOTH CLIENTS SHARE THE SAME SECRET!");
    logger.log();
  } else {
    logger.log();
    logger.log("=> FAILURE: CLIENTS SECRETS ARE NOT MATCHING!");
    logger.log();
  }

  //
  //
  //


  clientA.dispose();
  clientB.dispose();

  logger.log("");
  logger.log("");
  logger.log("#####");
  logger.log("##########");
  logger.log("########## DiffieHellmanClient test");
  logger.log("##########");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("#################################################################################################");
  logger.log("");
  logger.log("");

};

const runAesSymmetricTest = (logger, wasmModule) => {

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



wasmCryptoppJs().then((wasmModule) => {

  console.log("");
  console.log("");
  console.log("#");
  console.log("## START");
  console.log("#");
  console.log("");
  console.log("");

  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");

  runDiffieHellmanClientTest(console, wasmModule);

  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");

  runAesSymmetricTest(console, wasmModule);

  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");

  console.log("");
  console.log("");
  console.log("#");
  console.log("## STOP");
  console.log("#");
  console.log("");
  console.log("");

});

