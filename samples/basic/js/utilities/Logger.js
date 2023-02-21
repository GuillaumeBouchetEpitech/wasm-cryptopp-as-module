
export class Logger {

  constructor(textAreaElement) {
    this._textAreaElement = textAreaElement;
    this._textAreaElement.value = ""; // <= clear any browser cache
    this._lines = [];
  }

  log(...args) {

    if (args.length == 0) {
      this._lines.push("");
      return;
    }

    const text = Array.prototype.slice.call(args).join(' ');

    console.log(text);

    this._pushText(text);
  }

  error(...args) {

    if (args.length == 0) {
      this._lines.push("");
      return;
    }

    const text = Array.prototype.slice.call(args).join(' ');

    console.error(text);

    this._pushText(`[ERR] - ${text}`);
  }

  _pushText(text) {

    this._lines.push(text);

    this._textAreaElement.value = `${this._lines.join("\n")}\n`;

    // force focus on last line
    this._textAreaElement.scrollTop = this._textAreaElement.scrollHeight;
  }

  get size() {
    return this._lines.length;
  }
}

