
import { Logger, CrytpoppWasmModule } from "../../_common";

import { runLogic } from "./logic";

const findOrFailHtmlElement = <T extends Element>(inId: string): T => {
  const htmlElement = document.querySelector<T>(inId);
  if (!htmlElement)
    throw new Error(`DOM elements not found, id: "${inId}"`);
  return htmlElement;
};

window.onload = async () => {

  const loggerOutput = findOrFailHtmlElement<HTMLBaseElement>("#loggerOutput");
  const logger = new Logger(loggerOutput);

  logger.logCenter("page loaded");

  logger.logCenter(logger.makeColor([255,0,0], "\n\nSTART\n\n"));

  logger.logCenter("CrytpoppWasmModule: loading");

  await CrytpoppWasmModule.load();

  logger.logCenter("CrytpoppWasmModule: loaded");


  //
  //
  //

  runLogic(logger);

  //
  //
  //

  logger.logCenter(logger.makeColor([255,0,0], "\n\nSTOP\n\n"));

};
