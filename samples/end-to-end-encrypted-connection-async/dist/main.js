'use strict';

const scriptLoadingUtility = (inSrc) => {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement("script");
        scriptElement.src = inSrc;
        // scriptElement.onprogress = (event) => logger.log("event", event);
        scriptElement.addEventListener('load', resolve);
        scriptElement.addEventListener('error', reject);
        document.head.appendChild(scriptElement);
    });
};

class Logger {
    _parentElement;
    constructor(parentElement) {
        this._parentElement = parentElement;
        this._clear();
    }
    makeBorder(inStr) {
        return `<span style="padding: 10px; margin: 10px; border: 3px solid; border-color: rgb(64, 64, 64); line-height: 5.8;">${inStr}</span>`;
    }
    makeColor(inColor, inStr) {
        return `<span style="color: rgb(${inColor[0]}, ${inColor[1]}, ${inColor[2]});">${inStr}</span>`;
    }
    makeSize(inSize, inStr) {
        return `<span style="font-size: ${inSize}px;">${inStr}</span>`;
    }
    alignedLog(align, ...args) {
        const text = args.join(' ').split("\n").join("<br>") + "<br>";
        const newParagraph = document.createElement("p");
        newParagraph.innerHTML = text;
        newParagraph.style = `text-align: ${align};`; // TODO
        this._parentElement.appendChild(newParagraph);
    }
    log(...args) {
        this.alignedLog.apply(this, ["left", ...args]);
    }
    logLeft(...args) {
        this.alignedLog.apply(this, ["left", ...args]);
    }
    logRight(...args) {
        this.alignedLog.apply(this, ["right", ...args]);
    }
    logCenter(...args) {
        this.alignedLog.apply(this, ["center", ...args]);
    }
    error(...args) {
        this.alignedLog.apply(this, ["center", 'ERR', ...args]);
    }
    _clear() {
        while (this._parentElement.firstChild)
            this._parentElement.removeChild(this._parentElement.lastChild);
    }
}

class CrytpoppWasmModule {
    static _wasmModule;
    static async load() {
        await scriptLoadingUtility("../../build/wasm-cryptopp.js");
        await CrytpoppWasmModule.rawLoad();
    }
    static async rawLoad() {
        CrytpoppWasmModule._wasmModule = await wasmCryptoppJs({
            locateFile: (url) => {
                console.log(`url: "${url}"`);
                return `../../build/${url}`;
            },
        });
    }
    static get() {
        if (!this._wasmModule)
            throw new Error("crytpopp wasm module not loaded");
        return this._wasmModule;
    }
}

