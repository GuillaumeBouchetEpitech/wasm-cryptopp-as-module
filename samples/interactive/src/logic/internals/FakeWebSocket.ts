
import { onReceiveCallback, ICommunication } from "../SecureClient";

import { logMessagePayload } from "./logMessagePayload";

import { Logger } from "@local-framework";

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
    // this._logger.alignedLog(this._logTextAlign, `SecureClient ${this._myName} sent a message`);
    // // logMessagePayload(this._logTextAlign, inText);
    // this._logger.alignedLog(this._logTextAlign, "\n");
    this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" sent a message\n`);


    this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
    // this._logger.alignedLog("center", "\n");
    logMessagePayload(this._logger, 'center', inText);
    // this._logger.alignedLog("center", "\n");
    this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
    this._logger.alignedLog("center", "\n");

    this._allSentMessages.push(inText);
  }

  receive(inText: string) {
    this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" received a message`);
    this._allOnReceiveCallbacks.forEach((callback) => callback(inText));
  }

  onReceive(inCallback: onReceiveCallback): void {
    this._allOnReceiveCallbacks.push(inCallback);
  }

  pipeMessages(other: FakeWebSocket): void {
    this._allSentMessages.forEach((inText) => other.receive(inText));
    this._allSentMessages.length = 0;
  }

  hasMessageToSend() {
    return this._allSentMessages.length > 0;
  }
};
