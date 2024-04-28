
import { logMessagePayload } from "./logMessagePayload";

import { Logger } from "@local-framework";

export type onReceiveCallback = (inText: string) => Promise<void>;

export interface ICommunication {
  send(inText: string): void;
  onReceive(inCallback: onReceiveCallback): void;
};

export class FakeWebSocket implements ICommunication {

  private _logger: Logger;
  private _logTextAlign: 'left' | 'right';
  private _myName: string;
  private _otherName: string;
  private _transitionStr: string;

  private _allSentMessages: string[] = [];

  private _allOnReceiveCallbacks: onReceiveCallback[] = [];

  constructor(inLogger: Logger, inLogTextAlign: 'left' | 'right', inMyName: string, inOtherName: string) {
    this._logger = inLogger;
    this._logTextAlign = inLogTextAlign;
    this._myName = inMyName;
    this._otherName = inOtherName;
    this._transitionStr = inLogTextAlign === "right" ? "<-----" : "----->";
  }

  send(inText: string): void {
    this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" sent a message\n`);


    this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
    logMessagePayload(this._logger, 'center', inText);
    this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
    this._logger.alignedLog("center", "\n");

    this._allSentMessages.push(inText);
  }

  async receive(inText: string) {
    this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" received a message`);
    for (const callback of this._allOnReceiveCallbacks) {
      await callback(inText)
    }
  }

  onReceive(inCallback: onReceiveCallback): void {
    this._allOnReceiveCallbacks.push(inCallback);
  }

  async pipeMessages(other: FakeWebSocket): Promise<void> {
    for (const inText of this._allSentMessages) {
      await other.receive(inText);
    }
    this._allSentMessages.length = 0;
  }

  hasMessageToSend() {
    return this._allSentMessages.length > 0;
  }
};
