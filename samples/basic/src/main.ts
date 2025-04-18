
// import { Logger, CrytpoppWasmModule } from "../../_common";
import { Logger, CrytpoppWasmModule } from "@local-framework";

import {
  runDiffieHellmanClientTest,
  runEllipticCurveDiffieHellmanClientTest,
  runAesSymmetricTest,
  runRSAFeaturesTest,
  runDeriveKey
} from "./logic";

const findOrFailHtmlElement = <T extends Element>(inId: string): T => {
  const htmlElement = document.querySelector<T>(inId);
  if (!htmlElement)
    throw new Error(`DOM elements not found, id: "${inId}"`);
  return htmlElement;
};


window.onload = async () => {


  const loggerOutput = findOrFailHtmlElement<HTMLBaseElement>("#loggerOutput");
  const logger = new Logger(loggerOutput);

  logger.logCenter(Logger.makeColor([255,0,0], "\n\nSTART\n\n"));

  logger.logCenter("page loaded");

  logger.logCenter(" loading wasmCryptoppJs wasm script");

  const loadStartTime = Date.now();

  await CrytpoppWasmModule.load();

  const loadEndTime = Date.now();
  const elapsedTime = (loadEndTime - loadStartTime);

  logger.logCenter(`wasmCryptoppJs wasm module loaded ${elapsedTime}ms`);

  //
  //
  //

  await runAesSymmetricTest(logger);

  //
  //
  //

  await runDiffieHellmanClientTest(logger);

  //
  //
  //

  await runEllipticCurveDiffieHellmanClientTest(logger);

  //
  //
  //

  await runRSAFeaturesTest(logger);

  //
  //
  //

  await runDeriveKey(logger);

  //
  //
  //

  logger.logCenter(Logger.makeColor([255,0,0], "\n\nSTOP\n\n"));

};
