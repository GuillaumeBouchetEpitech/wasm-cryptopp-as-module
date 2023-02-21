
import {
  printHexadecimalStrings,
  printImportantText
} from "./helpers.js";

export const runDiffieHellmanClientTest = (logger, wasmModule) => {

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
