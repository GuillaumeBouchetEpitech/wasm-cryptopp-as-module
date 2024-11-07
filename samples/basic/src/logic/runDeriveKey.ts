
// import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";
import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "@local-framework";


export const runDeriveKey = async (logger: Logger) => {

  const wasmModule = CrytpoppWasmModule.get();

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("Derive Key Features test"))));

  //
  // DERIVE
  //

  const k_keySize = 64;

  const derivedKeyA = wasmModule.deriveSha256HexStrKeyFromHexStrData(
    wasmModule.utf8ToHex("my password"),
    wasmModule.utf8ToHex("my salt"),
    wasmModule.utf8ToHex("my info"),
    k_keySize
  );

  logger.logCenter(Logger.makeBorder(`Derive key A, password is "my password", size is 64bytes`));

  printHexadecimalStrings(logger, derivedKeyA, 32, 'center');

  const derivedKeyB = wasmModule.deriveSha256HexStrKeyFromHexStrData(
    wasmModule.utf8ToHex("my password"),
    wasmModule.utf8ToHex("my salt"),
    wasmModule.utf8ToHex("my info"),
    k_keySize * 2
  );

  logger.logCenter(Logger.makeBorder(`Derive key B, password is "my password", size is 128bytes`));

  printHexadecimalStrings(logger, derivedKeyB, 32, 'center');

  logger.logCenter(Logger.makeBorder("Verification"));

  if (derivedKeyA === derivedKeyB.slice(0, 128)) {
    logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], " => SUCCESS: THE DERIVED KEY FIRST 64 BYTES WERE THE SAME!"))}
    `);
  } else {
    logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], " => FAILURE: THE DERIVED KEY FIRST 64 BYTES WERE NOT THE SAME!"))}
    `);
  }

  logger.logCenter(
    Logger.makeColor([128,128,0],
      Logger.makeSize(30,
        Logger.makeBorder("Derive Key Features test"))));


};