const printHexadecimalStrings$1 = (logger, inHexStr, inStep, inAlign) => {
    const strSize = inHexStr.length.toString();
    let index = 0;
    while (index < inHexStr.length) {
        const currLine = inHexStr.substr(index, inStep);
        let currText = currLine;
        if (index > 0)
            currText = currText.padEnd(inStep, '_');
        const coloredText = logger.makeColor([128, 128, 64], currText);
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

var StrategiesTypes$1;
(function (StrategiesTypes) {
    StrategiesTypes["initialize"] = "initialize";
    StrategiesTypes["create_secure_context"] = "create_secure_context";
    StrategiesTypes["derive_rsa_keys"] = "derive_rsa_keys";
})(StrategiesTypes$1 || (StrategiesTypes$1 = {}));
//
//
//

var StrategiesTypes;
(function (StrategiesTypes) {
    StrategiesTypes["initialize"] = "initialize";
    StrategiesTypes["create_secure_context"] = "create_secure_context";
    StrategiesTypes["generate_diffie_hellman_keys"] = "generate_diffie_hellman_keys";
    StrategiesTypes["compute_diffie_hellman_shared_secret"] = "compute_diffie_hellman_shared_secret";
})(StrategiesTypes || (StrategiesTypes = {}));
//
//
//

const _workerMessageOnce$1 = async (inWorker) => {
    return new Promise((resolve, reject) => {
        const _callback = (message) => {
            inWorker.removeEventListener('message', _callback);
            resolve(message.data);
        };
        try {
            inWorker.addEventListener('message', _callback);
        }
        catch (err) {
            try {
                inWorker.removeEventListener('message', _callback);
            }
            catch (ignored) { }
            reject(err);
        }
    });
};
const _requestWorkerOnce$1 = async (inWorker, inMsg) => {
    inWorker.postMessage(inMsg);
    return await _workerMessageOnce$1(inWorker);
};
const makeInitializeRequest$1 = async (inWorker) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.initialize
});
const makeCreateSecureContextRequest$1 = async (inWorker) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.create_secure_context
});
const makeGenerateDiffieHellmanKeyRequest = async (inWorker, id) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.generate_diffie_hellman_keys, id
});
const makeComputeDiffieHellmanSharedSecretRequest = async (inWorker, id, publicKey) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.compute_diffie_hellman_shared_secret, id, publicKey
});
const isErrorResponse$1 = (inValue) => {
    return (typeof (inValue) === 'object' &&
        inValue.success === false &&
        typeof (inValue.response) === 'object');
};
//
//
//
class DiffieHellmanWorker {
    _workerInstance;
    _secureContextId;
    _publicKey;
    _sharedSecret;
    constructor() {
    }
    async initialize() {
        if (this._workerInstance) {
            return;
        }
        {
            this._workerInstance = new Worker("./dist/worker-diffie-hellman.js");
            const message = await makeInitializeRequest$1(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
        }
        {
            const message = await makeCreateSecureContextRequest$1(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
            this._secureContextId = message.response.id;
        }
    }
    async dispose() {
        if (!this._workerInstance) {
            return;
        }
        this._workerInstance.terminate();
        this._workerInstance = undefined;
        this._secureContextId = undefined;
        this._publicKey = undefined;
        this._sharedSecret = undefined;
    }
    async generateDiffieHellmanKeys() {
        if (!this._workerInstance) {
            throw new Error("worker not initialized");
        }
        if (!this._secureContextId) {
            throw new Error("secure context not initialized");
        }
        const message = await makeGenerateDiffieHellmanKeyRequest(this._workerInstance, this._secureContextId);
        if (isErrorResponse$1(message)) {
            throw new Error(message.response.error);
        }
        this._publicKey = message.response.publicKey;
    }
    async computeDiffieHellmanSharedSecret(publicKey) {
        if (!this._workerInstance) {
            throw new Error("worker not initialized");
        }
        if (!this._secureContextId) {
            throw new Error("secure context not initialized");
        }
        const message = await makeComputeDiffieHellmanSharedSecretRequest(this._workerInstance, this._secureContextId, publicKey);
        if (isErrorResponse$1(message)) {
            throw new Error(message.response.error);
        }
        this._sharedSecret = message.response.sharedSecret;
    }
    get publicKey() {
        return this._publicKey;
    }
    get sharedSecret() {
        return this._sharedSecret;
    }
}

var MessageTypes;
(function (MessageTypes) {
    MessageTypes["PlainMessage"] = "PlainMessage";
    MessageTypes["EncryptedMessage"] = "EncryptedMessage";
    MessageTypes["SecurityRequest"] = "SecurityRequest";
    MessageTypes["SecurityResponse"] = "SecurityResponse";
})(MessageTypes || (MessageTypes = {}));
const isMessage = (inValue) => {
    return (typeof (inValue) === 'object' &&
        typeof (inValue.type) === 'string' &&
        typeof (inValue.payload) === 'string');
};
var EncryptedCommunicationState;
(function (EncryptedCommunicationState) {
    EncryptedCommunicationState[EncryptedCommunicationState["unencrypted"] = 0] = "unencrypted";
    EncryptedCommunicationState[EncryptedCommunicationState["initiated"] = 1] = "initiated";
    EncryptedCommunicationState[EncryptedCommunicationState["ready"] = 2] = "ready";
    EncryptedCommunicationState[EncryptedCommunicationState["confirmed"] = 3] = "confirmed";
})(EncryptedCommunicationState || (EncryptedCommunicationState = {}));
const isSecurityResponsePayload = (inValue) => {
    return (typeof (inValue) === 'object' &&
        typeof (inValue.publicKey) === 'string');
};
const isSecurityRequestPayload = (inValue) => {
    return (isSecurityResponsePayload(inValue) &&
        typeof (inValue.ivValue) === 'string');
};

const getRandomHexStr = (inSize) => {
    const wasmModule = CrytpoppWasmModule.get();
    const prng = new wasmModule.AutoSeededRandomPoolJs();
    const randomHexStr = prng.getRandomHexStr(inSize);
    prng.delete();
    return randomHexStr;
};

const printHexadecimalStrings = (onLogging, inHexStr, inStep) => {
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

//
//
//
//
//
//
class AsyncSecureClient {
    _wasDeleted = false;
    _communication;
    _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
    _onReceiveCallbacks = [];
    _onLogging;
    _workerObtainCipherKey;
    _publicKey;
    _ivValue;
    _sharedSecret;
    _aesSymmetricCipher;
    constructor(inCommunication, inOnLogging) {
        this._communication = inCommunication;
        this._onLogging = inOnLogging;
        const wasmModule = CrytpoppWasmModule.get();
        this._aesSymmetricCipher = new wasmModule.AesSymmetricCipherJs();
        this._communication.onReceive(async (inMsg) => {
            await this._processReceivedMessage(inMsg);
        });
    }
    async initialize() {
        await this._initializeDiffieHellmanWorker();
    }
    delete() {
        this._aesSymmetricCipher.delete();
        this._workerObtainCipherKey?.dispose();
        this._wasDeleted = true;
    }
    async makeSecure() {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        if (!this._workerObtainCipherKey) {
            throw new Error("worker not initialized");
        }
        this._log("now securing the connection");
        this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;
        await this._generateDiffieHellmanKeys();
        this._ivValue = getRandomHexStr(16);
        this._log(`message.response.ivValue`);
        printHexadecimalStrings(this._log.bind(this), this._ivValue, 64);
        const payload = JSON.stringify({
            publicKey: this._publicKey,
            ivValue: this._ivValue,
        });
        this._communication.send(JSON.stringify({ type: MessageTypes.SecurityRequest, payload }));
    }
    send(inText) {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        if (this._EncryptedCommunicationState === EncryptedCommunicationState.initiated) {
            throw new Error("cannot send while securing the connection");
        }
        if (this._EncryptedCommunicationState === EncryptedCommunicationState.unencrypted) {
            this._log(`sending a message:`, "[unencrypted]");
            this._log(`"${inText}"`, "[unencrypted]");
            this._communication.send(JSON.stringify({ type: MessageTypes.PlainMessage, payload: (inText) }));
        }
        else {
            this._log(`sending a message:`, "[encrypted]");
            this._log(`"${inText}"`, "[encrypted]");
            this._log(`encrypting`, "[encrypted]");
            const startTime = Date.now();
            const wasmModule = CrytpoppWasmModule.get();
            const textAshex = wasmModule.utf8ToHex(inText);
            const encrypted = this._aesSymmetricCipher.encryptFromHexStrAsHexStr(textAshex);
            const endTime = Date.now();
            this._log(`encrypted (${endTime - startTime}ms)`, "[encrypted]");
            this._communication.send(JSON.stringify({ type: MessageTypes.EncryptedMessage, payload: encrypted }));
        }
    }
    onReceive(inCallback) {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        this._onReceiveCallbacks.push(inCallback);
    }
    get EncryptedCommunicationState() {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        return this._EncryptedCommunicationState;
    }
    async _initializeDiffieHellmanWorker() {
        this._workerObtainCipherKey = new DiffieHellmanWorker();
        await this._workerObtainCipherKey.initialize();
    }
    async _processReceivedMessage(inText) {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        const jsonMsg = JSON.parse(inText);
        if (!isMessage(jsonMsg)) {
            throw new Error("received message structure unrecognized");
        }
        this._log(`received message, type: "${jsonMsg.type}"`);
        switch (jsonMsg.type) {
            case MessageTypes.PlainMessage:
                {
                    this._onReceiveCallbacks.forEach((callback) => callback(jsonMsg.payload));
                    break;
                }
            case MessageTypes.EncryptedMessage:
                {
                    this._log("decrypting");
                    const startTime = Date.now();
                    const recovered = this._aesSymmetricCipher.decryptFromHexStrAsHexStr(jsonMsg.payload);
                    const wasmModule = CrytpoppWasmModule.get();
                    const plainText = wasmModule.hexToUtf8(recovered);
                    const endTime = Date.now();
                    this._log(`decrypted (${endTime - startTime}ms)`);
                    if (this._EncryptedCommunicationState === EncryptedCommunicationState.ready) {
                        this._log("connection now confirmed secure");
                        this._EncryptedCommunicationState = EncryptedCommunicationState.confirmed;
                    }
                    else if (this._EncryptedCommunicationState !== EncryptedCommunicationState.confirmed) {
                        throw new Error("was expecting to be in a secure state");
                    }
                    this._onReceiveCallbacks.forEach((callback) => callback(plainText));
                    break;
                }
            case MessageTypes.SecurityRequest:
                {
                    this._log("now securing the connection");
                    this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;
                    const jsonPayload = JSON.parse(jsonMsg.payload);
                    if (!isSecurityRequestPayload(jsonPayload)) {
                        throw new Error("received message security request payload unrecognized");
                    }
                    this._ivValue = jsonPayload.ivValue;
                    await this._generateDiffieHellmanKeys();
                    await this._computeDiffieHellmanSharedSecret(jsonPayload.publicKey);
                    await this._initializeAesSymmetricCipher();
                    this._log("sending public key");
                    this._EncryptedCommunicationState = EncryptedCommunicationState.ready;
                    const payload = JSON.stringify({
                        publicKey: this._publicKey,
                    });
                    this._communication.send(JSON.stringify({ type: MessageTypes.SecurityResponse, payload }));
                    break;
                }
            case MessageTypes.SecurityResponse:
                {
                    this._log("processing received security response");
                    if (this._EncryptedCommunicationState !== EncryptedCommunicationState.initiated) {
                        throw new Error("was expecting a security response");
                    }
                    this._log("computing the shared secret with the received public key");
                    const jsonPayload = JSON.parse(jsonMsg.payload);
                    if (!isSecurityResponsePayload(jsonPayload)) {
                        throw new Error("received message security response payload unrecognized");
                    }
                    await this._computeDiffieHellmanSharedSecret(jsonPayload.publicKey);
                    await this._initializeAesSymmetricCipher();
                    this._log("connection now confirmed secure");
                    this._EncryptedCommunicationState = EncryptedCommunicationState.ready;
                    break;
                }
            default:
                throw new Error(`received message type unsupported, type: "${jsonMsg.type}"`);
        }
    }
    _log(inLogMsg, inLogHeader) {
        if (this._onLogging) {
            this._onLogging(inLogMsg, inLogHeader);
        }
    }
    async _generateDiffieHellmanKeys() {
        this._log("------------------------------------");
        this._log("Diffie Hellman Key Exchange");
        this._log("generating public/private keys");
        this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");
        if (!this._workerObtainCipherKey) {
            throw new Error("worker not initialized");
        }
        await this._workerObtainCipherKey.generateDiffieHellmanKeys();
        this._publicKey = this._workerObtainCipherKey.publicKey;
        this._log(`this._publicKey`);
        printHexadecimalStrings(this._log.bind(this), this._publicKey, 64);
        // this._log(`generated public/private keys (${message.response.elapsedTime}ms)`);
        this._log("------------------------------------");
    }
    async _computeDiffieHellmanSharedSecret(publicKey) {
        if (!this._workerObtainCipherKey) {
            throw new Error("worker not initialized");
        }
        this._log(`input publicKey`);
        printHexadecimalStrings(this._log.bind(this), publicKey, 64);
        await this._workerObtainCipherKey.computeDiffieHellmanSharedSecret(publicKey);
        this._sharedSecret = this._workerObtainCipherKey.sharedSecret;
        this._log(`this._sharedSecret`);
        printHexadecimalStrings(this._log.bind(this), this._sharedSecret, 64);
    }
    async _initializeAesSymmetricCipher() {
        if (!this._ivValue) {
            throw new Error("iv value not initialized");
        }
        if (!this._sharedSecret) {
            throw new Error("shared secret not initialized");
        }
        if (!this._workerObtainCipherKey) {
            throw new Error("worker not initialized");
        }
        this._log("------------------------------------");
        this._log("AES Symmetric Cipher");
        this._log("initializing");
        this._log("256bits key from computed shared secret");
        const startTime = Date.now();
        this._aesSymmetricCipher.initializeFromHexStr(this._sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
        this._ivValue);
        const endTime = Date.now();
        this._log(`initialized (${endTime - startTime}ms)`);
        this._log("------------------------------------");
    }
}

const _workerMessageOnce = async (inWorker) => {
    return new Promise((resolve, reject) => {
        const _callback = (message) => {
            inWorker.removeEventListener('message', _callback);
            resolve(message.data);
        };
        try {
            inWorker.addEventListener('message', _callback);
        }
        catch (err) {
            try {
                inWorker.removeEventListener('message', _callback);
            }
            catch (ignored) { }
            reject(err);
        }
    });
};
const _requestWorkerOnce = async (inWorker, inMsg) => {
    inWorker.postMessage(inMsg);
    return await _workerMessageOnce(inWorker);
};
const makeInitializeRequest = async (inWorker) => _requestWorkerOnce(inWorker, {
    type: StrategiesTypes$1.initialize
});
const makeCreateSecureContextRequest = async (inWorker) => _requestWorkerOnce(inWorker, {
    type: StrategiesTypes$1.create_secure_context
});
const makeDeriveRsaKeysRequest = async (inWorker, id, password, keySize) => _requestWorkerOnce(inWorker, {
    type: StrategiesTypes$1.derive_rsa_keys, id, password, keySize
});
const isErrorResponse = (inValue) => {
    return (typeof (inValue) === 'object' &&
        inValue.success === false &&
        typeof (inValue.response) === 'object');
};
//
//
//
class DeriveRsaKeysWorker {
    _workerInstance;
    _secureContextId;
    _privateKeyPem;
    _publicKeyPem;
    constructor() {
    }
    async initialize() {
        if (this._workerInstance) {
            return;
        }
        {
            this._workerInstance = new Worker("./dist/worker-derive-rsa-key.js");
            const message = await makeInitializeRequest(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
        }
        {
            const message = await makeCreateSecureContextRequest(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
            this._secureContextId = message.response.id;
        }
    }
    async dispose() {
        if (!this._workerInstance) {
            return;
        }
        this._workerInstance.terminate();
        this._workerInstance = undefined;
        this._secureContextId = undefined;
        this._privateKeyPem = undefined;
        this._publicKeyPem = undefined;
    }
    async deriveRsaKeys(password, keySize) {
        if (!this._workerInstance) {
            throw new Error("worker not initialized");
        }
        if (!this._secureContextId) {
            throw new Error("secure context not initialized");
        }
        const message = await makeDeriveRsaKeysRequest(this._workerInstance, this._secureContextId, password, keySize);
        if (isErrorResponse(message)) {
            throw new Error(message.response.error);
        }
        this._privateKeyPem = message.response.privateKeyPem;
        this._publicKeyPem = message.response.publicKeyPem;
        return message.response.elapsedTime;
    }
    makeRsaKeyPair() {
        if (!this._privateKeyPem) {
            throw new Error(`no public key derived`);
        }
        if (!this._publicKeyPem) {
            throw new Error(`no public key derived`);
        }
        return new RsaKeyPair(this._privateKeyPem, this._publicKeyPem);
    }
    get privateKeyPem() {
        return this._privateKeyPem;
    }
    get publicKeyPem() {
        return this._publicKeyPem;
    }
}
//
//
//
class RsaKeyPair {
    _privateKey;
    _publicKey;
    _prng;
    constructor(privateKeyPem, publicKeyPem) {
        const wasmModule = CrytpoppWasmModule.get();
        this._prng = new wasmModule.AutoSeededRandomPoolJs();
        this._privateKey = new wasmModule.RSAPrivateKeyJs();
        this._publicKey = new wasmModule.RSAPublicKeyJs();
        this._privateKey.loadFromPemString(privateKeyPem);
        this._publicKey.loadFromPemString(publicKeyPem);
    }
    signPayloadToHexStr(payload) {
        const wasmModule = CrytpoppWasmModule.get();
        const hexPayload = wasmModule.utf8ToHex(payload);
        return this._privateKey.signFromHexStrToHexStrUsingAutoSeeded(this._prng, hexPayload);
    }
    verifyHexStrPayloadToStr(signedHexStrPayload) {
        const wasmModule = CrytpoppWasmModule.get();
        const verifiedHexPayload = this._publicKey.verifyFromHexStrToHexStr(signedHexStrPayload);
        return wasmModule.hexToUtf8(verifiedHexPayload);
    }
}

const k_plainMessagetext = [
    "/!\\",
    "UNENCRYPTED MESSAGE",
    "ANYONE LISTENING CAN SEE IT",
    "/!\\",
].join("\n");
const k_encryptedMessagetext = [
    "(OK)",
    "ENCRYPTED MESSAGE",
    "GOOD LUCK TO ANYONE LISTENING",
    "(OK)",
].join("\n");
const k_securityMessagetext = [
    "(OK)",
    "NO COMPROMISING INFORMATION SHARED",
    "GOOD LUCK TO ANYONE LISTENING",
    "(OK)",
].join("\n");
const logSeparator = (logger, inAlign, jsonMsg) => {
    if (jsonMsg.type === MessageTypes.PlainMessage) {
        logger.alignedLog(inAlign, logger.makeColor([128, 64, 64], k_plainMessagetext));
    }
    else if (jsonMsg.type === MessageTypes.EncryptedMessage) {
        logger.alignedLog(inAlign, logger.makeColor([64, 128, 64], k_encryptedMessagetext));
    }
    else if (jsonMsg.type === MessageTypes.SecurityRequest || jsonMsg.type === MessageTypes.SecurityResponse) {
        logger.alignedLog(inAlign, logger.makeColor([64, 128, 64], k_securityMessagetext));
    }
};
const logMessagePayload = (logger, inAlign, inText) => {
    const jsonMsg = JSON.parse(inText);
    if (isMessage(jsonMsg)) {
        logSeparator(logger, inAlign, jsonMsg);
        logger.alignedLog(inAlign, `type:`);
        logger.alignedLog(inAlign, logger.makeColor([128 + 64, 128 + 64, 64], `"${jsonMsg.type}"`));
        switch (jsonMsg.type) {
            case MessageTypes.PlainMessage:
                logger.alignedLog(inAlign, `payload:`);
                logger.alignedLog(inAlign, logger.makeColor([128 + 64, 64, 64], logger.makeSize(25, `"${jsonMsg.payload}"`)));
                break;
            default: {
                try {
                    const jsonSecMsg = JSON.parse(jsonMsg.payload);
                    if (isSecurityRequestPayload(jsonSecMsg)) {
                        logger.alignedLog(inAlign, `payload.publicKey:`);
                        printHexadecimalStrings$1(logger, jsonSecMsg.publicKey, 64, inAlign);
                        logger.alignedLog(inAlign, `payload.ivValue:`);
                        printHexadecimalStrings$1(logger, jsonSecMsg.ivValue, 64, inAlign);
                    }
                    else if (isSecurityResponsePayload(jsonSecMsg)) {
                        logger.alignedLog(inAlign, `payload.publicKey:`);
                        printHexadecimalStrings$1(logger, jsonSecMsg.publicKey, 64, inAlign);
                    }
                    else {
                        logger.alignedLog(inAlign, `payload:`);
                        printHexadecimalStrings$1(logger, jsonMsg.payload, 64, inAlign);
                    }
                }
                catch {
                    logger.alignedLog(inAlign, `payload:`);
                    printHexadecimalStrings$1(logger, jsonMsg.payload, 64, inAlign);
                }
                break;
            }
        }
        logSeparator(logger, inAlign, jsonMsg);
    }
    else {
        logger.alignedLog(inAlign, `"${inText}"`);
    }
};

class FakeWebSocket {
    _logger;
    _logTextAlign;
    _myName;
    _otherName;
    _transitionStr;
    _allSentMessages = [];
    _allOnReceiveCallbacks = [];
    constructor(inLogger, inLogTextAlign, inMyName, inOtherName) {
        this._logger = inLogger;
        this._logTextAlign = inLogTextAlign;
        this._myName = inMyName;
        this._otherName = inOtherName;
        this._transitionStr = inLogTextAlign === "right" ? "<-----" : "----->";
    }
    send(inText) {
        this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" sent a message\n`);
        this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
        logMessagePayload(this._logger, 'center', inText);
        this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
        this._logger.alignedLog("center", "\n");
        this._allSentMessages.push(inText);
    }
    async receive(inText) {
        this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" received a message`);
        for (const callback of this._allOnReceiveCallbacks) {
            await callback(inText);
        }
    }
    onReceive(inCallback) {
        this._allOnReceiveCallbacks.push(inCallback);
    }
    async pipeMessages(other) {
        for (const inText of this._allSentMessages) {
            await other.receive(inText);
        }
        this._allSentMessages.length = 0;
    }
    hasMessageToSend() {
        return this._allSentMessages.length > 0;
    }
}

const runLogic = async (logger) => {
    logger.logCenter(logger.makeColor([128, 128, 0], logger.makeSize(30, logger.makeBorder("Derive RSA Keys from password"))));
    CrytpoppWasmModule.get();
    const deriveRsaKeysWorker = new DeriveRsaKeysWorker();
    await deriveRsaKeysWorker.initialize();
    // const keySize = 1024 * 3;
    const keySize = 1024 * 1;
    logger.logCenter(logger.makeBorder(`Test1, Password: "pineapple", Key Size: ${keySize}`));
    let elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pineapple", keySize);
    logger.logCenter(deriveRsaKeysWorker.privateKeyPem);
    logger.logCenter(deriveRsaKeysWorker.publicKeyPem);
    logger.logCenter(logger.makeBorder(`Test1 elapsedTime: ${elapsedTime}ms`));
    const rsaKeyPairTest1 = deriveRsaKeysWorker.makeRsaKeyPair();
    logger.logCenter(logger.makeBorder(`Test2, Password: "pen", Key Size: ${keySize}`));
    elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pen", keySize);
    logger.logCenter(deriveRsaKeysWorker.privateKeyPem);
    logger.logCenter(deriveRsaKeysWorker.publicKeyPem);
    logger.logCenter(logger.makeBorder(`Test2 elapsedTime: ${elapsedTime}ms`));
    deriveRsaKeysWorker.makeRsaKeyPair();
    logger.logCenter(logger.makeBorder(`Test3, Password: "pineapple", Key Size: ${keySize}`));
    elapsedTime = await deriveRsaKeysWorker.deriveRsaKeys("pineapple", keySize);
    logger.logCenter(deriveRsaKeysWorker.privateKeyPem);
    logger.logCenter(deriveRsaKeysWorker.publicKeyPem);
    logger.logCenter(logger.makeBorder(`Test3 elapsedTime: ${elapsedTime}ms`));
    const rsaKeyPairTest3 = deriveRsaKeysWorker.makeRsaKeyPair();
    //
    logger.logCenter(logger.makeBorder(`Sign payload with Test1 private key`));
    const payload = 'LOL';
    const signedPayload = rsaKeyPairTest1.signPayloadToHexStr(payload);
    logger.logCenter(`\npayload: "${payload}"`);
    logger.logCenter(`\nsignedPayload`);
    printHexadecimalStrings$1(logger, signedPayload, 64, 'center');
    logger.logCenter(logger.makeBorder(`Verify payload with Test3 public key (same password)`));
    const verifiedPayload = rsaKeyPairTest3.verifyHexStrPayloadToStr(signedPayload);
    logger.logCenter(`\nverifiedPayload: "${verifiedPayload}"`);
    logger.logCenter(logger.makeColor([128, 128, 0], logger.makeSize(30, logger.makeBorder(`Derive RSA Keys from password`))));
    logger.logCenter(logger.makeColor([128, 128, 0], logger.makeSize(30, logger.makeBorder("Secure Connection Test"))));
    const clientA_str = logger.makeColor([128 + 64, 128, 128], "Client A");
    const clientB_str = logger.makeColor([128, 128, 128 + 64], "Client B");
    //
    //
    //
    const fakeWebSocketA = new FakeWebSocket(logger, 'left', clientA_str, clientB_str);
    const fakeWebSocketB = new FakeWebSocket(logger, 'right', clientB_str, clientA_str);
    //
    //
    //
    logger.logCenter(logger.makeBorder(`initialize`));
    const onLogA = (inLogMsg, inLogHeader) => {
        if (inLogHeader) {
            logger.logLeft(`${inLogHeader} ${inLogMsg}`);
        }
        else {
            logger.logLeft(inLogMsg);
        }
    };
    const onLogB = (inLogMsg, inLogHeader) => {
        if (inLogHeader) {
            logger.logRight(`${inLogMsg} ${inLogHeader}`);
        }
        else {
            logger.logRight(inLogMsg);
        }
    };
    logger.logLeft(`${clientA_str} created`);
    const clientA = new AsyncSecureClient(fakeWebSocketA, onLogA);
    logger.logRight(`${clientB_str} created`);
    const clientB = new AsyncSecureClient(fakeWebSocketB, onLogB);
    clientA.onReceive(async (inText) => {
        logger.alignedLog("left", `${clientA_str} received:`);
        logger.alignedLog("left", logger.makeColor([64, 128 + 64, 64], logger.makeSize(25, `"${inText}"`)));
        logger.alignedLog("left", `\n`);
    });
    clientB.onReceive(async (inText) => {
        logger.alignedLog("right", `${clientB_str} received:`);
        logger.alignedLog("right", logger.makeColor([64, 128 + 64, 64], logger.makeSize(25, `"${inText}"`)));
        logger.alignedLog("right", `\n`);
    });
    await Promise.all([
        clientA.initialize(),
        clientB.initialize(),
    ]);
    //
    //
    //
    logger.logCenter(logger.makeBorder(`[unencrypted] Client A send to Client B`));
    logger.logLeft(`${clientA_str} now sending a message:`);
    const messageToSend = "Hello, is this safe?";
    logger.alignedLog("left", logger.makeColor([64, 128 + 64, 64], logger.makeSize(25, `"${messageToSend}"`)));
    logger.log(`\n`);
    clientA.send(messageToSend);
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    logger.logCenter(logger.makeBorder(`[unencrypted] Client B send to Client A`));
    logger.logRight(`${clientB_str} now sending a message:`);
    const messageToReply = "Hi, no... it isn't safe...";
    logger.alignedLog("right", logger.makeColor([64, 128 + 64, 64], logger.makeSize(25, `"${messageToReply}"`)));
    logger.log(`\n`);
    clientB.send(messageToReply);
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    //
    //
    logger.logCenter(logger.makeBorder(`Client A send request for encryption to Client B`));
    await clientA.makeSecure();
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    logger.logCenter(logger.makeBorder(`Client B sent a reply for encryption to Client B`));
    logger.logCenter(logger.makeBorder(`Both Client A and Client B can now encrypt/decrypt each other messages`));
    //
    logger.logCenter(logger.makeBorder(`[encrypted] Client A send to Client B`));
    logger.logLeft(`${clientA_str} now sending a message:`);
    const newMessageToSend = "Let's try again, safe now?";
    logger.alignedLog("left", logger.makeColor([64, 128 + 64, 64], logger.makeSize(25, `"${newMessageToSend}"`)));
    logger.log(`\n`);
    clientA.send(newMessageToSend);
    await fakeWebSocketA.pipeMessages(fakeWebSocketB);
    logger.logCenter(logger.makeBorder(`[encrypted] Client B send to Client A`));
    logger.logRight(`${clientB_str} now sending a message:`);
    const newMessageToReply = "I'd say we're pretty safe right now :)";
    logger.alignedLog("right", logger.makeColor([64, 128 + 64, 64], logger.makeSize(25, `"${newMessageToReply}"`)));
    logger.log(`\n`);
    clientB.send(newMessageToReply);
    await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    //
    //
    //
    clientA.delete();
    clientB.delete();
    logger.logCenter(logger.makeColor([128, 128, 0], logger.makeSize(30, logger.makeBorder(`Secure Connection Test`))));
};

/// <reference no-default-lib="true"/>
// import { AsyncSecureClient } from "./logic/AsyncSecureClient";
const findOrFailHtmlElement = (inId) => {
    const htmlElement = document.querySelector(inId);
    if (!htmlElement)
        throw new Error(`DOM elements not found, id: "${inId}"`);
    return htmlElement;
};
window.onload = async () => {
    const testStartTime = Date.now();
    const loggerOutput = findOrFailHtmlElement("#loggerOutput");
    const logger = new Logger(loggerOutput);
    logger.logCenter("page loaded");
    logger.logCenter(logger.makeColor([255, 0, 0], "\n\nSTART\n\n"));
    logger.logCenter(" loading worker-obtain-cipher-key");
    //
    //
    //
    logger.logCenter(" loading worker-symmetric-cipher");
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
    logger.logCenter(logger.makeColor([255, 0, 0], `\n\nSTOP (${testEndTime - testStartTime}ms)\n\n`));
};
