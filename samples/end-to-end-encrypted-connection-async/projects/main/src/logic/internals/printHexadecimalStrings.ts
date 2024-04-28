
type onLogCallback = (inLogMsg: string, inLogHeader?: string) => void;

export const printHexadecimalStrings = (onLogging: onLogCallback, inHexStr: string, inStep: number) => {

  const strSize = inHexStr.length.toString();
  let index = 0;
  while (index < inHexStr.length) {

    const currLine = inHexStr.substr(index, inStep);
    let currText = currLine;
    if (index > 0) {
      currText = currText.padEnd(inStep, '_');
    }

    onLogging(` => {${index.toString().padStart(3, '_')} / ${strSize}} ${currText}`);

    index += inStep;
  }
};
