
import {
  Logger,
  scriptLoadingUtility
} from "./utilities/index.js";

import { runDiffieHellmanClientTest, runAesSymmetricTest } from "./logic/index.js";

const findOrFailHtmlElement = (elementId) => {
  const textAreaElement = document.querySelector(elementId);
  if (!textAreaElement)
    throw new Error(`DOM elements not found, id=${elementId}`);
  return textAreaElement;
};


window.onload = async () => {

  const textArea = findOrFailHtmlElement("#loggerOutput");
  const logger = new Logger(textArea);

  logger.log("");
  logger.log("");
  logger.log("#");
  logger.log("## START");
  logger.log("#");
  logger.log("");
  logger.log("");

  logger.log("page loaded");

  await scriptLoadingUtility("./cryptopp/wasm-cryptopp.js");

  logger.log("wasmCryptoppJs wasm script loaded");

  const wasmModule = await wasmCryptoppJs();

  logger.log("wasmCryptoppJs wasm module loaded");

  //
  //
  //

  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");

  runAesSymmetricTest(logger, wasmModule);

  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");

  runDiffieHellmanClientTest(logger, wasmModule);

  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");
  logger.log("");

  logger.log("");
  logger.log("");
  logger.log("#");
  logger.log("## STOP");
  logger.log("#");
  logger.log("");
  logger.log("");



};
