
// import { Logger, CrytpoppWasmModule } from "../../_common";
import { Logger, CrytpoppWasmModule } from "@local-framework";

import { runLogic } from "./logic";

const findOrFailHtmlElement = <T extends Element>(inId: string): T => {
  const htmlElement = document.querySelector<T>(inId);
  if (!htmlElement)
    throw new Error(`DOM elements not found, id: "${inId}"`);
  return htmlElement;
};

window.onload = async () => {

  const testStartTime = Date.now();

  const loggerOutput = findOrFailHtmlElement<HTMLBaseElement>("#loggerOutput");
  const logger = new Logger(loggerOutput);

  logger.logCenter("page loaded");

  logger.logCenter(logger.makeColor([255,0,0], "\n\nSTART\n\n"));

  logger.logCenter(" loading wasmCryptoppJs wasm script");

  const loadStartTime = Date.now();

  await CrytpoppWasmModule.load();

  const loadEndTime = Date.now();

  logger.logCenter(`wasmCryptoppJs wasm module loaded (${loadEndTime - loadStartTime}ms)`);

  //
  //
  //

  await runLogic(logger);

  //
  //
  //


  const testEndTime = Date.now();
  logger.logCenter(logger.makeColor([255,0,0], `\n\nSTOP (${testEndTime - testStartTime}ms)\n\n`));

};
