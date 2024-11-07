
export class Logger {

  private _parentElement: HTMLBaseElement;

  constructor(parentElement: HTMLBaseElement) {
    this._parentElement = parentElement;
    this._clear();
  }

  static makeBorder(inStr: string) {
    return `<span style="padding: 10px; margin: 10px; border: 3px solid; border-color: rgb(64, 64, 64); line-height: 5.8;">${inStr}</span>`;
  }

  // makeColor(inColor: [number, number, number], inStr: string) {
  //   return Logger.makeColor(inColor, inStr);
  // }
  static makeColor(inColor: [number, number, number], inStr: string) {
    return `<span style="color: rgb(${inColor[0]}, ${inColor[1]}, ${inColor[2]});">${inStr}</span>`;
  }

  // makeSize(inSize: number, inStr: string) {
  //   return Logger.makeSize(inSize, inStr);
  // }
  static makeSize(inSize: number, inStr: string) {
    return `<span style="font-size: ${inSize}px;">${inStr}</span>`;
  }

  alignedLog(align: "left" | "right" | "center", ...args: any) {

    const text = args.join(' ').split("\n").join("<br>") + "<br>";

    const newParagraph = document.createElement("p") as HTMLParagraphElement;
    newParagraph.innerHTML = text;
    (newParagraph as any).style = `text-align: ${align};`; // TODO
    this._parentElement.appendChild(newParagraph);
  }

  log(...args: any[]) {
    this.alignedLog.apply(this, ["left", ...args]);
  }

  logLeft(...args: any[]) {
    this.alignedLog.apply(this, ["left", ...args]);
  }

  logRight(...args: any[]) {
    this.alignedLog.apply(this, ["right", ...args]);
  }

  logCenter(...args: any[]) {
    this.alignedLog.apply(this, ["center", ...args]);
  }

  error(...args: any[]) {
    this.alignedLog.apply(this, ["center", 'ERR', ...args]);
  }

  _clear() {
    while (this._parentElement.firstChild)
      this._parentElement.removeChild(this._parentElement.lastChild!);
  }

}

