
import { Logger } from "./Logger";

export const printHexadecimalStrings = (logger: Logger, inHexStr: string, inStep: number, inAlign: "left" | "center" | "right") => {

  const strSize = inHexStr.length.toString();
  let index = 0;
  while (index < inHexStr.length) {

    const currLine = inHexStr.substr(index, inStep);
    let currText = currLine;
    if (index > 0)
      currText = currText.padEnd(inStep, '_');
    const coloredText = logger.makeColor([128,128,64], currText);

    switch (inAlign) {
      case "left": {
        logger.alignedLog(inAlign, ` => {${index.toString().padStart(3, '_')} / ${strSize}} ${coloredText}`);
        break;
      }
      case "right": {
        logger.alignedLog(inAlign, `${coloredText} {${index.toString().padStart(3, '_')} / ${strSize}} <= `);
        break;
      }
      case "center": {
        logger.alignedLog(inAlign, `${coloredText}`);
        break;
      }
    }

    index += inStep;
  }
};
