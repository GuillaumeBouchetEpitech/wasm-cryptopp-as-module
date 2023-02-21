
export const printImportantText = (logger, inStr) => {

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

export const printHexadecimalStrings = (logger, inHexStr, inStep) => {

  const strSize = inHexStr.length.toString();
  let index = 0;
  while (index < inHexStr.length) {
    logger.log(` => {${index.toString().padStart(3)} / ${strSize}} ${inHexStr.substr(index, inStep)}`);
    index += inStep;
  }
};
